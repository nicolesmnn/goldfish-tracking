// GSAP ScrollTrigger Plugin registrieren (falls vorhanden)
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

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
    { num: "07", title: "TIKTOK BRAIN", text: "Endlose Kurzvideos programmieren das Gehirn auf sofortige Belohnung um. Langsame, tiefe Gedankengänge werden physisch anstrengender." },
    { num: "08", title: "DIGITAL AMNESIA", text: "Das Gehirn lagert Erinnerungen ans Smartphone aus. Was wir sofort ergoogeln können, speichern wir biologisch nicht mehr ab." },
    { num: "09", title: "F-PATTERN", text: "Wir lesen Texte am Bildschirm nicht mehr, wir scannen sie nur noch grob in einer F-Form. Tiefes Textverständnis geht massiv verloren." },
    { num: "10", title: "BLAULICHT KATER", text: "Bildschirme vor dem Schlafen killen die Melatonin-Produktion. Der fehlende Tiefschlaf zerstört die Konzentration für den gesamten nächsten Tag." }
];

const section = document.getElementById('wheelSection');
const wheel = document.getElementById('spinWheel');
const display = document.getElementById('factDisplay');
const factNum = document.getElementById('factNumber');
const factTitle = document.getElementById('factTitle');
const factText = document.getElementById('factText');

let currentIndex = 0;
const pageLoadTime = Date.now();

// TRACKING-DATEN-OBJEKT
const telemetryData = {
    userId: localStorage.getItem('trackingUserId'),
    userConsent: localStorage.getItem('userConsent') || 'unknown',
    timeSpentOnPage: 0,
    tabSwitches: 0,
    sectionsDiscovered: [],
    rageClicks: 0
};

// ==========================================
// MOBILE OPTIMIERUNG: GENERIERE ALLE FAKTEN FÜR SMARTPHONES
// ==========================================
function setupMobileFacts() {
    const isMobile = window.innerWidth <= 900;
    const stickyWrapper = document.querySelector('.wheel-sticky');
    
    if (isMobile && stickyWrapper && facts.length > 0) {
        // Leere den Wrapper, um die alte, einzelne Desktop-Box zu entfernen
        stickyWrapper.innerHTML = '';
        
        // Erstelle für jeden Fakt eine eigene brutalistische Karte
        facts.forEach(fact => {
            const card = document.createElement('div');
            card.className = 'fact-display mobile-fact-card';
            card.style.margin = '20px 0';
            card.innerHTML = `
                <span class="card-number">${fact.num}</span>
                <h2>${fact.title}</h2>
                <p>${fact.text}</p>
            `;
            stickyWrapper.appendChild(card);
        });
    }
}

// Führe die Handy-Weiche beim Laden aus
document.addEventListener("DOMContentLoaded", setupMobileFacts);

// 2. INTRO & HERO ANIMATIONEN
if (typeof gsap !== 'undefined') {
    if (!localStorage.getItem('userConsent') && document.querySelector(".consent-box")) {
        gsap.from(".consent-box", {
            duration: 0.6,
            scale: 0,
            rotation: -8,
            ease: "back.out(1.5)",
            delay: 0.3
        });
    }

    if (document.querySelector(".bg-text") && document.querySelector(".canvas")) {
        gsap.to(".bg-text", {
            scrollTrigger: {
                trigger: ".canvas",
                start: "top top",
                end: "bottom top",
                scrub: true
            },
            xPercent: -15,
            ease: "none"
        });
    }
}

// 3. SCROLL-RAD LOGIK (NUR AUF DESKTOP AKTIVIEREN)
if (typeof gsap !== 'undefined' && window.innerWidth > 900 && wheel && section) {
    gsap.to(wheel, {
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            onUpdate: (self) => {
                let newIndex = Math.floor(self.progress * facts.length);
                if (newIndex >= facts.length) newIndex = facts.length - 1;

                if (newIndex !== currentIndex) {
                    currentIndex = newIndex;

                    gsap.to(display, {
                        opacity: 0, 
                        duration: 0.15, 
                        onComplete: () => {
                            if (factNum) factNum.textContent = facts[currentIndex].num;
                            if (factTitle) factTitle.textContent = facts[currentIndex].title;
                            if (factText) factText.textContent = facts[currentIndex].text;
                            
                            gsap.to(display, { opacity: 1, duration: 0.15 });
                        }
                    });
                }
            }
        },
        rotation: -360,
        ease: "none"
    });
}

