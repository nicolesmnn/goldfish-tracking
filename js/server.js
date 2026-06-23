const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();

// CORS erlaubt nun deinen lokalen PC UND später deine echte Online-Webseite
const allowedOrigins = [
    'http://127.0.0.1:5500', 
    'http://localhost:5500',
    /\.onrender\.com$/ // Erlaubt automatisch alle Subdomains von Render (für deine Live-Seite)
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.some(regex => typeof regex === 'string' ? regex === origin : regex.test(origin))) {
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

function readData() {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        const content = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        return [];
    }
}

// A. EMPFÄNGER FÜR DIE BEACON-DATEN
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

    fs.writeFileSync(DATA_FILE, JSON.stringify(logs, null, 2));
    res.sendStatus(204); 
});

// B. SENDER FÜR DAS DASHBOARD
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

// WICHTIG: Nutzt den Port des Webhosters (process.env.PORT) oder Fallback 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend läuft auf Port ${PORT}`);
});