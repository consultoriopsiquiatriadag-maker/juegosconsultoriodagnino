/* ============================================================
   CASINO-SOUND.JS — Sistema de sonido opcional y reutilizable
   para los juegos tipo casino (Casino Aeronáutico · Casino de
   Salud Mental).

   Reglas de diseño (no negociables):
   - Los sonidos son siempre opcionales y se pueden apagar.
   - Nunca se reproducen automáticamente al cargar la página:
     solo se disparan desde un gesto del usuario (click en
     "Girar", "Sortear", "Tomar carta", etc.) que cada juego
     define por su cuenta llamando a CasinoSound.play(...).
   - El estado de sonido (activado/desactivado) se recuerda
     entre visitas mediante localStorage.
   - Este archivo NO reproduce nada por sí mismo: solo expone
     la API y conecta el botón .casino-sound-toggle si existe
     en la página.
   ============================================================ */
(function () {
  "use strict";

  var STATE_KEY = "dagninoCasinoSoundEnabled";
  var soundEnabled = localStorage.getItem(STATE_KEY) !== "false";

  function labelFor(enabled) {
    return enabled ? "🔊 Sonido: Activado" : "🔇 Sonido: Desactivado";
  }

  function updateButton(btn) {
    if (!btn) return;
    btn.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
    btn.textContent = labelFor(soundEnabled);
  }

  function updateAllButtons() {
    var btns = document.querySelectorAll(".casino-sound-toggle");
    for (var i = 0; i < btns.length; i++) updateButton(btns[i]);
  }

  function setSoundEnabled(enabled) {
    soundEnabled = !!enabled;
    try { localStorage.setItem(STATE_KEY, String(soundEnabled)); } catch (e) {}
    updateAllButtons();
  }

  /**
   * Reproduce un <audio> por id, solo si el sonido está activado.
   * No lanza errores si el navegador bloquea la reproducción por
   * falta de interacción previa: simplemente no suena.
   * opts.volume permite un volumen puntual (0..1); por defecto 0.35.
   */
  function playCasinoSound(audioId, opts) {
    if (!soundEnabled) return;
    var audio = document.getElementById(audioId);
    if (!audio) return;
    var volume = (opts && typeof opts.volume === "number") ? opts.volume : 0.35;
    volume = Math.max(0, Math.min(1, volume));
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = volume;
      var p = audio.play();
      if (p && typeof p.catch === "function") {
        p.catch(function () {
          // El navegador puede bloquear el audio si no hubo
          // interacción previa del usuario. No es un error a mostrar.
        });
      }
    } catch (e) {}
  }

  function initToggles() {
    var btns = document.querySelectorAll(".casino-sound-toggle");
    for (var i = 0; i < btns.length; i++) {
      updateButton(btns[i]);
      btns[i].addEventListener("click", function () {
        setSoundEnabled(!soundEnabled);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initToggles);
  } else {
    initToggles();
  }

  window.CasinoSound = {
    play: playCasinoSound,
    isEnabled: function () { return soundEnabled; },
    setEnabled: setSoundEnabled
  };
})();
