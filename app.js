// app.js (versão mais robusta)
// Substitua todo o app.js atual por este conteúdo.
// Suporta login case-insensitive, aguarda DOMContentLoaded e mostra mensagens de erro claras.

(function(){
  // usuários (chave exibida -> senha)
  const USERS = { "Gaby": "2101", "Elias": "2101" };

  // util: encontra usuário (case-insensitive). retorna chave original (ex: "Gaby") ou null
  function findUserKeyInsensitive(inputName){
    if(!inputName) return null;
    const lower = inputName.trim().toLowerCase();
    for(const k of Object.keys(USERS)){
      if(k.toLowerCase() === lower) return k;
    }
    return null;
  }

  // helpers storage
  function getScores(){ try{ return JSON.parse(localStorage.getItem("mm_scores_v1")||"{}"); }catch(e){return{};} }
  function saveScores(data){ localStorage.setItem("mm_scores_v1", JSON.stringify(data)); }
  function ensureUserScore(user){
    const data = getScores();
    if(!data[user]){ data[user] = { memory:0, mole:0, reaction:0, maze:0, collect:0 }; saveScores(data); }
  }

  // DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    // elements (IDs presentes no index.html)
    const loginScreen = document.getElementById("login-screen");
    const appScreen = document.getElementById("app-screen");
    const loginUserInput = document.getElementById("login-user");
    const loginPassInput = document.getElementById("login-pass");
    const loginBtn = document.getElementById("login-btn");
    const loginError = document.getElementById("login-error");
    const userNameEl = document.getElementById("user-name");
    const scoreBoard = document.getElementById("score-board");
    const gameArea = document.getElementById("game-area");

    if(!loginBtn || !loginUserInput || !loginPassInput){
      console.warn("app.js: elementos de login não encontrados. Verifique se os IDs em index.html correspondem a 'login-user' e 'login-pass'.");
      if(loginError) loginError.textContent = "Erro: elementos de login não encontrados.";
      return;
    }

    // render scoreboard
    function renderScores(user){
      const data = (getScores()[user]) || { memory:0, mole:0, reaction:0, maze:0, collect:0 };
      if(scoreBoard) scoreBoard.innerHTML = `
        <div style="font-weight:700">🃏 Memória: ${data.memory}</div>
        <div style="font-weight:700">🐹 Acerta: ${data.mole}</div>
        <div style="font-weight:700">⚡ Reflexo: ${data.reaction}</div>
        <div style="font-weight:700">🌀 Labirinto: ${data.maze}</div>
        <div style="font-weight:700">💖 Coletar: ${data.collect}</div>
      `;
    }

    // expose addScore globally
    window.addScore = function(game, value){
      if(!currentUserForAdd) return console.warn("addScore: nenhum usuário logado");
      const data = getScores();
      data[currentUserForAdd] = data[currentUserForAdd] || { memory:0, mole:0, reaction:0, maze:0, collect:0 };
      data[currentUserForAdd][game] = (data[currentUserForAdd][game] || 0) + Number(value||0);
      saveScores(data);
      renderScores(currentUserForAdd);
    };

    // track logged user for addScore
    let currentUserForAdd = null;

    // load game function (carrega arquivo na raiz: memory.js, mole.js, ...)
    function loadGame(name){
      if(!gameArea) return;
      gameArea.innerHTML = '';
      document.querySelectorAll('script[data-game-script]').forEach(s=>s.remove());
      const s = document.createElement('script');
      s.src = `${name}.js?ts=${Date.now()}`;
      s.setAttribute('data-game-script', name);
      s.onload = () => { if(window.utils && window.utils.playSound) window.utils.playSound('flip'); };
      s.onerror = () => { gameArea.innerHTML = '<p>Falha ao carregar o jogo.</p>'; };
      document.body.appendChild(s);
    }

    // attach handlers to sidebar buttons (data-game)
    document.querySelectorAll('[data-game]').forEach(btn=>{
      btn.addEventListener('click', ()=> loadGame(btn.getAttribute('data-game')));
    });

    // login handler (case-insensitive)
    loginBtn.addEventListener('click', ()=>{
      const rawUser = loginUserInput.value || '';
      const rawPass = loginPassInput.value || '';
      loginError.textContent = '';

      const key = findUserKeyInsensitive(rawUser);
      if(!key){
        loginError.textContent = 'Usuário não encontrado';
        console.log('Login failed: user not found ->', rawUser);
        return;
      }

      if(USERS[key] !== rawPass){
        loginError.textContent = 'Senha incorreta';
        console.log('Login failed: bad password for', key);
        return;
      }

      // sucesso
      currentUserForAdd = key;
      ensureUserScore(key);
      renderScores(key);
      if(userNameEl) userNameEl.textContent = key;
      if(loginScreen) loginScreen.style.display = 'none';
      if(appScreen) appScreen.style.display = 'flex';

      // preload sounds (se utils existir)
      if(window.utils && window.utils.preloadSounds) {
        window.utils.preloadSounds(['flip','match','hit','win','collect']).catch(()=>{});
      }

      console.log('Login successful:', key);
    });

    // Enter key triggers login
    [loginUserInput, loginPassInput].forEach(inp=>{
      inp.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') loginBtn.click(); });
    });

    // expose for debug
    window.mmCurrentUser = ()=> currentUserForAdd;
  }); // end DOMContentLoaded
})(); // end IIFE  `;
}

