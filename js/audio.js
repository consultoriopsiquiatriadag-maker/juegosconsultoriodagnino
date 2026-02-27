(() => {
  // --- Audios ---
  const welcome = new Audio("audio/bienvenida.mp3");
  const bg = new Audio("audio/musica_fondo.mp3");

  welcome.preload = "auto";
  bg.preload = "auto";
  bg.loop = true;

  // --- Persistencia ---
  const WELCOME_KEY = "audio_bienvenida_reproducida";
  const AUDIO_ON_KEY = "audio_on";
  const VOL_KEY = "audio_vol";

  // --- UI ---
  const btnToggle = document.getElementById("audioToggle");
  const sliderVol = document.getElementById("audioVolume");

  if (!btnToggle || !sliderVol) {
    console.warn("No se encontraron los controles #audioToggle / #audioVolume.");
    return;
  }

  // --- Estado ---
  let audioOn = (localStorage.getItem(AUDIO_ON_KEY) ?? "0") === "1";
  let volume = parseInt(localStorage.getItem(VOL_KEY) ?? "20", 10);
  if (Number.isNaN(volume)) volume = 20;

  function stopAll() {
    try { welcome.pause(); } catch {}
    try { bg.pause(); } catch {}
  }

  function applyVolume() {
    const v = Math.min(100, Math.max(0, volume)) / 100;
    welcome.volume = Math.min(1, v * 1.0);
    bg.volume = Math.min(1, v * 0.6);
  }

  function renderUI() {
    btnToggle.textContent = audioOn ? "🔊 Silenciar" : "🔇 Activar audio";
    sliderVol.value = String(volume);
  }

  async function playSafe(aud) {
    try {
      await aud.play();
      return true;
    } catch (e) {
      console.log("play() falló:", e);
      return false;
    }
  }

  // Desbloqueo robusto (muted play) dentro del click
  async function unlockOnGesture() {
    bg.muted = true;
    bg.volume = 0;

    const ok = await playSafe(bg);
    if (ok) {
      bg.pause();
      bg.currentTime = 0;
    }

    bg.muted = false;
    applyVolume();
    return ok;
  }

  async function startSequence() {
    applyVolume();
    const welcomed = localStorage.getItem(WELCOME_KEY) === "1";

    if (!welcomed) {
      stopAll();
      welcome.currentTime = 0;

      const okW = await playSafe(welcome);
      if (!okW) return false;

      localStorage.setItem(WELCOME_KEY, "1");

      welcome.onended = async () => {
        if (!audioOn) return;
        bg.currentTime = 0;
        await playSafe(bg);
      };

      return true;
    }

    stopAll();
    bg.currentTime = 0;
    return await playSafe(bg);
  }

  async function setAudio(on) {
    audioOn = on;
    localStorage.setItem(AUDIO_ON_KEY, audioOn ? "1" : "0");
    renderUI();

    if (!audioOn) {
      stopAll();
      return;
    }

    await unlockOnGesture();
    const ok = await startSequence();
    if (!ok) btnToggle.textContent = "🔇 No se pudo reproducir";
  }

  function setVol(val) {
    volume = Math.min(100, Math.max(0, val));
    localStorage.setItem(VOL_KEY, String(volume));
    applyVolume();
    renderUI();
  }

  // Eventos
  btnToggle.addEventListener("click", async () => {
    await setAudio(!audioOn);
  });

  sliderVol.addEventListener("input", (e) => {
    const v = parseInt(e.target.value, 10);
    setVol(Number.isNaN(v) ? 20 : v);
  });

  // Init
  applyVolume();
  renderUI();
})();
