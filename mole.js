const area = document.getElementById("game-area");

area.innerHTML = `
  <h3>🐹 Acerta o Coração</h3>
  <p>Toque no coração que aparece. Você tem 30 segundos!</p>
  <div id="mole-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px;"></div>
  <p id="mole-info"></p>
`;

const grid = document.getElementById("mole-grid");
const info = document.getElementById("mole-info");

let timeLeft = 30;
let active = -1;

for (let i = 0; i < 9; i++) {
  const b = document.createElement("button");
  b.style.height = "70px";
  b.style.borderRadius = "14px";
  b.style.border = "1px solid #e5e7eb";
  b.style.fontSize = "22px";
  b.style.background = "#fff";

  b.onclick = () => {
    if (i === active) {
      addScore("mole", 2);
      b.textContent = "";
      active = -1;
    }
  };

  grid.appendChild(b);
}

const buttons = grid.querySelectorAll("button");

function spawn() {
  buttons.forEach(b => b.textContent = "");
  active = Math.floor(Math.random() * 9);
  buttons[active].textContent = "❤️";
}

spawn();

const interval = setInterval(() => {
  timeLeft--;
  info.textContent = `Tempo restante: ${timeLeft}s`;

  if (timeLeft <= 0) {
    clearInterval(interval);
    buttons.forEach(b => b.textContent = "");
    info.textContent = "Fim de jogo!";
    return;
  }

  spawn();
}, 1000);