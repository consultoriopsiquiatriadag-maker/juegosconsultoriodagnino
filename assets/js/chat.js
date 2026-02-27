/* =====================================================
   CHAT DE APOYO (IA) — Consultorio Dr. Dagnino
   assets/js/chat.js  |  v1.0  (2026-02-21)

   Motor: State Machine + Intent Matching (100% frontend, sin API)

   ── CÓMO AGREGAR RECURSOS ────────────────────────────
   En CFG.recursos, cada entrada tiene:
     { label: 'Nombre visible', url: 'pagina.html', desc: 'Descripción breve' }
   Agregá entradas nuevas al final del array.

   ── CÓMO CONECTAR UN LLM EN EL FUTURO ────────────────
   Implementá window.ChatLLMAdapter.getResponse() y el motor
   lo usará automáticamente para los estados TEXT_FREE.
   Ver sección "ADAPTER LLM" al final de este archivo.
   ===================================================== */

(function () {
  'use strict';

  /* ── CONFIGURACIÓN ─────────────────────────────────── */
  const CFG = {
    wa_number: '5491124769361',
    wa_base:   'https://wa.me/',
    disclaimer_key: 'dagnino_chat_disclaimer_v1',
    typing_delay:   650,  // ms antes de que aparezca la respuesta del bot
    timezone:       'America/Argentina/Cordoba',

    /* ── RECURSOS INTERNOS DEL CONSULTORIO ────────────
       Para agregar un recurso: copiar una línea y completar.
       url puede ser relativa (ej: 'juegos.html') o absoluta. */
    recursos: [
      { label: 'Central de Turnos',        url: 'turnos.html',                           desc: 'Coordinar turnos y consultas administrativas' },
      { label: 'Juegos cognitivos',         url: 'juegos.html',                           desc: 'Entrenamiento mental breve y amable' },
      { label: 'Psicoeducación',            url: 'psicoeducacion.html',                   desc: 'Comprender la salud mental' },
      { label: 'Ejercicios guiados',        url: 'psicoeducacion-ejercicios.html',        desc: 'Recursos prácticos para el día a día' },
      { label: 'Síntomas de ansiedad',      url: 'sintomas-ansiedad.html',                desc: 'Qué son y cómo manejarlos' },
      { label: 'Técnica silla de ansiedad', url: 'silla-ansiedad.html',                   desc: 'Técnica estructurada de manejo de ansiedad' },
      { label: 'Higiene del sueño',         url: 'higienedelsueno.html',                  desc: 'Recomendaciones clínicas para dormir mejor' },
      { label: 'Sobre el sueño',            url: 'sueno.html',                            desc: 'Información clínica sobre el sueño' },
      { label: 'Tests psicológicos',        url: 'bateria-tests-psicologicos.html',       desc: 'Conocé los tests básicos del tratamiento' },
      { label: 'Registro emocional',        url: 'emociones.html',                        desc: 'Registrá y explorá tus estados emocionales' },
      { label: 'Apps para pacientes',       url: 'apps.html',                             desc: 'Aplicaciones recomendadas por el consultorio' },
      { label: 'Temas de salud mental',     url: 'temas-salud-mental.html',               desc: 'Guías claras por tema' },
      { label: 'Videos y reels',            url: 'reels.html',                            desc: 'Píldoras clínicas y psicoeducativas' },
      { label: 'Equipo profesional',        url: 'equipo.html',                           desc: 'Conocé al equipo asociado del consultorio' },
      { label: 'Centros médicos amigos',    url: 'centros-medicos-amigos.html',           desc: 'Centros e instituciones asociadas' },
    ]
  };

  /* ── ESTADOS ───────────────────────────────────────── */
  const S = {
    INIT:              'init',
    MAIN_MENU:         'main_menu',
    SAFETY_CHECK:      'safety_check',
    ANXIETY_CHOICE:    'anxiety_choice',
    BREATHING:         'breathing',
    BREATHING_TIMED:   'breathing_timed',
    GROUNDING:         'grounding',
    RELAX:             'relax',
    PANIC:             'panic',
    POST_FLOW:         'post_flow',
    SLEEP:             'sleep',
    RESOURCES:         'resources',
    SEARCH_PRO:        'search_pro',
    MSG_DOCTOR:        'msg_doctor',
    CRISIS:            'crisis',
  };

  /* ── ESTADO INTERNO ────────────────────────────────── */
  let state          = S.INIT;
  let ctx            = {};           // contexto de conversación
  let profesionales  = [];           // cargado desde /data/profesionales.json

  /* ── REFERENCIAS DOM ───────────────────────────────── */
  let $panel, $msgs, $chips, $input, $sendBtn, $expandBtn, $disclaimer;

  /* ── HELPERS ───────────────────────────────────────── */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getFechaHora() {
    try {
      const opts = {
        timeZone: CFG.timezone,
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      };
      return new Date().toLocaleString('es-AR', opts).replace(',', '');
    } catch (_) {
      return new Date().toLocaleString('es-AR');
    }
  }

  function waLink(text) {
    return CFG.wa_base + CFG.wa_number + '?text=' + encodeURIComponent(text);
  }

  function scrollBottom() {
    if ($msgs) $msgs.scrollTop = $msgs.scrollHeight;
  }

  /* ── DISCLAIMER ────────────────────────────────────── */
  function initDisclaimer() {
    if (sessionStorage.getItem(CFG.disclaimer_key)) {
      startChat();
    } else {
      renderDisclaimer();
    }
  }

  function renderDisclaimer() {
    $disclaimer = document.createElement('div');
    $disclaimer.className = 'chat-disclaimer';
    $disclaimer.setAttribute('role', 'alertdialog');
    $disclaimer.setAttribute('aria-labelledby', 'chatDisclaimerTitle');
    $disclaimer.innerHTML =
      '<div class="chat-disclaimer-icon" aria-hidden="true">⚠️</div>' +
      '<h4 id="chatDisclaimerTitle">Asistente automático</h4>' +
      '<p>Este asistente <strong>no reemplaza la atención médica profesional</strong> ni está habilitado para urgencias médicas.<br><br>' +
      'Para emergencias, llamá al <strong>911</strong> o acudí a la guardia más cercana.</p>' +
      '<div class="chat-disclaimer-actions">' +
        '<button class="chat-chip chip-primary" id="chatDisclaimerOk">Entendido, continuar</button>' +
        '<a class="chat-chip chip-wa" href="' + waLink('Hola, quiero hablar con un humano de la Central de Turnos.') + '" target="_blank" rel="noopener noreferrer">Hablar con humano</a>' +
      '</div>';
    $panel.appendChild($disclaimer);

    document.getElementById('chatDisclaimerOk').addEventListener('click', function () {
      sessionStorage.setItem(CFG.disclaimer_key, '1');
      $disclaimer.remove();
      $disclaimer = null;
      startChat();
    });
  }

  /* ── RENDER HELPERS ────────────────────────────────── */
  function addMsg(html, role, isHtml) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    var bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    if (isHtml) { bubble.innerHTML = html; } else { bubble.textContent = html; }
    div.appendChild(bubble);
    $msgs.appendChild(div);
    scrollBottom();
    return div;
  }

  function addUserMsg(text) { addMsg(text, 'user', false); }

  function showTyping() {
    var div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.id = 'chatTypingIndicator';
    div.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
    $msgs.appendChild(div);
    scrollBottom();
  }

  function removeTyping() {
    var el = document.getElementById('chatTypingIndicator');
    if (el) el.remove();
  }

  /* botReply: muestra typing → luego el mensaje. Retorna Promise */
  function botReply(html, isHtml, delay) {
    delay = (delay === undefined) ? CFG.typing_delay : delay;
    return new Promise(function (resolve) {
      showTyping();
      setTimeout(function () {
        removeTyping();
        addMsg(html, 'bot', !!isHtml);
        resolve();
      }, delay);
    });
  }

  function setChips(chips) {
    $chips.innerHTML = '';
    chips.forEach(function (c) {
      var el;
      if (c.href) {
        el = document.createElement('a');
        el.href = c.href;
        if (c.href.startsWith('http') || c.href.startsWith('tel:')) {
          el.target = '_blank';
          el.rel    = 'noopener noreferrer';
        }
      } else {
        el = document.createElement('button');
        el.type = 'button';
      }
      el.className = 'chat-chip' +
        (c.primary ? ' chip-primary' : '') +
        (c.danger  ? ' chip-danger'  : '') +
        (c.wa      ? ' chip-wa'      : '');
      el.textContent = c.label;
      if (c.action) { el.addEventListener('click', c.action); }
      $chips.appendChild(el);
    });
  }

  function clearChips() { $chips.innerHTML = ''; }

  function showInput(show) {
    if ($input && $input.parentElement) {
      $input.parentElement.style.display = (show === false) ? 'none' : '';
    }
  }

  /* Tarjeta de recurso reutilizable */
  function makeResourceCard(r) {
    var card = document.createElement('div');
    card.className = 'chat-resource-card';
    card.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
        '<div>' +
          '<strong>' + esc(r.label) + '</strong>' +
          '<span>' + esc(r.desc) + '</span>' +
        '</div>' +
        '<a href="' + esc(r.url) + '" class="chat-chip chip-primary" ' +
           'style="text-decoration:none;white-space:nowrap;font-size:11.5px;padding:4px 10px">' +
          'Ir ahora →' +
        '</a>' +
      '</div>';
    return card;
  }

  /* Agregar bloque de tarjetas */
  function appendCards(items) {
    var wrap = document.createElement('div');
    wrap.className = 'chat-msg full';
    var inner = document.createElement('div');
    inner.style.cssText = 'display:flex;flex-direction:column;gap:5px;width:100%;';
    items.forEach(function (r) { inner.appendChild(makeResourceCard(r)); });
    wrap.appendChild(inner);
    $msgs.appendChild(wrap);
    scrollBottom();
  }

  /* ── INICIO DEL CHAT ───────────────────────────────── */
  function startChat() {
    state = S.MAIN_MENU;
    botReply(
      '¡Hola! Soy el asistente de apoyo del consultorio. Podés pedirme ayuda con recursos de bienestar, ' +
      'información del consultorio o contactar con el equipo humano.',
      false, 350
    ).then(showMainMenu);
  }

  /* ── MENÚ PRINCIPAL ────────────────────────────────── */
  function showMainMenu() {
    state = S.MAIN_MENU;
    showInput(true);
    $input.placeholder = 'Escribí tu consulta o elegí una opción...';
    setChips([
      { label: '🧘 Ansiedad ahora (2 min)',            action: doAnsiedad },
      { label: '🌬️ Respirar 60–90 s',                  action: doRespiracionTimed },
      { label: '🌿 Grounding 5-4-3-2-1',               action: doGrounding },
      { label: '🌙 Dormir mejor',                       action: doSueno },
      { label: '📋 Recursos del consultorio',           action: doRecursos },
      { label: '🎮 Juegos de calma',                    action: doJuegos },
      { label: '🔍 Buscar un profesional',              action: doBuscarPro },
      { label: '📩 Enviar mensaje al Doctor',           action: doMsgDoctor },
      { label: '💬 Hablar con Humano (Central de Turnos)', action: doHumano, wa: true },
    ]);
  }

  /* ── SAFETY CHECK ──────────────────────────────────── */
  function askSafety(onOk) {
    state = S.SAFETY_CHECK;
    ctx.safetyOk = onOk;
    showInput(false);
    botReply(
      '<div class="chat-safety-box">⚠️ Antes de continuar, necesito preguntarte:<br><br>' +
      '<strong>¿Estás pensando en hacerte daño o estás en peligro inmediato?</strong></div>',
      true
    ).then(function () {
      setChips([
        { label: '✅ No, estoy bien',                          action: safetyNo   },
        { label: '🆘 Sí, necesito ayuda urgente ahora',        action: safetyCrisis, danger: true },
      ]);
    });
  }

  function safetyNo() {
    addUserMsg('No, estoy bien');
    clearChips();
    var cb = ctx.safetyOk;
    ctx.safetyOk = null;
    botReply('Perfecto, continuamos 🙏', false, 350).then(function () {
      if (cb) cb();
    });
  }

  function safetyCrisis() {
    addUserMsg('Sí, necesito ayuda urgente');
    doCrisis();
  }

  function doCrisis() {
    state = S.CRISIS;
    clearChips();
    showInput(false);
    botReply(
      '<div class="chat-crisis-box">' +
        '<strong>🆘 Necesitás ayuda ahora mismo</strong>' +
        'Si estás en peligro inmediato, llamá al <strong>911</strong> o acudí a la guardia de urgencias más cercana.<br><br>' +
        'También podés contactar ahora mismo con una persona real de la Central de Turnos:' +
      '</div>',
      true, 400
    ).then(function () {
      setChips([
        { label: '💬 Hablar con persona real (WhatsApp)', href: waLink('🆘 Necesito hablar con alguien urgente. Estoy contactando desde la web del consultorio.'), wa: true },
        { label: '📞 Emergencias: 911',                  href: 'tel:911' },
        { label: '↩️ Volver al inicio',                  action: showMainMenu },
      ]);
    });
  }

  /* ── ANSIEDAD AHORA ────────────────────────────────── */
  function doAnsiedad() {
    addUserMsg('Ansiedad ahora (2 min)');
    clearChips();
    askSafety(showAnsiedadChoice);
  }

  function showAnsiedadChoice() {
    state = S.ANXIETY_CHOICE;
    botReply('Entiendo que estás sintiendo ansiedad. ¿Cuál técnica querés probar ahora?', false, 350)
      .then(function () {
        setChips([
          { label: '🌬️ Respiración 4-7-8',            action: doRespiracion },
          { label: '🌿 Grounding (anclaje al presente)', action: doGrounding  },
          { label: '💆 Relajar cuerpo (tensión muscular)', action: doRelax   },
          { label: '⚡ Modo pánico (guía rápida)',        action: doPanico    },
          { label: '↩️ Menú principal',                  action: showMainMenu },
        ]);
      });
  }

  /* ── RESPIRACIÓN 4-7-8 ─────────────────────────────── */
  function doRespiracion() {
    addUserMsg('Respiración 4-7-8');
    clearChips();
    showInput(false);
    state = S.BREATHING;
    botReply('Vamos con respiración 4-7-8. Preparate: podés hacerlo sentado o de pie.', false, 350)
      .then(run478);
  }

  function run478() {
    var steps = [
      { t: '🔵 Inhalá por la nariz... (4 segundos)',   d: 4500 },
      { t: '⏸️ Retené el aire... (7 segundos)',          d: 7500 },
      { t: '💨 Exhalá lento por la boca... (8 segundos)', d: 8500 },
    ];
    var cycle = 0;
    var maxCycles = 3;

    function nextStep(i) {
      if (i >= steps.length) {
        cycle++;
        if (cycle >= maxCycles) {
          botReply('✅ ¡Muy bien! Completaste 3 ciclos de respiración 4-7-8. ¿Cómo te sentís?', false, 600)
            .then(showPostFlow);
          return;
        }
        botReply('Ciclo ' + (cycle + 1) + ' de ' + maxCycles + '...', false, 300)
          .then(function () { nextStep(0); });
        return;
      }
      addMsg(steps[i].t, 'bot', false);
      scrollBottom();
      setTimeout(function () { nextStep(i + 1); }, steps[i].d);
    }

    botReply('Ciclo 1 de 3...', false, 300).then(function () { nextStep(0); });
  }

  /* ── RESPIRACIÓN TEMPORIZADA (60-90 s) ─────────────── */
  function doRespiracionTimed() {
    addUserMsg('Respirar 60–90 s');
    clearChips();
    showInput(false);
    state = S.BREATHING_TIMED;
    botReply('Vamos a hacer respiración consciente durante 90 segundos. Seguí el ritmo.', false, 350)
      .then(function () { runTimed(90); });
  }

  function runTimed(seconds) {
    var elapsed    = 0;
    var phases     = ['🔵 Inhalá... (4s)', '⏸️ Pausa... (2s)', '💨 Exhalá... (4s)', '⏸️ Pausa... (2s)'];
    var phaseDurs  = [4, 2, 4, 2];
    var phaseIdx   = 0;
    var phaseElapsed = 0;

    addMsg(phases[0], 'bot', false);
    scrollBottom();

    var iv = setInterval(function () {
      elapsed++;
      phaseElapsed++;
      if (phaseElapsed >= phaseDurs[phaseIdx]) {
        phaseElapsed = 0;
        phaseIdx = (phaseIdx + 1) % phases.length;
        addMsg(phases[phaseIdx], 'bot', false);
        scrollBottom();
      }
      if (elapsed >= seconds) {
        clearInterval(iv);
        botReply('✅ ¡Excelente! 90 segundos de respiración consciente. ¿Cómo te sentís del 0 al 10?', false, 600)
          .then(showPostFlow);
      }
    }, 1000);
  }

  /* ── GROUNDING 5-4-3-2-1 ───────────────────────────── */
  function doGrounding() {
    addUserMsg('Grounding 5-4-3-2-1');
    clearChips();
    showInput(false);
    state = S.GROUNDING;

    var steps = [
      { n: 5, sense: '👁️ vista',  inst: 'Nombrá mentalmente <strong>5 cosas que podés ver</strong> ahora mismo. Mirá despacio a tu alrededor.' },
      { n: 4, sense: '✋ tacto',  inst: 'Notá <strong>4 texturas o sensaciones físicas</strong> que estás sintiendo: el sillón, la ropa, el suelo...' },
      { n: 3, sense: '👂 oído',   inst: 'Escuchá atentamente. ¿Cuáles son <strong>3 sonidos</strong> que existen en este momento?' },
      { n: 2, sense: '👃 olfato', inst: '<strong>2 olores</strong> que podés identificar. Si no hay mucho, respirá profundo y notá el aire.' },
      { n: 1, sense: '👅 gusto',  inst: '<strong>1 cosa que podés saborear</strong>. ¿Cómo es el sabor en tu boca ahora mismo?' },
    ];

    var delays = [0, 14000, 23000, 32000, 41000];

    botReply('Vamos con el Grounding 5-4-3-2-1. Te ayuda a anclarte al presente. Seguí cada paso a tu ritmo.', false, 400)
      .then(function () {
        steps.forEach(function (step, i) {
          setTimeout(function () {
            addMsg(
              '<strong>' + step.n + ' — ' + step.sense + '</strong><br>' + step.inst,
              'bot', true
            );
            scrollBottom();
            if (i === steps.length - 1) {
              setTimeout(function () {
                botReply('✅ ¡Completaste el grounding! ¿Cómo te sentís ahora del 0 al 10?', false, 500)
                  .then(showPostFlow);
              }, 11000);
            }
          }, delays[i] + 800);
        });
      });
  }

  /* ── RELAJACIÓN MUSCULAR PROGRESIVA ────────────────── */
  function doRelax() {
    addUserMsg('Relajar el cuerpo');
    clearChips();
    showInput(false);
    state = S.RELAX;

    var pasos = [
      'Empezamos por los pies. Apretá los dedos con fuerza... 5 segundos...',
      '...y ahora soltá. Sentí la diferencia entre tensión y relajación.',
      'Ahora los muslos. Tensionalos bien fuerte... 5 segundos...',
      '...soltá. Respirá profundo.',
      'Apretá los puños fuertemente... 5 segundos...',
      '...soltá lentamente. Manos abiertas.',
      'Elevá los hombros hacia las orejas... tensión máxima...',
      '...dejálos caer. Respirá.',
      'Fruncí el ceño y apretá la mandíbula... 5 segundos...',
      '...soltá todo. Boca levemente abierta. Cara completamente suave.',
    ];

    botReply('Vamos a relajar el cuerpo de abajo hacia arriba. Seguí cada instrucción.', false, 400)
      .then(function () {
        pasos.forEach(function (paso, i) {
          setTimeout(function () {
            addMsg(paso, 'bot', false);
            scrollBottom();
            if (i === pasos.length - 1) {
              setTimeout(function () {
                botReply('✅ ¡Muy bien! Completaste la relajación muscular. ¿Cómo te sentís ahora?', false, 500)
                  .then(showPostFlow);
              }, 7000);
            }
          }, i * 6000 + 800);
        });
      });
  }

  /* ── MODO PÁNICO ───────────────────────────────────── */
  function doPanico() {
    addUserMsg('Modo pánico');
    clearChips();
    showInput(false);
    state = S.PANIC;

    var pasos = [
      '⚡ Recordá: el pánico, aunque aterrador, no es peligroso. Va a pasar.',
      '1. Pará lo que estás haciendo. Sentate si podés.',
      '2. Poné los pies planos en el piso. Sentí el suelo firme debajo.',
      '3. Respirá LENTO: 4 contando adentro, 4 contando afuera. Solo eso.',
      '4. Nombrá 3 cosas que ves ahora mismo (aunque sea mentalmente).',
      '5. Repetite: "Esto va a pasar. Ya lo viví antes. Estoy a salvo."',
    ];

    botReply('Vamos paso a paso. Leé cada uno con calma.', false, 400)
      .then(function () {
        pasos.forEach(function (paso, i) {
          setTimeout(function () {
            addMsg(paso, 'bot', false);
            scrollBottom();
            if (i === pasos.length - 1) {
              setTimeout(function () {
                botReply('✅ ¿Cómo te sentís ahora? Indicá del 0 al 10.', false, 500)
                  .then(showPostFlow);
              }, 4000);
            }
          }, i * 5000 + 800);
        });
      });
  }

  /* ── POST-FLOW: escala 0-10 + sugerencias ──────────── */
  function showPostFlow() {
    state = S.POST_FLOW;
    showInput(true);
    $input.placeholder = 'Escribí un número del 0 al 10...';
    setChips([
      { label: '0–2 · Mucho mejor',     action: function () { handleScale(1); }  },
      { label: '3–4 · Algo mejor',      action: function () { handleScale(4); }  },
      { label: '5   · Igual',           action: function () { handleScale(5); }  },
      { label: '6–7 · Todavía ansioso', action: function () { handleScale(7); }  },
      { label: '8–10 · Muy intenso',    action: function () { handleScale(9); }  },
      { label: '↩️ Menú principal',     action: showMainMenu },
    ]);
  }

  function handleScale(n) {
    addUserMsg(n + '/10');
    clearChips();
    var msg;
    if (n <= 3) {
      msg = '¡Muy bien! Con ' + n + '/10, la técnica ayudó bastante. Podés explorar más recursos o descansar.';
    } else if (n <= 6) {
      msg = 'Con ' + n + '/10, algo mejoró. A veces se necesitan varias rondas o combinar técnicas.';
    } else {
      msg = 'Con ' + n + '/10, todavía es intenso. Recordá: si sentís que no podés manejarlo solo, contactá al equipo humano.';
    }
    botReply(msg).then(function () {
      botReply('Te dejo algunos recursos del consultorio que pueden ayudarte:', false, 400).then(function () {
        appendCards(CFG.recursos.filter(function (r) {
          return ['sintomas-ansiedad.html', 'silla-ansiedad.html', 'psicoeducacion-ejercicios.html'].indexOf(r.url) !== -1;
        }));
        setChips([
          { label: '🔄 Intentar otra técnica',  action: showAnsiedadChoice },
          { label: '💬 Hablar con humano',       href: waLink('Hola, necesito apoyo. Estoy contactando desde el chat del consultorio.'), wa: true },
          { label: '↩️ Menú principal',          action: showMainMenu },
        ]);
      });
    });
  }

  /* ── DORMIR MEJOR ──────────────────────────────────── */
  function doSueno() {
    addUserMsg('Dormir mejor');
    clearChips();
    showInput(false);
    state = S.SLEEP;

    botReply('La higiene del sueño es clave para la salud mental. Te comparto recursos y tips rápidos.', false, 400)
      .then(function () {
        appendCards(CFG.recursos.filter(function (r) {
          return ['higienedelsueno.html', 'sueno.html'].indexOf(r.url) !== -1;
        }));
        return botReply('Tips rápidos para dormir mejor:', false, 500);
      })
      .then(function () {
        addMsg(
          '<ul style="margin:4px 0;padding-left:18px;line-height:1.75">' +
            '<li>Acostarte y levantarte siempre a la misma hora</li>' +
            '<li>Evitar pantallas al menos 1h antes de dormir</li>' +
            '<li>Temperatura del cuarto entre 18-20°C</li>' +
            '<li>Sin cafeína después de las 15:00 hs</li>' +
            '<li>Si no dormís en 20 min, levantate y hacé algo tranquilo</li>' +
          '</ul>',
          'bot', true
        );
        scrollBottom();
        setTimeout(function () {
          setChips([
            { label: '📖 Higiene del sueño completa', href: 'higienedelsueno.html' },
            { label: '🌙 Sobre el sueño',             href: 'sueno.html' },
            { label: '💬 Consultar con equipo',        href: waLink('Hola, tengo dificultades para dormir y quiero consultar.'), wa: true },
            { label: '↩️ Menú principal',              action: showMainMenu },
          ]);
          showInput(false);
        }, 600);
      });
  }

  /* ── RECURSOS DEL CONSULTORIO ──────────────────────── */
  function doRecursos() {
    addUserMsg('Recursos del consultorio');
    clearChips();
    state = S.RESOURCES;
    showInput(true);
    $input.placeholder = 'Filtrar recursos...';

    botReply('Estos son todos los recursos disponibles. Tocá "Ir ahora" para acceder directamente:', false, 350)
      .then(function () {
        appendCards(CFG.recursos);
        setChips([{ label: '↩️ Menú principal', action: showMainMenu }]);
      });
  }

  /* ── JUEGOS DE CALMA ───────────────────────────────── */
  function doJuegos() {
    addUserMsg('Juegos de calma');
    clearChips();
    botReply(
      'Los juegos cognitivos del consultorio están diseñados para estimular la mente y reducir la ansiedad. ' +
      '¡Perfectos para la sala de espera!', false, 350
    ).then(function () {
      setChips([
        { label: '🎮 Todos los juegos',          href: 'juegos.html', primary: true },
        { label: '🌬️ Juego de respiración',      href: 'juego19-respiracion-secuencia.html' },
        { label: '↩️ Menú principal',             action: showMainMenu },
      ]);
    });
  }

  /* ── BUSCAR PROFESIONAL ────────────────────────────── */
  function doBuscarPro() {
    addUserMsg('Buscar un profesional');
    clearChips();
    state = S.SEARCH_PRO;
    showInput(true);
    $input.placeholder = 'Buscar por nombre o especialidad...';

    function renderDir(query) {
      var q = query.toLowerCase().trim();
      var list = q
        ? profesionales.filter(function (p) {
            return p.nombre.toLowerCase().indexOf(q) !== -1 ||
              (p.especialidades || []).some(function (e) { return e.toLowerCase().indexOf(q) !== -1; }) ||
              (p.tags || []).some(function (t) { return t.toLowerCase().indexOf(q) !== -1; });
          })
        : profesionales;

      clearChips();

      if (profesionales.length === 0) {
        botReply(
          'El directorio de profesionales está vacío todavía.<br><br>' +
          'Para agregar profesionales, completá el archivo <code>data/profesionales.json</code> ' +
          '(ver comentarios dentro del archivo para instrucciones).<br><br>' +
          'Mientras tanto, podés ver el equipo completo del consultorio:',
          true
        ).then(function () {
          setChips([
            { label: '👥 Ver equipo asociado', href: 'equipo.html', primary: true },
            { label: '↩️ Menú principal',       action: showMainMenu },
          ]);
        });
        return;
      }

      if (list.length === 0) {
        botReply('No encontré profesionales con ese criterio. Probá con otra especialidad o nombre.').then(function () {
          setChips([
            { label: '🔍 Nueva búsqueda', action: function () { clearChips(); $input.focus(); } },
            { label: '👥 Ver equipo completo', href: 'equipo.html' },
            { label: '↩️ Menú principal', action: showMainMenu },
          ]);
        });
        return;
      }

      botReply('Encontré ' + list.length + ' profesional' + (list.length > 1 ? 'es' : '') + ':', false, 300)
        .then(function () {
          var wrap = document.createElement('div');
          wrap.className = 'chat-msg full';
          var inner = document.createElement('div');
          inner.style.cssText = 'display:flex;flex-direction:column;gap:7px;width:100%;';

          list.forEach(function (p) {
            var card = document.createElement('div');
            card.className = 'chat-resource-card';
            card.innerHTML =
              '<strong>' + esc(p.nombre) + '</strong>' +
              '<span>' + esc((p.especialidades || []).join(' · ')) + '</span>' +
              '<div style="font-size:12px;color:#475569;margin-top:4px">' + esc(p.descripcion_corta || '') + '</div>' +
              '<div style="font-size:11px;color:#64748b;margin-top:3px">' +
                '📍 ' + esc(p.ubicacion || '') + (p.modalidad ? ' · ' + esc(p.modalidad) : '') +
              '</div>' +
              '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">' +
                (p.contacto_url ? '<a href="' + esc(p.contacto_url) + '" class="chat-chip" style="text-decoration:none;font-size:11px;padding:4px 10px" target="_blank" rel="noopener noreferrer">Contactar</a>' : '') +
                (p.turnos_url   ? '<a href="' + esc(p.turnos_url)   + '" class="chat-chip chip-primary" style="text-decoration:none;font-size:11px;padding:4px 10px" target="_blank" rel="noopener noreferrer">Turnos</a>' : '') +
              '</div>';
            inner.appendChild(card);
          });

          wrap.appendChild(inner);
          $msgs.appendChild(wrap);
          scrollBottom();

          setChips([
            { label: '🔍 Nueva búsqueda',    action: function () { clearChips(); $input.value = ''; $input.focus(); } },
            { label: '👥 Ver equipo completo', href: 'equipo.html' },
            { label: '↩️ Menú principal',     action: showMainMenu },
          ]);
        });
    }

    // Cargar JSON si no se cargó aún
    if (profesionales.length === 0) {
      fetch('data/profesionales.json')
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (d) {
          profesionales = Array.isArray(d) ? d : [];
          renderDir('');
        })
        .catch(function () {
          profesionales = [];
          renderDir('');
        });
    } else {
      renderDir('');
    }

    // Guardar renderDir en ctx para usarlo en handleText
    ctx.renderDir = renderDir;
  }

  /* ── MENSAJE AL DOCTOR ─────────────────────────────── */
  function doMsgDoctor() {
    addUserMsg('Enviar mensaje al Doctor');
    clearChips();
    state = S.MSG_DOCTOR;
    showInput(true);
    $input.value = '';
    $input.placeholder = 'Escribí tu mensaje para el Dr. Dagnino...';
    $input.focus();

    botReply(
      '<div style="line-height:1.65">' +
        '📩 <strong>Mensaje para el Doctor</strong><br><br>' +
        'Escribí tu mensaje en el campo de texto y presioná <strong>Enviar</strong>.<br><br>' +
        '<span style="font-size:12px;color:#64748b">Se abrirá WhatsApp con el texto prellenado ' +
        'hacia la Central de Turnos, que lo hará llegar al Dr. Dagnino. ' +
        'Vos confirmás el envío desde WhatsApp.</span>' +
      '</div>',
      true
    ).then(function () {
      setChips([{ label: '↩️ Cancelar', action: showMainMenu }]);
    });
  }

  function sendMsgDoctor(msg) {
    var trimmed = msg.trim();
    if (!trimmed) {
      botReply('El mensaje está vacío. Escribí algo antes de enviar 😊', false, 300);
      return;
    }
    var fecha    = getFechaHora();
    var prefill  =
      '📩 Mensaje para el Dr. Dagnino (enviado desde la web del consultorio)\n' +
      'Fecha: ' + fecha + '\n' +
      'Mensaje: ' + trimmed + '\n' +
      '(Responder por este mismo chat de WhatsApp)';

    addUserMsg(trimmed);
    clearChips();
    showInput(false);
    state = S.MAIN_MENU;

    botReply(
      '✅ Mensaje preparado. Al hacer clic en el botón, se abrirá WhatsApp con el texto prellenado. ' +
      'Tenés que presionar <strong>Enviar</strong> en WhatsApp para que llegue.',
      true, 400
    ).then(function () {
      setChips([
        { label: '📲 Abrir WhatsApp y enviar', href: waLink(prefill), wa: true },
        { label: '✏️ Editar mensaje',          action: doMsgDoctor  },
        { label: '↩️ Menú principal',          action: showMainMenu },
      ]);
    });
  }

  /* ── HABLAR CON HUMANO ─────────────────────────────── */
  function doHumano() {
    addUserMsg('Hablar con Humano (Central de Turnos)');
    clearChips();
    botReply(
      'Te conecto directamente con la Central de Turnos humana. Pueden ayudarte con turnos, consultas y coordinación.',
      false, 350
    ).then(function () {
      setChips([
        { label: '💬 Abrir WhatsApp',   href: waLink('Hola, quiero comunicarme con la Central de Turnos del consultorio del Dr. Dagnino.'), wa: true },
        { label: '↩️ Volver al chat',  action: showMainMenu },
      ]);
    });
  }

  /* ── INTENT MATCHER (texto libre) ──────────────────── */
  var INTENTS = [
    { re: /ansied|panic|nervios|angustia|estr[eé]s|miedo|asustado|mal\b/i,       fn: doAnsiedad          },
    { re: /respir|breath/i,                                                        fn: doRespiracionTimed  },
    { re: /grounding|anclaje|tierra|suelo|presente/i,                             fn: doGrounding         },
    { re: /relaj|músculo|tension|tensión/i,                                        fn: doRelax             },
    { re: /p[áa]nico/i,                                                            fn: doPanico            },
    { re: /dorm|sue[ñn]o|insomnio|descanso|cansado|cansada/i,                     fn: doSueno             },
    { re: /recurso|p[áa]gina|info|material|tengo acceso/i,                        fn: doRecursos          },
    { re: /juego|jugar|cognitiv/i,                                                 fn: doJuegos            },
    { re: /profesional|m[eé]dic[oa]|doctor|psic[oó]log[oa]|especialista/i,        fn: doBuscarPro         },
    { re: /mensaje|doctor|dagnino|enviar/i,                                        fn: doMsgDoctor         },
    { re: /humano|persona|turno|whatsapp|contacto|hablar con/i,                    fn: doHumano            },
    { re: /emergen|crisis|urgencia|peligro|da[ñn]o|suicid|911|lastimar/i,         fn: doCrisis            },
  ];

  function handleText(text) {
    // Contextos especiales
    if (state === S.MSG_DOCTOR) {
      sendMsgDoctor(text);
      return;
    }
    if (state === S.SEARCH_PRO && ctx.renderDir) {
      ctx.renderDir(text);
      return;
    }
    if (state === S.POST_FLOW) {
      var n = parseInt(text, 10);
      if (!isNaN(n) && n >= 0 && n <= 10) {
        handleScale(n);
        return;
      }
    }

    // Intent matching
    for (var i = 0; i < INTENTS.length; i++) {
      if (INTENTS[i].re.test(text)) {
        INTENTS[i].fn();
        return;
      }
    }

    // Fallback
    botReply(
      'No entendí bien tu mensaje. Podés elegir una opción del menú, o escribir palabras clave como ' +
      '"ansiedad", "dormir", "turno", "juegos" o "profesional".'
    ).then(showMainMenu);
  }

  /* ── EXPAND / COLLAPSE ─────────────────────────────── */
  function toggleExpand() {
    var expanded = $panel.classList.toggle('chat-expanded');
    $expandBtn.textContent    = expanded ? '✕' : '⛶';
    $expandBtn.setAttribute('aria-label', expanded ? 'Contraer chat' : 'Expandir chat');
    $expandBtn.setAttribute('title',      expanded ? 'Contraer'      : 'Expandir');
    scrollBottom();
  }

  /* ── INIT ──────────────────────────────────────────── */
  function init() {
    $panel     = document.getElementById('chatApoyoPanel');
    if (!$panel) return;                     // El chat no está en esta página
    if ($panel.dataset.chatinit) return;     // Ya inicializado (guard anti-doble)
    $panel.dataset.chatinit = '1';

    // Resetear referencias y estado al reiniciar tras SPA swap
    $disclaimer = null;
    state       = S.INIT;
    ctx         = {};

    $msgs      = document.getElementById('chatMessages');
    $chips     = document.getElementById('chatChips');
    $input     = document.getElementById('chatInput');
    $sendBtn   = document.getElementById('chatSendBtn');
    $expandBtn = document.getElementById('chatExpandBtn');

    // Enviar con botón
    $sendBtn.addEventListener('click', function () {
      var val = $input.value.trim();
      if (!val) return;
      $input.value = '';
      $input.style.height = 'auto';
      handleText(val);
    });

    // Enviar con Enter (Shift+Enter = nueva línea)
    $input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        $sendBtn.click();
      }
    });

    // Auto-resize textarea
    $input.addEventListener('input', function () {
      $input.style.height = 'auto';
      $input.style.height = Math.min($input.scrollHeight, 88) + 'px';
    });

    // Expandir/contraer
    $expandBtn.addEventListener('click', toggleExpand);

    // Mostrar disclaimer o iniciar chat
    initDisclaimer();
  }

  // Inicialización principal
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init automático cuando el SPA vuelve a inyectar #chatApoyoPanel en el DOM
  var _chatObs = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var nodes = muts[i].addedNodes;
      for (var j = 0; j < nodes.length; j++) {
        var n = nodes[j];
        if (n.nodeType !== 1) continue;
        var p = (n.id === 'chatApoyoPanel')
          ? n
          : (n.querySelector ? n.querySelector('#chatApoyoPanel') : null);
        if (p && !p.dataset.chatinit) {
          setTimeout(init, 40);
          return;
        }
      }
    }
  });
  _chatObs.observe(document.body, { childList: true, subtree: true });

  /* =====================================================
     ADAPTER LLM (PLACEHOLDER PARA FUTURO)
     =====================================================
     Para conectar con un LLM (OpenAI, Claude, etc.),
     implementá este objeto ANTES de cargar chat.js:

     window.ChatLLMAdapter = {
       async getResponse(userMessage, state, context) {
         const res = await fetch('/api/chat', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ message: userMessage, state, context })
         });
         const data = await res.json();
         // data debe tener: { text: string, chips?: [], action?: string }
         return data;
       }
     };

     El motor lo detectará automáticamente y lo usará para
     las respuestas de texto libre sin reescribir la UI.
     ===================================================== */

})();