// 4. FOCUS CHECK LOGIK
const attentionTest = document.getElementById('attentionTest');
const fakeNotif = document.getElementById('fakeNotif');

if (typeof gsap !== 'undefined' && attentionTest && fakeNotif) {
    const notifTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: attentionTest,
            start: "top center", 
            once: true           
        }
    });

    notifTimeline.to(fakeNotif, {
        right: "20px",
        duration: 0.4,
        delay: 1.5, 
        ease: "power4.out",
        onComplete: () => {
            gsap.to(fakeNotif, {
                x: "+=4",
                y: "+=2",
                yoyo: true,
                repeat: -1, 
                duration: 0.05,
                ease: "none"
            });
        }
    });

    ScrollTrigger.create({
        trigger: attentionTest,
        start: "top bottom", 
        end: "bottom top",   
        onLeave: () => gsap.to(fakeNotif, { opacity: 0, scale: 0.8, duration: 0.2 }),
        onEnterBack: () => gsap.to(fakeNotif, { opacity: 1, scale: 1, duration: 0.2 }),
        onLeaveBack: () => gsap.to(fakeNotif, { opacity: 0, scale: 0.8, duration: 0.2 }),
        onEnter: () => gsap.to(fakeNotif, { opacity: 1, scale: 1, duration: 0.1 })
    });

    fakeNotif.addEventListener('click', () => {
        gsap.killTweensOf(fakeNotif);
        telemetryData.tabSwitches++;

        fakeNotif.innerHTML = '<div class="notif-text"><strong>REINGEFALLEN.</strong><br>Aufmerksamkeit = 0.</div>';
        
        gsap.to(fakeNotif, {
            backgroundColor: 'var(--accent-orange)',
            x: 0,
            y: 0,
            duration: 0.2
        });

        gsap.to(fakeNotif, {
            right: "-500px",
            delay: 2,
            duration: 0.4,
            ease: "power2.in"
        });
    });
}

// QUIZ-ANTWORT PRÜFEN
function checkAnswer(isCorrect, btnElement) {
    const quizBox = document.getElementById('quizBox');
    const resultMsg = document.getElementById('resultMessage');
    const allBtns = document.querySelectorAll('.answer-btn');

    allBtns.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    });

    btnElement.style.opacity = '1';
    btnElement.style.transform = 'none';
    btnElement.style.boxShadow = 'none';

    if (quizBox) quizBox.style.display = 'none'; 
    if (resultMsg) {
        resultMsg.style.display = 'block'; 

        if (isCorrect) {
            resultMsg.style.color = 'lime';
            resultMsg.innerHTML = "RICHTIG.<br>Dein Gehirn funktioniert (noch).";
        } else if (btnElement.textContent.includes("Frage")) {
            resultMsg.style.color = 'orange'; 
            resultMsg.innerHTML = "EXAKT.<br>Du hast bewiesen: Deine Aufmerksamkeitsspanne existiert nicht.";
        } else {
            resultMsg.style.color = 'red';
            resultMsg.innerHTML = "FALSCH.<br>Du hast das Gedächtnis eines Goldfisches.";
        }
    }
}

// 5. KATZEN-DRAG-AND-DROP LOGIK
const patches = document.querySelectorAll('.patch');
if (patches.length > 0) {
    let activePatch = null;
    let offsetX = 0;
    let offsetY = 0;

    patches.forEach(patch => {
        const dragStart = (e) => {
            activePatch = patch;
            patch.classList.add('dragging');
            
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            
            const rect = patch.getBoundingClientRect();
            offsetX = clientX - rect.left;
            offsetY = clientY - rect.top;
            
            patch.style.zIndex = 1000;
        };

        patch.addEventListener('mousedown', dragStart);
        patch.addEventListener('touchstart', dragStart, { passive: true });
    });

    const drag = (e) => {
        if (!activePatch) return;
        if (e.cancelable) e.preventDefault(); 
        
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        
        const container = activePatch.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        let newLeft = clientX - containerRect.left - offsetX;
        let newTop = clientY - containerRect.top - offsetY;
        
        activePatch.style.right = 'auto';
        activePatch.style.bottom = 'auto';
        activePatch.style.left = `${newLeft}px`;
        activePatch.style.top = `${newTop}px`;
    };

    const dragEnd = () => {
        if (!activePatch) return;
        activePatch.classList.remove('dragging');
        activePatch.style.zIndex = ""; 
        activePatch = null;
    };

    document.addEventListener('mousemove', drag, { passive: false });
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);
}

