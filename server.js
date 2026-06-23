const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();

// Einfache, absolut stabile CORS-Prüfung
app.use(cors({
    origin: function (origin, callback) {
        // Wenn kein Origin da ist (z.B. Server-zu-Server) oder es von Localhost / Render kommt
        if (!origin || 
            origin.includes('localhost') || 
            origin.includes('127.0.0.1') || 
            origin.includes('.onrender.com')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true 
}));

app.use(express.json()); 
app.use(express.text({ type: '*/*' })); 

const DATA_FILE = './daten.json';

// Hilfsfunktion: Stellt sicher, dass das Verzeichnis beschreibbar ist
function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
            return [];
        }
        const content = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(content || '[]');
    } catch (e) {
        console.error("Fehler beim Lesen der JSON:", e);
        return [];
    }
}

// A. EMPFÄNGER FÜR DIE BEACON-DATEN (VON SCRIPT.JS)
app.post('/api/harvest', (req, res) => {
    let logs = readData();
    const now = new Date().toLocaleTimeString('de-DE');

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
        time: now,
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

    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(logs, null, 2));
        console.log(`[SUCCESS] Daten für ${userId} verarbeitet.`);
    } catch (err) {
        console.error("Schreibfehler:", err);
    }

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

// Server starten (Port-Zuweisung für Render optimiert)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Tracking Backend läuft stabil auf Port ${PORT}`);
});