const area = document.getElementById("game-area");

area.innerHTML = `
  <h3>💖 Coletar Corações</h3>
  <p>Toque nos corações que caem para ganhar pontos.</p>
  <div id="collect-area"
       style="position:relative;height:260px;border-radius:16px;background:#fff0f3;overflow:hidden;">
  </div>
`;

const field = document.getElementById("collect-area");

function spawnHeart() {
  const h = document.createElement("div");
  h.textContent = "❤️";
  h.style.position = "absolute";
  h.style.left = Math.random() * 90 + "%";
  h.style.top = "-20px";
  h.style.fontSize = "24px";
  h.style.transition = "top 3s linear";

  h.onclick = () => {
    addScore("collect", 1);
    h.remove();
  };

  field.appendChild(h);

  requestAnimationFrame(() => {
    h.style.top = "280px";
  });

  setTimeout(() => h.remove(), 3000);
}

const rain = setInterval(spawnHeart, 700);