// 6. CONSENT OVERLAY LOGIK
document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById('consentOverlay');
    const consentStatus = localStorage.getItem('userConsent');

    if (consentStatus !== null) {
        if (overlay) overlay.style.display = 'none';
        if (consentStatus === 'true') {
            startTracking(); 
        }
    }
});

function showBrutalToast(message) {
    if (typeof gsap === 'undefined') return;

    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'brutal-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'brutal-toast';
    toast.innerHTML = message;
    container.appendChild(toast);

    gsap.fromTo(toast, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" });

    gsap.to(toast, {
        x: 400,
        opacity: 0,
        delay: 4,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => toast.remove()
    });
}

function handleConsent(isAccepted) {
    const overlay = document.getElementById('consentOverlay');
    localStorage.setItem('userConsent', isAccepted);
    telemetryData.userConsent = isAccepted ? 'true' : 'false';
    
    if (typeof gsap !== 'undefined' && overlay) {
        gsap.to(overlay, {
            yPercent: -100,
            duration: 0.5,
            ease: "power4.in",
            onComplete: () => {
                overlay.style.display = 'none';
                if (isAccepted) {
                    startTracking();
                    showBrutalToast("Tracking aktiv. <br>Willkommen im System.");
                } else {
                    showBrutalToast("Okay. Wir tracken dich nicht.<br>(Vielleicht.)");
                }
            }
        });
    } else if (overlay) {
        overlay.style.display = 'none';
        if (isAccepted) startTracking();
    }
}

function startTracking() {
    console.log("TRACKING AKTIV. Daten werden gesammelt...");
}

// 7. COUNTER VARIABLEN FÜR TELEMETRIE
let totalPixelTravelled = 0;
let hasClickedPanic = false;

document.addEventListener('mousemove', (e) => {
    totalPixelTravelled += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
});

// 8. DOPAMIN MÜHLE LOGIK
const millBox = document.getElementById('millBox');
const dopamineFeed = [
    { text: "Ein virales Katzenvideo 🐱", visual: "<span class='mill-emoji'>🐱 SCREENSHOT 🐱</span>" },
    { text: "Jemand is im Internet wütend 😡", visual: "<span class='mill-emoji'>🤬 ALERT 🤬</span>" },
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

            if (typeof gsap !== 'undefined') {
                gsap.fromTo(newItem, 
                    { scale: 0.6, opacity: 0, backgroundColor: "rgb(255, 111, 0)" }, 
                    { scale: 1, opacity: 1, backgroundColor: "#1a1a1a", duration: 0.25, ease: "back.out(1.4)" }
                );
            }

            if (millBox.children.length === 15) {
                const banner = document.createElement('div');
                banner.style = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:red; color:white; font-size:4rem; font-weight:900; padding:20px 40px; z-index:10000; border:10px solid black; text-align:center; box-shadow: 15px 15px 0px #000; font-family: sans-serif;";
                banner.innerText = "BIST DU JETZT GLÜCKLICH?";
                document.body.appendChild(banner);

                if (typeof gsap !== 'undefined') {
                    gsap.from(banner, { scale: 0, rotation: 720, ease: "back.out(1.5)", duration: 0.5 });
                    gsap.to(banner, { scale: 0, opacity: 0, delay: 2.5, duration: 0.3, onComplete: () => banner.remove() });
                } else {
                    setTimeout(() => banner.remove(), 2500);
                }
            }
        }
    });
}

// 9. IMPULSKONTROLLE LOGIK
const panicBtn = document.getElementById('panicBtn');
const panicMsg = document.getElementById('panicMsg');
let clickCount = 0;

