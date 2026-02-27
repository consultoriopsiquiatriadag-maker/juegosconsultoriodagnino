(() => {
  const APP = window.APP = window.APP || {};
  APP.LS = APP.LS || {
    "LANG": "app_lang",
    "AUDIO_ON": "app_audio_on",
    "AUDIO_VOL": "app_audio_vol",
    "FONT": "app_font_px"
  };

// ========= Audio Manager (continuous, singleton) =========
    APP.AudioManager = (() => {
      const state = {
        enabled: false,
        vol: 0.35,
        music: null,
        welcome: null,
        welcomePlayed: false
      };

      const MUSIC_SRC = "audio/musica_fondo.mp3";
      const WELCOME_SRC = "audio/bienvenida.mp3"; // si no existe, fallback a speech

      function ensure(){
        if (!state.music){
          state.music = new Audio(MUSIC_SRC);
          state.music.loop = true;
          state.music.preload = "auto";
          state.music.volume = 0;
          state.music.playsInline = true;
        }
        if (!state.welcome){
          state.welcome = new Audio(WELCOME_SRC);
          state.welcome.preload = "auto";
          state.welcome.volume = 1;
          state.welcome.playsInline = true;
          state.welcome.addEventListener("ended", () => {
            if (state.enabled) fadeTo(state.vol, 450);
          });
        }
      }

      function fadeTo(target, ms=1500){
        ensure();
        target = Math.max(0, Math.min(1, target));
        const a = state.music;
        const start = a.volume;
        const t0 = performance.now();

        const step = (now) => {
          const t = Math.min(1, (now - t0) / ms);
          a.volume = start + (target - start) * t;
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }

      function duck(ms=250){
        if (!state.music) return;
        const prev = state.music.volume;
        fadeTo(Math.min(prev, 0.12), ms);
      }

      async function playWelcome(){
        ensure();
        if (state.welcomePlayed) return;
        state.welcomePlayed = true;

        try{
          duck(250);
          await state.welcome.play();
        }catch(e){
          try{
            duck(250);
            const u = new SpeechSynthesisUtterance();
            u.lang = document.documentElement.lang || "es";
            u.text = (document.documentElement.lang === "en")
              ? "Welcome. You can explore the resources while you wait."
              : (document.documentElement.lang === "pt")
                ? "Bem-vindo. Você pode explorar os recursos enquanto aguarda."
                : "Bienvenido/a. Podés explorar los recursos mientras esperás.";
            u.rate = 0.95;
            u.onend = () => { if (state.enabled) fadeTo(state.vol, 450); };
            window.speechSynthesis.speak(u);
          }catch(_){}
        }
      }

      async function enable(){
        ensure();
        state.enabled = true;

        try{
          state.music.volume = 0;
          await state.music.play();
          fadeTo(state.vol, 1500);
        }catch(e){}

        playWelcome().catch(()=>{});
        persist();
      }

      function disable(){
        ensure();
        state.enabled = false;
        const a = state.music;
        const startVol = a.volume;
        const t0 = performance.now();
        const ms = 600;
        const step = (now) => {
          const t = Math.min(1, (now - t0) / ms);
          a.volume = startVol * (1 - t);
          if (t < 1) requestAnimationFrame(step);
          else {
            try{ a.pause(); }catch(_){}
          }
        };
        requestAnimationFrame(step);
        persist();
      }

      function setVolume01(v){
        v = Math.max(0, Math.min(1, v));
        state.vol = v;
        if (state.enabled && state.music){
          fadeTo(v, 220);
        }
        persist();
      }

      function persist(){
        localStorage.setItem(APP.LS.AUDIO_ON, state.enabled ? "1" : "0");
        localStorage.setItem(APP.LS.AUDIO_VOL, String(state.vol));
      }

      function restore(){
        const on = localStorage.getItem(APP.LS.AUDIO_ON);
        const vol = parseFloat(localStorage.getItem(APP.LS.AUDIO_VOL) || "0.35");
        state.vol = isNaN(vol) ? 0.35 : Math.max(0, Math.min(1, vol));
        state.enabled = on === "1";
      }

      function isOn(){ return state.enabled; }
      function vol(){ return state.vol; }

      return { ensure, enable, disable, setVolume01, restore, isOn, vol };
    })();
})();
