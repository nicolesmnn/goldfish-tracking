// GSAP ScrollTrigger Plugin registrieren
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// EINMALIGE USER-ID GENERIERUNG
// ==========================================
if (!localStorage.getItem('trackingUserId')) {
    const randomId = 'usr_' + Math.random().toString(36).substring(2, 5).toUpperCase();
    localStorage.setItem('trackingUserId', randomId);
}

// 1. DATEN & ELEMENTE
const facts = [
    { num: "01", title: "8 SEKUNDEN", text: "Der Goldfisch-Mythos: Angeblich ist unsere Aufmerksamkeitsspanne auf 8 Sekunden gesunken. Kürzer als die eines Goldfisches." },
    { num: "02", title: "DOOM SCROLLING", text: "Warum du nicht aufhören kannst? Unendliche Feeds manipulieren dein Dopaminsystem wie ein Spielautomat." },
    { num: "03", title: "MULTI-TASKING LÜGE", text: "Task-Switching kostet das Gehirn enorm viel Energie. Wer ständig wechselt, verliert bis zu 40% seiner Produktivität." },
    { num: "04", title: "PHANTOM VIBRATION", text: "Bis zu 80% der Menschen spüren ihr Handy vibrieren, obwohl gar nichts passiert. Unser Gehirn ist hyper-alarmiert." },
    { num: "05", title: "174 ZEITUNGEN", text: "Wir konsumieren heute täglich so viele Daten, wie in 174 dicke Zeitungen passen würden. Kein Wunder, dass das Gehirn oft streikt." },
    { num: "06", title: "23 MINUTEN", text: "So lange braucht dein Gehirn, um nach einer einzigen Unterbrechung (wie einer Push-Nachricht) wieder volle Konzentration aufzubauen." },
    { num: "07", title: "TIKTOK BRAIN", text: "Kurze, hyper-stimulierende Videos trainieren das Gehirn auf sofortige Belohnung. Längere Inhalte werden unerträglich." }
];

const feed = document.getElementById('feed');
const pageLoadTime = Date.now();

// TELEMETRIE-OBJEKT
const telemetryData = {
    userId: localStorage.getItem('trackingUserId'), 
    userConsent: localStorage.getItem('userConsent') || 'unknown',
    timeSpentOnPage: 0,
    tabSwitches: 0,
    sectionsDiscovered: [],
    rageClicks: 0
};

// 2. RENDERING FEED
if (feed) {
    facts.forEach(fact => {
        const post = document.createElement('article');
        post.className = 'post item';
        post.id = `section-${fact.num}`;
        post.innerHTML = `
            <div class="post-header">
                <span class="post-avatar">🧠</span>
                <div>
                    <strong>Brain Overload Project</strong><br>
                    <span class="post-time">Gerade eben</span>
                </div>
            </div>
            <h2 class="post-title">${fact.title}</h2>
            <p class="post-text">${fact.text}</p>
            <div class="post-actions">
                <button class="action-btn">⚡ Spannen</button>
                <button class="action-btn">🔄 Schleife</button>
            </div>
        `;
        feed.appendChild(post);
    });
}

// 3. CONSENT OVERLAY
function handleConsent(agreed) {
    localStorage.setItem('userConsent', agreed ? 'granted' : 'denied');
    telemetryData.userConsent = agreed ? 'granted' : 'denied';
    const overlay = document.getElementById('consentOverlay');
    if (overlay) overlay.style.display = 'none';
}

if (localStorage.getItem('userConsent')) {
    const overlay = document.getElementById('consentOverlay');
    if (overlay) overlay.style.display = 'none';
}

// 4. ANIMATIONEN (GSAP & SCROLLTRIGGER)
gsap.from(".hero-title", { opacity: 0, y: 100, duration: 1, ease: "power4.out" });
gsap.from(".hero-subtitle", { opacity: 0, y: 50, duration: 1, delay: 0.3, ease: "power4.out" });

const items = document.querySelectorAll('.item');
const observerOptions = { threshold: 0.2 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, observerOptions);
items.forEach(item => observer.observe(item));

// Scroll Progress Line
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progressLine = document.querySelector('.progress-line');
    if (progressLine) progressLine.style.width = scrolled + "%";
});

// 5. INFECTED BUTTON (FLÜCHTENDER BUTTON)
const panicBtn = document.getElementById('panicBtn');
let escapeCount = 0;
let hasClickedPanic = false;

