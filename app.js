// app.js - controle de login, navegação, scoreboard e carregamento dos jogos

const USERS = {
  "Gaby": "2101",
  "Elias": "2101"
};

let currentUser = null;

// Elementos principais
const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");

const loginUserInput = document.getElementById("login-user");
const loginPassInput = document.getElementById("login-pass");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");

const userNameEl = document.getElementById("user-name");
const scoreBoard = document.getElementById("score-board");
const gameArea = document.getElementById("game-area");

// Storage helpers
function getScores() {
  try { return JSON.parse(localStorage.getItem("mm_scores_v1") || "{}"); }
  catch(e){ return {}; }
}
function saveScores(data) {
  localStorage.setItem("mm_scores_v1", JSON.stringify(data));
}
function ensureUserScore() {
  const data = getScores();
  if (!data[currentUser]) {
    data[currentUser] = { memory:0, mole:0, reaction:0, maze:0, collect:0 };
    saveScores(data);
  }
}

// render scoreboard
function renderScores() {
  const data = getScores()[currentUser] || { memory:0, mole:0, reaction:0, maze:0, collect:0 };
  scoreBoard.innerHTML = `
    <div style="font-weight:700">🃏 Memória: ${data.memory}</div>
    <div style="font-weight:700">🐹 Acerta: ${data.mole}</div>
    <div style="font-weight:700">⚡ Reflexo: ${data.reaction}</div>
    <div style="font-weight:700">🌀 Labirinto: ${data.maze}</div>
    <div style="font-weight:700">💖 Coletar: ${data.collect}</div>
  `;
}

// expose global addScore for games
window.addScore = function(game, value) {
  const data = getScores();
  data[currentUser] = data[currentUser] || { memory:0, mole:0, reaction:0, maze:0, collect:0 };
  data[currentUser][game] = (data[currentUser][game] || 0) + Number(value || 0);
  saveScores(data);
  renderScores();
};

// load simple game script (dynamic)
function loadGame(name) {
  // clear area and try to remove previously injected script for same game
  gameArea.innerHTML = '';
  // remove other injected scripts to avoid duplicates (optional)
  const prev = document.querySelectorAll('script[data-game-script]');
  prev.forEach(s => s.remove());
  const s = document.createElement('script');
  s.src = `js/games/${name}.js?ts=${Date.now()}`;
  s.setAttribute('data-game-script', name);
  s.onload = () => {
    // optional: focus game area or trigger sound
    if (window.utils && window.utils.playSound) window.utils.playSound('flip');
  };
  s.onerror = () => { gameArea.innerHTML = '<p>Falha ao carregar o jogo.</p>'; };
  document.body.appendChild(s);
}

// setup click handlers for sidebar
document.querySelectorAll('[data-game]').forEach(btn => {
  btn.addEventListener('click', () => {
    loadGame(btn.getAttribute('data-game'));
  });
});

// login flow
loginBtn.addEventListener('click', () => {
  const u = loginUserInput.value.trim();
  const p = loginPassInput.value.trim();
  loginError.textContent = '';

  if (!u) { loginError.textContent = 'Digite o usuário'; return; }
  if (USERS[u] && USERS[u] === p) {
    currentUser = u;
    ensureUserScore();
    userNameEl.textContent = currentUser;
    loginScreen.style.display = 'none';
    appScreen.style.display = 'flex';
    renderScores();

    // Preload sounds (if utils available)
    if (window.utils && window.utils.preloadSounds) {
      window.utils.preloadSounds(['flip','match','hit','win','collect']).catch(()=>{});
    }
  } else {
    loginError.textContent = 'Usuário ou senha incorretos';
  }
});

// register service worker (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registrado:', reg.scope))
      .catch(err => console.warn('Falha ao registrar SW:', err));
  });
}

// handy: keyboard enter triggers login
[loginUserInput, loginPassInput].forEach(inp => {
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });
});

// Optional: expose currentUser for debugging
window.mmCurrentUser = () => currentUser;