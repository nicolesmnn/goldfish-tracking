const statusBox = document.getElementById("attention-status");
const scoreEl = document.getElementById("score");

let score = 0;

if (statusBox && scoreEl) {
  function updateScore(value) {
    score = Math.max(0, Math.min(100, score + value));
    scoreEl.textContent = score;
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      statusBox.textContent = "Tab gewechselt – Aufmerksamkeit verloren";
      statusBox.className = "hidden-warning";
      updateScore(-10);
    } else {
      statusBox.textContent = "Zurück auf der Seite";
      statusBox.className = "visible-success";
      updateScore(5);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statusBox.textContent = "Inhalt wird aktiv betrachtet";
          statusBox.className = "visible-success";
          updateScore(10);
        }
      });
    },
    { threshold: 0.5 },
  );

  observer.observe(document.querySelector(".tracked-card"));

  window.addEventListener("unload", () => {
    navigator.sendBeacon("/attention-exit", JSON.stringify({ score }));
  });
}

const items = document.querySelectorAll('.item');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
}, { threshold: 0.4 });

items.forEach(item => observer.observe(item));

// scroll progress effect
const line = document.querySelector('.progress-line');

window.addEventListener('scroll', () => {
  const scroll = window.scrollY;
  const height = document.body.scrollHeight - window.innerHeight;
  const progress = scroll / height;
  line.style.height = `${progress * 100}%`;
});