if (panicBtn) {
    // mouseover für PC, touchstart für Smartphones
    const fleeLogic = () => {
        if (escapeCount < 5) {
            const x = Math.random() * 200 - 100;
            const y = Math.random() * 140 - 70;
            gsap.to(panicBtn, { x: x, y: y, duration: 0.2, ease: "power1.out" });
            escapeCount++;
        } else if (!hasClickedPanic) {
            panicBtn.textContent = "OK, KLICK MICH...";
            panicBtn.style.background = "var(--alert-red)";
            hasClickedPanic = true;
        }
    };

    panicBtn.addEventListener('mouseover', fleeLogic);
    panicBtn.addEventListener('touchstart', (e) => {
        if (escapeCount < 5) e.preventDefault(); // Verhindert ungewolltes Zoomen/Klicken beim Flüchten
        fleeLogic();
    });

    panicBtn.addEventListener('click', () => {
        if (hasClickedPanic) {
            telemetryData.rageClicks++;
            const msg = document.getElementById('panicMsg');
            if (msg) msg.textContent = `Fehler. System überlastet. Klicks registriert: ${telemetryData.rageClicks}`;
        }
    });
}

// 6. INTERSECTION OBSERVER FÜR TELEMETRIE
const trackingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id || entry.target.className;
            if (!telemetryData.sectionsDiscovered.includes(sectionId)) {
                telemetryData.sectionsDiscovered.push(sectionId);
            }
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('main, section, footer, article').forEach(sec => trackingObserver.observe(sec));

// Live-Zählung von Tab-Wechseln am PC & Handy
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        telemetryData.tabSwitches++;
    }
});

// ==========================================
// OPTIMIERTES SENDEN (FÜR SMARTPHONES)
// ==========================================
function sendTelemetry() {
    telemetryData.timeSpentOnPage = Math.floor((Date.now() - pageLoadTime) / 1000);
    const jsonString = JSON.stringify(telemetryData);
    
    // Tausche diese URL mit deiner echten Render-Backend-URL aus!
    const targetUrl = "https://DEIN-ECHTES-BACKEND.onrender.com/api/harvest";

    // Methode 1: Versuche es mit dem schnellen Beacon
    const blob = new Blob([jsonString], { type: 'application/json' });
    const success = navigator.sendBeacon(targetUrl, blob);
    
    // Methode 2: Wenn der Beacon fehlschlägt oder wir auf einem Smartphone sind, 
    // nutzen wir fetch mit "keepalive", um den Prozess im Hintergrund zu erzwingen
    if (!success) {
        fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonString,
            keepalive: true // Hält die Verbindung auch nach Tab-Schließen offen!
        }).catch(() => {});
    }
}

// Die sichersten Event-Listener für Smartphones (Senden beim Wechseln/Schließen)
window.addEventListener("visibilitychange", () => { 
    if (document.visibilityState === "hidden") {
        sendTelemetry();
    }
});
window.addEventListener("pagehide", sendTelemetry);

// WICHTIG: Wenn jemand am Handy auf den Link "AUSWERTUNG" klickt, senden wir sofort synchron
document.addEventListener("DOMContentLoaded", () => {
    const auswertungBtn = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent.includes('AUSWERTUNG'));
    if (auswertungBtn) {
        auswertungBtn.addEventListener('click', (e) => {
            sendTelemetry();
        });
    }
});

// 7. COUNTER VARIABLEN FÜR TELEMETRIE
let startTime = Date.now();
let totalPixelTravelled = 0;
let hasClickedPanic = false;

document.addEventListener('mousemove', (e) => {
    totalPixelTravelled += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
});

// 8. DOPAMIN MÜHLE LOGIK (EMOJIS)
const millBox = document.getElementById('millBox');
const dopamineFeed = [
    { text: "Ein virales Katzenvideo 🐱", visual: "<span class='mill-emoji'>🐱 SCREENSHOT 🐱</span>" },
    { text: "Jemand ist im Internet wütend 😡", visual: "<span class='mill-emoji'>🤬 ALERT 🤬</span>" },
    { text: "Ein tanzender Teenie auf TikTok 🕺", visual: "<span class='mill-emoji'>🔥 TRENDING 🔥</span>" },
    { text: "Dieser Klick wird dein Leben verändern ⚡", visual: "<span class='mill-emoji'>⚡ 100% DOPAMIN ⚡</span>" },
    { text: "Werbung für Socken, die du gestern gesucht hast 🧦", visual: "<span class='mill-emoji'>💸 BUY NOW 💸</span>" }
];