// expõe addScore() global para jogos
window.addScore = function(game, value){
  const data = getScores();
  data[currentUser] = data[currentUser] || { memory:0, mole:0, reaction:0, maze:0, collect:0 };
  data[currentUser][game] = (data[currentUser][game] || 0) + Number(value||0);
  saveScores(data);
  renderScores();
};

// carrega um jogo (carrega arquivo <name>.js que está na raiz)
function loadGame(name){
  gameArea.innerHTML = '';
  // remove scripts anteriores injetados
  document.querySelectorAll('script[data-game-script]').forEach(s=>s.remove());
  const s = document.createElement('script');
  s.src = `${name}.js?ts=${Date.now()}`;
  s.setAttribute('data-game-script', name);
  s.onload = () => { if (window.utils && window.utils.playSound) window.utils.playSound('flip'); };
  s.onerror = () => { gameArea.innerHTML = '<p>Falha ao carregar o jogo.</p>'; };
  document.body.appendChild(s);
}

// handlers dos botões de jogo (eles têm data-game="memory" etc.)
document.querySelectorAll('[data-game]').forEach(btn=>{
  btn.addEventListener('click', ()=> loadGame(btn.getAttribute('data-game')));
});

// login flow
loginBtn.addEventListener('click', ()=>{
  const u = loginUserInput.value.trim();
  const p = loginPassInput.value.trim();
  loginError.textContent = '';
  if(!u){ loginError.textContent = 'Digite o usuário'; return; }
  if(USERS[u] && USERS[u] === p){
    currentUser = u;
    ensureUserScore();
    userNameEl.textContent = currentUser;
    loginScreen.style.display = 'none';
    appScreen.style.display = 'flex';
    renderScores();

    // Preload sounds (se utils disponível)
    if(window.utils && window.utils.preloadSounds) {
      window.utils.preloadSounds(['flip','match','hit','win','collect']).catch(()=>{});
    }
  } else {
    loginError.textContent = 'Usuário ou senha incorretos';
  }
});

// permitir Enter para logar
[loginUserInput, loginPassInput].forEach(inp=>{
  inp.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') loginBtn.click(); });
});

// registrar service worker (PWA)
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registrado:', reg.scope))
      .catch(err => console.warn('Falha ao registrar SW:', err));
  });
}

// util para debug
window.mmCurrentUser = ()=> currentUser;}

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
