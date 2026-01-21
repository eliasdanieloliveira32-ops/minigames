const area = document.getElementById("game-area");

area.innerHTML = `
  <h3>🃏 Jogo da Memória</h3>
  <p>Encontre todos os pares para ganhar pontos.</p>
  <div id="memory-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;"></div>
`;

const icons = ["❤️","💍","🌹","😘","🥰","💖"];
let cards = [...icons, ...icons].sort(() => Math.random() - 0.5);
let open = [];
let matched = 0;

const grid = document.getElementById("memory-grid");

cards.forEach(icon => {
  const b = document.createElement("button");
  b.textContent = "❓";
  b.style.padding = "16px";
  b.style.fontSize = "20px";
  b.style.borderRadius = "12px";
  b.style.border = "1px solid #e5e7eb";
  b.style.background = "#fff";

  b.onclick = () => {
    if (open.length < 2 && b.textContent === "❓") {
      b.textContent = icon;
      open.push(b);

      if (open.length === 2) {
        setTimeout(() => {
          if (open[0].textContent === open[1].textContent) {
            matched++;
            addScore("memory", 5);
          } else {
            open[0].textContent = "❓";
            open[1].textContent = "❓";
          }
          open = [];

          if (matched === icons.length) {
            alert("Você venceu! ❤️");
          }
        }, 500);
      }
    }
  };

  grid.appendChild(b);
});