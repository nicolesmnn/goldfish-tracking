const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();

// Globaler In-Memory-Speicher, falls das Schreiben in Dateien auf Render blockiert wird
let globalLogs = [];

app.use(cors({
    origin: function (origin, callback) {
        // Erlaubt absolut jede Quelle im Testbetrieb, um CORS-Fehler zu 100% auszuschließen
        callback(null, true);
    },
    credentials: true 
}));

app.use(express.json()); 
app.use(express.text({ type: '*/*' })); 

const DATA_FILE = './daten.json';

// Hilfsfunktion zum sicheren Laden
function readData() {
    if (globalLogs.length > 0) return globalLogs;

    try {
        if (fs.existsSync(DATA_FILE)) {
            const content = fs.readFileSync(DATA_FILE, 'utf8');
            globalLogs = JSON.parse(content || '[]');
            return globalLogs;
        }
    } catch (e) {
        console.error("Fehler beim Lesen:", e);
    }
    return [];
}

// A. EMPFÄNGER FÜR DIE BEACON-DATEN (VON SCRIPT.JS)
app.post('/api/harvest', (req, res) => {
    let logs = readData();
    
    // 👑 NEU: Zwingt den Server, die exakte mitteleuropäische Uhrzeit (Berlin/Wien) zu nutzen
    const now = new Date().toLocaleTimeString('de-DE', { timeZone: 'Europe/Vienna' });

    let data = req.body;
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            data = {};
        }
    }
    
    data = data || {};
    const userId = data.userId || 'usr_UNKNOWN';
    const sections = data.sectionsDiscovered || [];

    let finalAction = "Read Content";
    if (data.tabSwitches > 0) finalAction = `Tab Switched (${data.tabSwitches}x)`;
    if (data.rageClicks > 0) finalAction = `Rage Click Triggered`;

    const incomingLog = {
        time: now, // Nutzt die korrigierte Uhrzeit
        user: userId,
        action: finalAction, 
        scroll: sections.length > 0 ? (sections.length * 75) + "vh" : "0vh",
        timeSpent: Number(data.timeSpentOnPage) || 0,
        wasPanic: data.rageClicks > 0 ? 1 : 0,
        wasFail: data.tabSwitches > 0 ? 1 : 0
    };

    const existingLogIndex = logs.findIndex(log => log.user === userId);

    if (existingLogIndex !== -1) {
        logs[existingLogIndex] = incomingLog;
    } else {
        logs.push(incomingLog);
    }

    globalLogs = logs;

    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(logs, null, 2));
    } catch (err) {
        console.log("Hinweis: Datei-Schreiben blockiert, nutze RAM-Speicher.");
    }

    console.log(`[LIVE-LOG] Daten empfangen für: ${userId} um ${now}`);
    res.sendStatus(204); 
});

// B. SENDER FÜR DAS DASHBOARD (AN DASHBOARD.JS)
app.get('/api/stats', (req, res) => {
    const logs = readData();
    const totalUsers = logs.length;
    const avgTime = totalUsers > 0 ? Math.round(logs.reduce((acc, curr) => acc + curr.timeSpent, 0) / totalUsers) : 0;
    
    const dashboardData = {
        overview: {
            totalUsers: totalUsers,
            avgTimeSeconds: avgTime,
            failedFocusChecks: logs.filter(l => l.wasFail > 0).length,
            rageClicks: logs.filter(l => l.wasPanic > 0).length
        },
        recentLogs: logs.slice(-10).reverse()
    };

    res.json(dashboardData);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API läuft auf Port ${PORT}`);
});