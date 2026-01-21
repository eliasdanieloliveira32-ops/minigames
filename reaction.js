const area = document.getElementById("game-area");

area.innerHTML = `
  <h3>⚡ Teste de Reflexo</h3>
  <p>Espere o botão ficar verde e toque o mais rápido possível.</p>
  <button id="reflex-btn"
    style="margin-top:20px;padding:20px 30px;font-size:18px;border-radius:16px;border:none;background:#9ca3af;color:white;">
    Aguarde...
  </button>
  <p id="reflex-info"></p>
`;

const btn = document.getElementById("reflex-btn");
const info = document.getElementById("reflex-info");

let startTime = 0;

const delay = 1000 + Math.random() * 3000;

setTimeout(() => {
  btn.style.background = "#16a34a";
  btn.textContent = "AGORA!";
  startTime = performance.now();

  btn.onclick = () => {
    const time = Math.floor(performance.now() - startTime);
    const points = Math.max(1, Math.floor(4000 / time));
    addScore("reaction", points);

    info.textContent = `Tempo: ${time} ms | +${points} pontos`;
    btn.onclick = null;
    btn.style.background = "#9ca3af";
    btn.textContent = "Reinicie o jogo para tentar novamente";
  };
}, delay);