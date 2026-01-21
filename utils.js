// utils.js - carrega sons (se existirem) e fallback WebAudio
(function(){
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioContext = AudioCtx ? new AudioCtx() : null;
  const cache = { buffers: {}, audios: {}, availableFiles: {} };

  async function preloadSounds(names = ['flip','match','hit','win','collect']){
    const base = '/assets/sounds/';
    const results = {};
    for(const n of names){
      const tryUrls = [`${base}${n}.ogg`, `${base}${n}.wav`, `${base}${n}.mp3`];
      let loaded = false;
      for(const url of tryUrls){
        try {
          // tenta carregar (fetch) e decodificar
          const r = await fetch(url, { method: 'GET' });
          if (!r.ok) { continue; }
          const ab = await r.arrayBuffer();
          if(audioContext){
            try {
              const buf = await audioContext.decodeAudioData(ab.slice(0));
              cache.buffers[n] = buf;
              cache.availableFiles[n] = url;
              loaded = true;
              results[n] = { ok:true, url };
              break;
            } catch(e){
              // fallback para Audio element
              const blob = new Blob([ab]);
              const blobUrl = URL.createObjectURL(blob);
              const a = new Audio(blobUrl);
              cache.audios[n] = a;
              cache.availableFiles[n] = blobUrl;
              loaded = true;
              results[n] = { ok:true, url: blobUrl };
              break;
            }
          } else {
            const blob = new Blob([ab]);
            const blobUrl = URL.createObjectURL(blob);
            const a = new Audio(blobUrl);
            cache.audios[n] = a;
            cache.availableFiles[n] = blobUrl;
            loaded = true;
            results[n] = { ok:true, url: blobUrl };
            break;
          }
        } catch(err){
          // não existe ou erro CORS -> continuar tentativas
        }
      }
      if(!loaded) results[n] = { ok:false };
    }
    return results;
  }

  function playSound(name='flip', { volume=0.12, type='sine' } = {}){
    if(cache.buffers[name] && audioContext){
      const src = audioContext.createBufferSource();
      src.buffer = cache.buffers[name];
      const g = audioContext.createGain();
      g.gain.value = volume;
      src.connect(g); g.connect(audioContext.destination);
      try { src.start(); } catch(e){}
      return;
    }
    if(cache.audios[name]){
      try {
        cache.audios[name].currentTime = 0;
        cache.audios[name].volume = Math.min(1, Math.max(0, volume));
        cache.audios[name].play().catch(()=>{});
      } catch(e){}
      return;
    }
    // fallback: gerar tom simples
    if(audioContext){
      const o = audioContext.createOscillator();
      const g = audioContext.createGain();
      const freqMap = { flip:700, match:980, hit:300, win:1200, fail:180, collect:880 };
      o.type = type;
      o.frequency.value = freqMap[name] || 600;
      g.gain.value = volume;
      o.connect(g); g.connect(audioContext.destination);
      o.start();
      setTimeout(()=>{ try{o.stop();}catch(e){} }, 120 + (name==='win'?120:0));
    }
  }

  function formatTime(s){ return s<10 ? '00:0'+s : '00:'+s; }

  window.utils = { preloadSounds, playSound, formatTime, _cache: cache };
})();              results[n] = { ok: true, url };
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
