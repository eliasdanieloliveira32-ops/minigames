const area = document.getElementById("game-area");

area.innerHTML = `
  <h3>🌀 Labirinto do Amor</h3>
  <p>Leve o ponto azul até o coração ❤️ usando o analógico.</p>

  <canvas id="mazeCanvas" width="300" height="300"
    style="border:1px solid #e5e7eb;border-radius:12px;display:block;margin:auto;"></canvas>

  <div id="pad" style="display:grid;grid-template-columns:repeat(3,60px);gap:6px;justify-content:center;margin-top:12px;">
    <div></div>
    <button>⬆️</button>
    <div></div>
    <button>⬅️</button>
    <div></div>
    <button>➡️</button>
    <div></div>
    <button>⬇️</button>
    <div></div>
  </div>
`;

const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

let x = 20, y = 20;
const goal = { x: 260, y: 260 };

function draw() {
  ctx.clearRect(0, 0, 300, 300);

  // Objetivo
  ctx.fillStyle = "#fee2e2";
  ctx.fillRect(goal.x, goal.y, 20, 20);
  ctx.fillStyle = "#dc2626";
  ctx.fillText("❤️", goal.x + 2, goal.y + 16);

  // Jogador
  ctx.fillStyle = "#2563eb";
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
}

function move(dx, dy) {
  x = Math.max(6, Math.min(294, x + dx));
  y = Math.max(6, Math.min(294, y + dy));

  if (Math.abs(x - goal.x) < 12 && Math.abs(y - goal.y) < 12) {
    addScore("maze", 10);
    alert("Você encontrou o coração! ❤️");
    x = 20; y = 20;
  }
  draw();
}

draw();

const buttons = document.querySelectorAll("#pad button");
buttons[0].onclick = () => move(0, -6);
buttons[1].onclick = () => move(-6, 0);
buttons[2].onclick = () => move(6, 0);
buttons[3].onclick = () => move(0, 6);