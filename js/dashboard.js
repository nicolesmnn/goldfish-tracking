// --- DASHBOARD API LOGIK ---

// Diese Funktion lädt die echten Daten vom Node-Server (Port 3000)
async function fetchTrackingData() {
    try {
        const response = await fetch('http://localhost:3000/api/stats');
        
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        
        const data = await response.json();
        updateDashboard(data);

    } catch (error) {
        console.error("API Error:", error);
        document.getElementById('tableBody').innerHTML = `<tr><td colspan="4" style="color:red; text-align:center; font-weight:bold; padding:20px;">API OFFLINE. FATAL ERROR.</td></tr>`;
    }
}

// Füllt die HTML-Elemente des Dashboards mit den geladenen Daten
function updateDashboard(data) {
    // 1. Oben die dicken Werte füllen
    document.getElementById('val-users').textContent = data.overview.totalUsers;
    document.getElementById('val-time').textContent = data.overview.avgTimeSeconds + "s";
    document.getElementById('val-fails').textContent = data.overview.failedFocusChecks;
    document.getElementById('val-rage').textContent = data.overview.rageClicks;

    // 2. Die Tabelle mit den neuesten Logs befüllen
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ''; 

    if (!data.recentLogs || data.recentLogs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:15px;">Noch keine Daten vorhanden. Mach ein paar Tests!</td></tr>`;
        return;
    }

    data.recentLogs.forEach(log => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${log.time}</td>
            <td>${log.user}</td>
            <td>${log.action}</td>
            <td>${log.scroll}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Startet den Abruf, sobald das Dashboard lädt
document.addEventListener('DOMContentLoaded', fetchTrackingData);