if (millBox) {
    millBox.addEventListener('scroll', () => {
        const isAtBottom = millBox.scrollHeight - millBox.scrollTop <= millBox.clientHeight + 50;
        
        if (isAtBottom) {
            const currentItem = dopamineFeed[Math.floor(Math.random() * dopamineFeed.length)];
            const newItem = document.createElement('div');
            newItem.className = 'mill-item';
            
            newItem.innerHTML = `
                <p class="mill-item-text">${currentItem.text}</p>
                ${currentItem.visual}
            `;
            
            millBox.appendChild(newItem);

            gsap.fromTo(newItem, 
                { scale: 0.6, opacity: 0, backgroundColor: "rgb(255, 111, 0)" }, 
                { scale: 1, opacity: 1, backgroundColor: "#1a1a1a", duration: 0.25, ease: "back.out(1.4)" }
            );

            if (millBox.children.length === 15) {
                const banner = document.createElement('div');
                banner.style = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:red; color:white; font-size:4rem; font-weight:900; padding:20px 40px; z-index:10000; border:10px solid black; text-align:center; box-shadow: 15px 15px 0px #000; font-family: sans-serif;";
                banner.innerText = "BIST DU JETZT GLÜCKLICH?";
                document.body.appendChild(banner);

                gsap.from(banner, { scale: 0, rotation: 720, ease: "back.out(1.5)", duration: 0.5 });
                gsap.to(banner, { scale: 0, opacity: 0, delay: 2.5, duration: 0.3, onComplete: () => banner.remove() });
            }
        }
    });
}

// 9. IMPULSKONTROLLE LOGIK (HOVER RUNAWAY)
const panicBtn = document.getElementById('panicBtn');
const panicMsg = document.getElementById('panicMsg');
let clickCount = 0;

function makeButtonFlee() {
    panicMsg.innerText = "";
    panicBtn.innerText = "FANG MICH DOCH!";
    gsap.set(panicBtn, { backgroundColor: "orange" });
    
    let randomX = Math.floor((Math.random() - 0.5) * 450);
    let randomY = Math.floor((Math.random() - 0.5) * 300);
    
    gsap.to(panicBtn, { x: randomX, y: randomY, duration: 0.1, ease: "power2.out" });
}

if (panicBtn) {
    panicBtn.addEventListener('click', () => {
        if (clickCount >= 2) return; 
        clickCount++;
        hasClickedPanic = true;

        if (clickCount === 1) {
            panicMsg.innerText = "Ernsthaft? Keine Selbstbeherrschung.";
            gsap.fromTo(panicMsg, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "bounce.out" });
        } 
        else if (clickCount === 2) {
            panicMsg.innerText = "Hör auf zu klicken! Geh weiter!";
            gsap.to(panicBtn, { 
                x: "+=12", yoyo: true, repeat: 7, duration: 0.04, 
                onComplete: () => {
                    gsap.set(panicBtn, { x: 0 });
                    makeButtonFlee();
                    startHoverRunaway();
                } 
            });
        }
    });
}

function startHoverRunaway() {
    panicBtn.addEventListener('mouseenter', makeButtonFlee);
    panicBtn.addEventListener('touchstart', (e) => { e.preventDefault(); makeButtonFlee(); });
}

// 11. TRACKING MIT BEACON, PAGE VISIBILITY & INTERSECTION OBSERVER
const telemetryData = {
    userConsent: localStorage.getItem('userConsent') || 'unknown',
    timeSpentOnPage: 0,
    tabSwitches: 0,
    sectionsDiscovered: [],
    rageClicks: 0
};

const pageLoadTime = Date.now();

// Trackt Tabs-Wechsel live im Frontend
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        telemetryData.tabSwitches++;
        console.log(`Tab gewechselt. Anzahl: ${telemetryData.tabSwitches}`);
    }
});

// Zählt Klicks auf den flüchtenden Button als Wut-Klicks
if (panicBtn) {
    panicBtn.addEventListener('click', () => { if(hasClickedPanic) telemetryData.rageClicks++; });
}

// Intersection Observer trackt gesehene Bereiche
const trackingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id || entry.target.className;
            if (!telemetryData.sectionsDiscovered.includes(sectionId)) {
                telemetryData.sectionsDiscovered.push(sectionId);
                console.log(`Sektion erfasst: ${sectionId}`);
            }
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('main, section, footer').forEach(sec => trackingObserver.observe(sec));

// DREI-WEGE-DATENSENDER AN DAS BACKEND (PORT 3000)
function sendTelemetry() {
    telemetryData.timeSpentOnPage = Math.floor((Date.now() - pageLoadTime) / 1000);
    const blob = new Blob([JSON.stringify(telemetryData)], { type: 'application/json' });
    navigator.sendBeacon("http://localhost:3000/api/harvest", blob);
}

window.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") sendTelemetry(); });
window.addEventListener("pagehide", sendTelemetry);

document.addEventListener("DOMContentLoaded", () => {
    const auswertungBtn = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent.includes('AUSWERTUNG'));
    if (auswertungBtn) {
        auswertungBtn.addEventListener("click", () => { sendTelemetry(); });
    }
});