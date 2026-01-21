// utils.js - carrega sons (se existirem) e fallback WebAudio
const utils = (function(){
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioContext = AudioCtx ? new AudioCtx() : null;
  const cache = { buffers: {}, audios: {}, availableFiles: {} };

  async function preloadSounds(names = ['flip','match','hit','win','collect']){
    const base = './assets/sounds/';
    const results = {};
    for(const n of names){
      const tryUrls = [`${base}${n}.ogg`, `${base}${n}.wav`, `${base}${n}.mp3`];
      let loaded = false;
      for(const url of tryUrls){
        try {
          const r = await fetch(url);
          if(!r.ok) continue;
          const buf = await r.arrayBuffer();
          if(audioContext){
            const decoded = await audioContext.decodeAudioData(buf.slice(0));
            cache.buffers[n] = decoded;
          }
          cache.availableFiles[n] = url;
          loaded = true;
          break;
        } catch(e){}
      }
      results[n] = loaded;
    }
    return results;
  }

  function playSound(name){
    if(audioContext && cache.buffers[name]){
      const src = audioContext.createBufferSource();
      src.buffer = cache.buffers[name];
      src.connect(audioContext.destination);
      src.start();
      return;
    }
  }

  function formatTime(s){
    return s < 10 ? '00:0' + s : '00:' + s;
  }

  return { preloadSounds, playSound, formatTime, _cache: cache };
})();

// agora sim existe
window.utils = utils;
