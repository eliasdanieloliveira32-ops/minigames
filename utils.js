// utils.js
// Funções utilitárias: carregar sons (se existirem) e fallback WebAudio.
// Uso: import or include this script antes dos jogos (ou carregue dinamicamente).
// Ex.: utils.preloadSounds(['flip','match','hit','win']).then(()=> playSound('flip'));

const utils = (function(){
  const audioContext = (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null;
  const cache = { buffers: {}, audios: {}, availableFiles: {} };

  // tenta carregar arquivos /assets/sounds/<name>.ogg (ou .wav) — retorna promise
  async function preloadSounds(names = ['flip','match','hit','win','collect']) {
    const base = '/assets/sounds/';
    const results = {};
    for (const n of names) {
      // tenta OGG então WAV
      const tryUrls = [`${base}${n}.ogg`, `${base}${n}.wav`, `${base}${n}.mp3`];
      let loaded = false;
      for (const url of tryUrls) {
        try {
          // tentativa por fetch para ver se existe
          const r = await fetch(url, { method: 'HEAD' });
          if (r.ok) {
            // carrega o arquivo como Audio object (uso simples) — se WebAudio disponível, decode para buffer
            try {
              const full = await fetch(url);
              const ab = await full.arrayBuffer();
              if (audioContext) {
                const buf = await audioContext.decodeAudioData(ab.slice(0));
                cache.buffers[n] = buf;
              } else {
                // fallback: criar Audio element
                const a = new Audio(url);
                cache.audios[n] = a;
              }
              cache.availableFiles[n] = url;
              loaded = true;
              results[n] = { ok: true, url };
              break;
            } catch(e) {
              console.warn('utils: falha ao decodificar', url, e);
            }
          }
        } catch(err) {
          // possivelmente CORS ou arquivo não existe, ignorar
        }
      }
      if (!loaded) {
        results[n] = { ok: false };
      }
    }
    return results;
  }

  // toca som pelo nome; se não existir arquivo tenta WebAudio gerado (beep)
  function playSound(name='flip', { volume=0.12, type='sine' } = {}) {
    // se buffer carregado -> WebAudio play
    if (cache.buffers[name] && audioContext) {
      const src = audioContext.createBufferSource();
      src.buffer = cache.buffers[name];
      const g = audioContext.createGain();
      g.gain.value = volume;
      src.connect(g);
      g.connect(audioContext.destination);
      try { src.start(); } catch(e){ /* ignore */ }
      return;
    }
    // se audio element disponível
    if (cache.audios[name]) {
      try {
        cache.audios[name].currentTime = 0;
        cache.audios[name].volume = Math.min(1, Math.max(0, volume));
        cache.audios[name].play().catch(()=>{});
      } catch(e){}
      return;
    }
    // fallback: gerar tom simples com WebAudio (se disponível)
    if (audioContext) {
      const o = audioContext.createOscillator();
      const g = audioContext.createGain();
      o.type = type;
      // map name -> freq (opcional)
      const map = { flip:700, match:980, hit:300, win:1200, fail:180, collect:880 };
      o.frequency.value = map[name]||600;
      g.gain.value = volume;
      o.connect(g); g.connect(audioContext.destination);
      o.start();
      setTimeout(()=>{ try{o.stop();}catch(e){} }, 120 + (name==='win'?120:0));
      return;
    }
    // nada possível: silencioso
  }

  // util de tempo
  function formatTime(s){ return s<10? '00:0'+s : '00:'+s; }

  return { preloadSounds, playSound, formatTime, _cache: cache };
})();

// tornar global para os jogos que usam playSound sem import
window.utils = utils;