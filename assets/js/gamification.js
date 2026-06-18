/* ============================================================
   GAMIFICATION.JS — Capa común de gamificación
   Juegos aeronáuticos (Checklist pre-flight · Ruta de vuelo · Aeropuertos)
   Sin dependencias externas. Expone window.GP.
   No reemplaza la lógica de cada juego: cada juego decide CUÁNDO
   llamar a registerHit()/registerMiss() según su propia mecánica.
   ============================================================ */
(function(){
  "use strict";

  var LS_MUTE = "gp_sound_muted";

  // ---- Niveles (4 tramos, acumulativos por puntaje) ----
  var LEVELS = [
    { id: 1, key: "entrenamiento", name: "Nivel 1 · Entrenamiento",    min: 0  },
    { id: 2, key: "operacion",     name: "Nivel 2 · Operación",        min: 8  },
    { id: 3, key: "mision",        name: "Nivel 3 · Misión avanzada",  min: 18 },
    { id: 4, key: "comandante",    name: "Nivel 4 · Comandante",       min: 30 }
  ];

  // ---- Medallas (por puntaje final) ----
  var MEDALS = [
    { id: "bronce",     name: "Medalla de Bronce",       min: 0  },
    { id: "plata",      name: "Medalla de Plata",        min: 12 },
    { id: "oro",        name: "Medalla de Oro",          min: 22 },
    { id: "comandante", name: "Insignia de Comandante",  min: 32 }
  ];

  function levelFor(score){
    var lvl = LEVELS[0];
    for (var i = 0; i < LEVELS.length; i++){ if (score >= LEVELS[i].min) lvl = LEVELS[i]; }
    return lvl;
  }
  function medalFor(score){
    var m = MEDALS[0];
    for (var i = 0; i < MEDALS.length; i++){ if (score >= MEDALS[i].min) m = MEDALS[i]; }
    return m;
  }

  // ---- Sonido suave (Web Audio, mismo patrón liviano que juego13) ----
  var ctx = null;
  function getCtx(){
    if (!ctx){
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { ctx = null; }
    }
    return ctx;
  }
  function isMuted(){ try { return localStorage.getItem(LS_MUTE) === "1"; } catch(e){ return false; } }
  function setMuted(v){ try { localStorage.setItem(LS_MUTE, v ? "1" : "0"); } catch(e){} }
  function toggleMuted(){ var v = !isMuted(); setMuted(v); return v; }

  function tone(c, freq, startAt, dur, gain){
    var o = c.createOscillator();
    var g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, startAt);
    g.gain.exponentialRampToValueAtTime(0.001, startAt + dur);
    o.start(startAt);
    o.stop(startAt + dur + 0.02);
  }

  function chime(type){
    if (isMuted()) return;
    var c = getCtx();
    if (!c) return;
    var now = c.currentTime;
    if (type === "ok")      { tone(c, 880,  now, 0.10, 0.05); }
    else if (type === "error")   { tone(c, 220,  now, 0.18, 0.05); }
    else if (type === "streak")  { tone(c, 1100, now, 0.10, 0.06); }
    else if (type === "level")   { tone(c, 660,  now, 0.22, 0.07); tone(c, 990, now + 0.12, 0.20, 0.06); }
    else if (type === "win")     { tone(c, 990,  now, 0.26, 0.08); tone(c, 1320, now + 0.14, 0.24, 0.07); }
    else { tone(c, 440, now, 0.12, 0.05); }
  }

  // ---- Mensajes (lenguaje motivador, sin "Error/Fallaste/Incorrecto/Perdiste") ----
  var MSG_HIT = [
    "Procedimiento correcto.",
    "Maniobra precisa.",
    "Checklist en orden.",
    "Buena lectura de instrumentos.",
    "Confirmado por torre."
  ];
  var MSG_MISS = [
    "Recalculando ruta…",
    "Torre solicita nueva verificación.",
    "Ajustá rumbo e intentá de nuevo.",
    "Revisemos ese punto y seguimos.",
    "Casi. Reintentamos la maniobra."
  ];
  var MSG_FINAL = [
    "Misión completada. Buen trabajo en cabina.",
    "Aterrizaje exitoso. Tu entrenamiento avanza.",
    "Vuelo completado con buena performance.",
    "Recorrido finalizado. Cada práctica suma experiencia."
  ];
  function randomOf(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

  // ---- Sesión de juego ----
  function createSession(opts){
    opts = opts || {};
    var s = {
      score: 0,
      streak: 0,
      maxStreak: 0,
      hits: 0,
      misses: 0,
      startedAt: Date.now(),
      level: LEVELS[0]
    };
    var onLevelUp = opts.onLevelUp || function(){};
    var onStreak  = opts.onStreak  || function(){};

    function applyLevel(){
      var newLevel = levelFor(s.score);
      if (newLevel.id !== s.level.id){
        var leveledUp = newLevel.id > s.level.id;
        s.level = newLevel;
        if (leveledUp){ chime("level"); onLevelUp(newLevel); }
      }
    }

    // basePoints: puntos base del acierto. opts2.fast: bonus de velocidad.
    function registerHit(basePoints, opts2){
      opts2 = opts2 || {};
      basePoints = (typeof basePoints === "number") ? basePoints : 2;
      s.hits++;
      s.streak++;
      if (s.streak > s.maxStreak) s.maxStreak = s.streak;

      var streakBonus = Math.floor(s.streak / 3); // +1 cada 3 aciertos seguidos
      var pts = basePoints + streakBonus + (opts2.fast ? 1 : 0);
      s.score += pts;
      applyLevel();

      if (s.streak > 0 && s.streak % 3 === 0){ chime("streak"); onStreak(s.streak); }
      else { chime("ok"); }

      return { points: pts, streak: s.streak, level: s.level, message: randomOf(MSG_HIT) };
    }

    // penalty: penalización SUAVE (por defecto 0 = no resta, solo corta racha)
    function registerMiss(penalty){
      penalty = (typeof penalty === "number") ? penalty : 0;
      s.misses++;
      s.streak = 0;
      s.score = Math.max(0, s.score - penalty);
      applyLevel();
      chime("error");
      return { score: s.score, level: s.level, message: randomOf(MSG_MISS) };
    }

    function getMedal(){ return medalFor(s.score); }

    function summary(){
      var total = s.hits + s.misses;
      var acc = total > 0 ? Math.round((s.hits / total) * 100) : null;
      return {
        score: s.score,
        level: s.level,
        maxStreak: s.maxStreak,
        hits: s.hits,
        misses: s.misses,
        accuracy: acc,
        medal: getMedal(),
        durationSec: Math.round((Date.now() - s.startedAt) / 1000),
        message: randomOf(MSG_FINAL)
      };
    }

    return {
      state: s,
      registerHit: registerHit,
      registerMiss: registerMiss,
      getMedal: getMedal,
      summary: summary
    };
  }

  window.GP = {
    LEVELS: LEVELS,
    MEDALS: MEDALS,
    levelFor: levelFor,
    medalFor: medalFor,
    chime: chime,
    isMuted: isMuted,
    setMuted: setMuted,
    toggleMuted: toggleMuted,
    createSession: createSession,
    msgHit: function(){ return randomOf(MSG_HIT); },
    msgMiss: function(){ return randomOf(MSG_MISS); },
    msgFinal: function(){ return randomOf(MSG_FINAL); }
  };
})();
