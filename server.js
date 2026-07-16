require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');

const app = express();

app.use(cors({
    origin: function (origin, callback) { callback(null, true); },
    credentials: true 
}));

app.use(express.json()); 
app.use(express.text({ type: '*/*' })); 

// MARIADB VERBINDUNGS-POOL
const pool = mariadb.createPool({
     host: process.env.DB_HOST, 
     user: process.env.DB_USER, 
     password: process.env.DB_PASSWORD,
     database: process.env.DB_NAME,
     port: process.env.DB_PORT || 3306,
     connectionLimit: 5
});

// A. EMPFÄNGER FÜR DIE BEACON-DATEN
app.post('/api/harvest', async (req, res) => {
    // Erzeugt ein perfektes SQL-Format: YYYY-MM-DD HH:MM:SS in unserer Zeitzone
    const options = { timeZone: 'Europe/Vienna', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const formatter = new Intl.DateTimeFormat('de-AT', options);
    const parts = formatter.formatToParts(new Date());
    
    const p = Object.fromEntries(parts.map(part => [part.type, part.value]));
    const sqlDateTime = `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;

    let data = req.body;
    if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) { data = {}; }
    }
    
    data = data || {};
    const userId = data.userId || 'usr_UNKNOWN';
    const sections = data.sectionsDiscovered || [];

    let finalAction = "Read Content";
    if (data.tabSwitches > 0) finalAction = `Tab Switched (${data.tabSwitches}x)`;
    if (data.rageClicks > 0) finalAction = `Rage Click Triggered`;

    const scrollDepth = sections.length > 0 ? (sections.length * 75) + "vh" : "0vh";
    const timeSpent = Number(data.timeSpentOnPage) || 0;
    const wasPanic = data.rageClicks > 0 ? 1 : 0;
    const wasFail = data.tabSwitches > 0 ? 1 : 0;

    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            INSERT INTO tracking_logs (time, user, action, scroll, timeSpent, wasPanic, wasFail)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                time = VALUES(time),
                action = VALUES(action),
                scroll = VALUES(scroll),
                timeSpent = VALUES(timeSpent),
                wasPanic = VALUES(wasPanic),
                wasFail = VALUES(wasFail)
        `;
        await conn.query(query, [sqlDateTime, userId, finalAction, scrollDepth, timeSpent, wasPanic, wasFail]);
        console.log(`[DB-SAVE] Permanent gesichert für: ${userId} (${sqlDateTime})`);
    } catch (err) {
        console.error("Datenbank-Schreibfehler:", err);
    } finally {
        if (conn) conn.release();
    }
    res.sendStatus(204); 
});

// B. SENDER FÜR DAS DASHBOARD
app.get('/api/stats', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const logs = await conn.query("SELECT * FROM tracking_logs");
        
        const totalUsers = logs.length;
        const avgTime = totalUsers > 0 ? Math.round(logs.reduce((acc, curr) => acc + curr.timeSpent, 0) / totalUsers) : 0;
        
        const dashboardData = {
            overview: {
                totalUsers: totalUsers,
                avgTimeSeconds: avgTime,
                failedFocusChecks: logs.filter(l => l.wasFail > 0).length,
                rageClicks: logs.filter(l => l.wasPanic > 0).length
            },
            recentLogs: logs.slice(-10).reverse().map(l => {
                // Formatiert das SQL-Datum in eine schöne Anzeige für deine Tabelle: "DD.MM.YYYY, HH:MM:SS"
                const jsDate = new Date(l.time);
                const formattedTime = jsDate.toLocaleString('de-DE', { timeZone: 'Europe/Vienna' });
                return {
                    time: formattedTime,
                    user: l.user,
                    action: l.action,
                    scroll: `${l.timeSpent} Sek.`
                };
            })
        };
        res.json(dashboardData);
    } catch (err) {
        console.error("Datenbank-Lesefehler:", err);
        res.status(500).json({ error: "Datenbankfehler" });
    } finally {
        if (conn) conn.release();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`🚀 API aktiv auf Port ${PORT}`); });