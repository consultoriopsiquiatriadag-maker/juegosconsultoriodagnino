(() => {
  window.SILLA_AUDIO_OK = true;

  // =========================
  // Ajustes "premium"
  // =========================
  const CHIME_CUT_MS = 600;          // 🔔 chime cortito
  const FINISH_CELEB_MS = 1600;      // 🎉 mini-celebración (recorte por JS)

  // Duraciones reales (según tu captura):
  // A 00:30, B 00:57, C 01:08, D 00:53  => total 3:28 (208s)
  const STEP_SECONDS = { A: 30, B: 57, C: 68, D: 53 };

  const AUDIO = {
    chime:  "/audio/airport_chime.mp3",
    intro:  "/audio/silla_intro.mp3",
    A:      "/audio/silla_A_aterrizaje.mp3",
    B:      "/audio/silla_B_tension_soltar.mp3",
    C:      "/audio/silla_C_isometricos.mp3",
    D:      "/audio/silla_D_descarga_suave.mp3",
    finish: "/audio/premio_excelente.mp3", // existe en tu carpeta
  };

  const audio = new Audio();
  audio.preload = "auto";
  audio.playsInline = true;

  function stopAudio() {
    try { audio.pause(); audio.currentTime = 0; } catch {}
  }

  function playNow(src, { volume = 1 } = {}) {
    stopAudio();
    audio.src = src;
    audio.volume = volume;
    return audio.play();
  }

  // =========================
  // Rutina (duraciones reales)
  // =========================
  const steps = [
    { key: "A", title: "Aterrizaje",       duration: STEP_SECONDS.A, ui: "Pies al piso. Exhalación larga.", mp3: AUDIO.A },
    { key: "B", title: "Tensión / soltar", duration: STEP_SECONDS.B, ui: "Puños y hombros.",               mp3: AUDIO.B },
    { key: "C", title: "Isométricos",      duration: STEP_SECONDS.C, ui: "Empuje de pies y palmas.",       mp3: AUDIO.C },
    { key: "D", title: "Descarga suave",   duration: STEP_SECONDS.D, ui: "Cuello + mandíbula.",            mp3: AUDIO.D },
  ];

  const totalSeconds = steps.reduce((s, x) => s + x.duration, 0); // 208
  let remaining = totalSeconds;
  let timer = null;

  let running = false;
  let startedOnce = false;
  let lastStepIndex = null;

  // Repetir 1 vez
  let repeatUsed = false;

  // =========================
  // DOM
  // =========================
  const btnMain      = document.getElementById("btnMain");
  const btnResetAll  = document.getElementById("btnResetAll");
  const btnStopAudio = document.getElementById("btnStopAudio");
  const btnTestA     = document.getElementById("btnTestA");
  const btnRepeatOnce= document.getElementById("btnRepeatOnce"); // NUEVO

  const timeEl   = document.getElementById("time");
  const barEl    = document.getElementById("bar");
  const pctEl    = document.getElementById("pct");

  const stepTag  = document.getElementById("stepTag");
  const stepTitle= document.getElementById("stepTitle");
  const stepText = document.getElementById("stepText");
  const statusEl = document.getElementById("status");
  const audioStatus = document.getElementById("audioStatus");

  if (!btnMain || !timeEl) return;

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const fmt = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  };

  function getStepAt(elapsed) {
    let acc = 0;
    for (let i = 0; i < steps.length; i++) {
      const st = steps[i];
      const start = acc;
      const end = acc + st.duration;
      if (elapsed >= start && elapsed < end) {
        const into = elapsed - start;
        const left = st.duration - into;
        return { index: i, ...st, into, left };
      }
      acc = end;
    }
    return null;
  }

  function setBtn(state) {
    if (state === "init")   { btnMain.textContent = "▶️ Iniciar"; btnMain.disabled = false; }
    if (state === "welcome"){ btnMain.textContent = "⏳ Bienvenida…"; btnMain.disabled = true; }
    if (state === "running"){ btnMain.textContent = "⏸️ Pausar"; btnMain.disabled = false; }
    if (state === "pause")  { btnMain.textContent = "▶️ Seguir"; btnMain.disabled = false; }
  }

  function setFocus(on) {
    document.body.classList.toggle("focus", !!on);
  }

  function setRepeatVisibility(show) {
    if (!btnRepeatOnce) return;
    btnRepeatOnce.style.display = show ? "block" : "none";
    btnRepeatOnce.disabled = repeatUsed;
    btnRepeatOnce.textContent = repeatUsed ? "✅ Repetición usada" : "🔁 Repetir 1 vez";
  }

  function update() {
    const elapsed = totalSeconds - remaining;

    timeEl.textContent = fmt(remaining);

    const pct = clamp((elapsed / totalSeconds) * 100, 0, 100);
    if (barEl) barEl.style.width = pct.toFixed(0) + "%";
    if (pctEl) pctEl.textContent = pct.toFixed(0) + "%";

    const st = getStepAt(elapsed);
    if (st) {
      if (stepTag) stepTag.textContent = `Paso ${st.key}`;
      if (stepTitle) stepTitle.textContent = `${st.title} · ${st.left}s`;
      if (stepText) stepText.textContent = st.ui;

      if (running && lastStepIndex !== st.index) {
        lastStepIndex = st.index;
        playNow(st.mp3).then(() => {
          if (audioStatus) audioStatus.textContent = `Reproduciendo Paso ${st.key}…`;
        }).catch(() => {
          if (audioStatus) audioStatus.textContent = `No se pudo reproducir el Paso ${st.key} (ruta/archivo/volumen).`;
        });
      }
    } else {
      if (stepTag) stepTag.textContent = "Final";
      if (stepTitle) stepTitle.textContent = "Rutina finalizada";
      if (stepText) stepText.textContent = "Marcá “Después” y copiá el resumen.";
    }

    if (statusEl) statusEl.textContent = running ? "Rutina en curso…" : (startedOnce ? "Rutina pausada." : "Listo.");
  }

  function startTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (!running) return;
      remaining = Math.max(0, remaining - 1);
      update();
      if (remaining <= 0) finish();
    }, 1000);
  }

  function beginRoutine() {
    running = true;
    setBtn("running");
    lastStepIndex = null;   // fuerza disparo del paso actual
    setRepeatVisibility(false);
    update();
    startTimer();
  }

  // =========================
  // 🔔 Start flow: chime (0.6s) -> intro -> rutina
  // =========================
  function startFlowChained() {
    setFocus(true);
    setBtn("welcome");
    if (audioStatus) audioStatus.textContent = "✅ Iniciando…";

    // 1) arrancar chime dentro del gesto
    playNow(AUDIO.chime, { volume: 0.45 }).catch(() => {});

    // 2) cortar chime a 0.6s y pasar a intro
    setTimeout(() => {
      // cortamos chime sin depender del "ended"
      try { audio.pause(); audio.currentTime = 0; } catch {}

      // preparamos el final de la intro
      audio.onended = () => {
        audio.onended = null;
        beginRoutine();
      };

      playNow(AUDIO.intro, { volume: 1 }).then(() => {
        if (audioStatus) audioStatus.textContent = "Bienvenida…";
      }).catch(() => {
        // si falla intro, arrancamos igual
        audio.onended = null;
        beginRoutine();
        if (audioStatus) audioStatus.textContent = "Bienvenida falló. Arrancando rutina…";
      });
    }, CHIME_CUT_MS);
  }

  function pause() {
    running = false;
    stopAudio();
    setBtn("pause");
    update();
  }

  function resume() {
    if (remaining <= 0) return;
    running = true;
    setBtn("running");
    lastStepIndex = null;
    update();
  }

  // 🎉 cierre final: mini-celebración corta + mostrar repetir
  function finishCelebration() {
    if (!AUDIO.finish) return;
    playNow(AUDIO.finish, { volume: 0.65 }).catch(() => {});
    setTimeout(() => {
      stopAudio();
    }, FINISH_CELEB_MS);
  }

  function finish() {
    running = false;
    stopAudio();
    audio.onended = null;
    if (timer) { clearInterval(timer); timer = null; }

    // 🎉 mini-celebración (no molesta: corta)
    finishCelebration();

    setBtn("pause");
    update();

    // Mostrar "Repetir 1 vez" si aún no fue usada
    setRepeatVisibility(!repeatUsed);

    document.dispatchEvent(new CustomEvent("sillaRutinaFinalizada"));
  }

  function resetAll() {
    running = false;
    stopAudio();
    audio.onended = null;

    remaining = totalSeconds;
    if (timer) { clearInterval(timer); timer = null; }

    startedOnce = false;
    lastStepIndex = null;

    // reset NO reinicia la “repetición usada” (queda como “una vez por sesión”)
    setFocus(false);
    setBtn("init");
    setRepeatVisibility(false);

    if (audioStatus) audioStatus.textContent = `Listo. Duración: ${fmt(totalSeconds)}. Tocá Iniciar para habilitar audio.`;
    if (stepTag) stepTag.textContent = "—";
    if (stepTitle) stepTitle.textContent = "Listo para empezar";
    if (stepText) stepText.textContent = "Tocá Iniciar y seguí la voz.";

    update();
  }

  function repeatOnce() {
    if (repeatUsed) return;
    repeatUsed = true;

    // reiniciar rutina (sin intro: más ágil)
    stopAudio();
    audio.onended = null;
    remaining = totalSeconds;

    setRepeatVisibility(false);

    // chime muy cortito y arranca rutina directo
    playNow(AUDIO.chime, { volume: 0.45 }).catch(() => {});
    setTimeout(() => {
      stopAudio();
      beginRoutine();
    }, CHIME_CUT_MS);
  }

  // =========================
  // Events
  // =========================
  btnMain.addEventListener("click", () => {
    if (!startedOnce) {
      startedOnce = true;
      startFlowChained();
      return;
    }
    if (running) pause();
    else resume();
  });

  btnResetAll?.addEventListener("click", resetAll);

  btnStopAudio?.addEventListener("click", () => {
    stopAudio();
    audio.onended = null;
    if (audioStatus) audioStatus.textContent = "Audio detenido.";
  });

  btnTestA?.addEventListener("click", () => {
    playNow(AUDIO.A).then(() => {
      if (audioStatus) audioStatus.textContent = "Reproduciendo Paso A…";
    }).catch(() => {
      if (audioStatus) audioStatus.textContent = "No se pudo reproducir Paso A.";
    });
  });

  btnRepeatOnce?.addEventListener("click", repeatOnce);

  // init
  timeEl.textContent = fmt(totalSeconds); // ahora 03:28
  setBtn("init");
  setRepeatVisibility(false);
  if (audioStatus) audioStatus.textContent = `Listo. Duración: ${fmt(totalSeconds)}. Tocá Iniciar para habilitar audio.`;
  update();
})();