function makeButtonFlee() {
    if (panicMsg) panicMsg.innerText = "";
    if (panicBtn) {
        panicBtn.innerText = "FANG MICH DOCH!";
        if (typeof gsap !== 'undefined') {
            gsap.set(panicBtn, { backgroundColor: "orange" });
            
            let randomX = Math.floor((Math.random() - 0.5) * 450);
            let randomY = Math.floor((Math.random() - 0.5) * 300);
            
            gsap.to(panicBtn, { x: randomX, y: randomY, duration: 0.1, ease: "power2.out" });
        }
    }
}

if (panicBtn) {
    const handleFleeAction = () => {
        if (clickCount >= 2) return; 
        clickCount++;
        hasClickedPanic = true;

        if (clickCount === 1) {
            if (panicMsg) panicMsg.innerText = "Ernsthaft? Keine Selbstbeherrschung.";
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(panicMsg, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "bounce.out" });
            }
        } 
        else if (clickCount === 2) {
            if (panicMsg) panicMsg.innerText = "Hör auf zu klicken! Geh weiter!";
            if (typeof gsap !== 'undefined') {
                gsap.to(panicBtn, { 
                    x: "+=12", yoyo: true, repeat: 7, duration: 0.04, 
                    onComplete: () => {
                        gsap.set(panicBtn, { x: 0 });
                        makeButtonFlee();
                        startHoverRunaway();
                    } 
                });
            } else {
                makeButtonFlee();
                startHoverRunaway();
            }
        }
    };

    panicBtn.addEventListener('click', handleFleeAction);
    panicBtn.addEventListener('click', () => { if(hasClickedPanic) telemetryData.rageClicks++; });
}

function startHoverRunaway() {
    if (panicBtn) {
        panicBtn.addEventListener('mouseenter', makeButtonFlee);
        panicBtn.addEventListener('touchstart', (e) => { e.preventDefault(); makeButtonFlee(); });
    }
}

// 11. TRACKING ENGINE
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        telemetryData.tabSwitches++;
    }
});

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

document.querySelectorAll('main, section, footer').forEach(sec => trackingObserver.observe(sec));

// ==========================================
// OPTIMIERTES DATEN-SENDEN (JETZT MIT KORREKTER ROUTE)
// ==========================================
function sendTelemetry() {
    // Falls kein Consent erteilt wurde (oder abgelehnt wurde), senden wir absolut nichts!
    if (localStorage.getItem('userConsent') !== 'true') return;

    telemetryData.timeSpentOnPage = Math.floor((Date.now() - pageLoadTime) / 1000);
    const jsonString = JSON.stringify(telemetryData);
    
    const targetUrl = "https://goldfish-tracking.onrender.com/api/harvest";

    const blob = new Blob([jsonString], { type: 'application/json' });
    const success = navigator.sendBeacon(targetUrl, blob);
    
    if (!success) {
        fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonString,
            keepalive: true
        }).catch(() => {});
    }
}

window.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") sendTelemetry(); });
window.addEventListener("pagehide", sendTelemetry);

document.addEventListener("DOMContentLoaded", () => {
    const auswertungBtn = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent.includes('AUSWERTUNG'));
    if (auswertungBtn) {
        auswertungBtn.addEventListener("click", () => { sendTelemetry(); });
    }
});

// ==========================================
// ROBUS-CUSTOM-CURSOR (FLIEGE)
// ==========================================
const cursor = document.querySelector('.custom-cursor');

if (cursor && typeof gsap !== 'undefined') {
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };
    const speed = 0.15;

    const xTo = gsap.quickTo(cursor, "x", {duration: 0.3, ease: "power3"}),
          yTo = gsap.quickTo(cursor, "y", {duration: 0.3, ease: "power3"});

    window.addEventListener("mousemove", e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      // Drehe die Fliege in Gehrichtung!
      const angle = Math.atan2(e.clientY - pos.y, e.clientX - pos.x) * 180 / Math.PI;
      gsap.to(cursor, { rotation: angle, duration: 0.2 });
      
      pos.x += (mouse.x - pos.x) * speed;
      pos.y += (mouse.y - pos.y) * speed;
      
      xTo(pos.x);
      yTo(pos.y);
    });
}