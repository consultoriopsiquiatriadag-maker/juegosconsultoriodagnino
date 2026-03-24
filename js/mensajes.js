// js/mensajes.js — Gestor de mensajes generales de bienestar
// Carga /data/mensajes-generales.json, gestiona rotación y persistencia en localStorage.
// Expone window.MensajesManager para uso de notifications.js y del widget visual.
// Compatible con Netlify, vanilla JS, sin backend.

(function () {
  'use strict';

  // ─── Claves localStorage ────────────────────────────────────────────────────
  var LS_INDICE    = 'notif_indice';
  var LS_ULTIMO    = 'notif_ultimo_msg';
  var LS_HISTORIAL = 'notif_historial';

  // ─── Fallback offline (si fetch falla o se usa en local sin servidor) ───────
  var FALLBACK = [
    { id:1,  categoria:'pausa',       texto:'Detenete un momento. Respirar también es avanzar.',                  activo:true },
    { id:4,  categoria:'motivacional',texto:'No necesitás estar bien todo el tiempo. Solo hacer lo que podés.',   activo:true },
    { id:7,  categoria:'autocuidado', texto:'¿Tomaste agua hoy? El cuerpo también necesita atención.',            activo:true },
    { id:10, categoria:'regulacion',  texto:'Si el pensamiento se acelera, nombrá 5 cosas que ves ahora mismo.', activo:true }
  ];

  // ─── Estado interno ──────────────────────────────────────────────────────────
  var _mensajes         = [];
  var _listo            = false;
  var _pendingCallbacks = [];

  // ─── Carga del JSON ──────────────────────────────────────────────────────────
  function cargar() {
    fetch('/data/mensajes-generales.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        _mensajes = data.filter(function (m) { return m.activo !== false; });
        if (_mensajes.length === 0) throw new Error('Sin mensajes activos');
      })
      .catch(function () {
        // Silently fallback — offline, CORS local, JSON inválido, etc.
        _mensajes = FALLBACK;
      })
      .then(function () {
        _listo = true;
        _pendingCallbacks.forEach(function (cb) { try { cb(); } catch (_) {} });
        _pendingCallbacks = [];
      });
  }

  function onReady(cb) {
    if (_listo) { try { cb(); } catch (_) {} }
    else _pendingCallbacks.push(cb);
  }

  // ─── Índice rotativo ─────────────────────────────────────────────────────────
  function getIndice() {
    var v = parseInt(localStorage.getItem(LS_INDICE), 10);
    if (isNaN(v) || v < 0) return 0;
    return v % Math.max(_mensajes.length, 1);
  }

  function avanzarIndice() {
    if (!_mensajes.length) return 0;
    var next = (getIndice() + 1) % _mensajes.length;
    localStorage.setItem(LS_INDICE, String(next));
    return next;
  }

  // ─── Acceso a mensajes ───────────────────────────────────────────────────────
  function getActual() {
    if (!_mensajes.length) return null;
    return _mensajes[getIndice()];
  }

  function getSiguiente() {
    if (!_mensajes.length) return null;
    var msg = _mensajes[avanzarIndice()];
    _guardarUltimo(msg);
    return msg;
  }

  function getRandom() {
    if (!_mensajes.length) return null;
    var idx = Math.floor(Math.random() * _mensajes.length);
    var msg = _mensajes[idx];
    _guardarUltimo(msg);
    return msg;
  }

  // ─── Persistencia ────────────────────────────────────────────────────────────
  function _guardarUltimo(msg) {
    if (!msg) return;
    try {
      localStorage.setItem(LS_ULTIMO, JSON.stringify({
        id: msg.id, texto: msg.texto, categoria: msg.categoria, ts: Date.now()
      }));
      _agregarHistorial(msg);
    } catch (_) {}
  }

  function getUltimo() {
    try { return JSON.parse(localStorage.getItem(LS_ULTIMO)) || null; }
    catch (_) { return null; }
  }

  function _agregarHistorial(msg) {
    var hist = getHistorial();
    hist.unshift({ id: msg.id, texto: msg.texto, categoria: msg.categoria, ts: Date.now() });
    try {
      localStorage.setItem(LS_HISTORIAL, JSON.stringify(hist.slice(0, 10)));
    } catch (_) {}
  }

  function getHistorial() {
    try { return JSON.parse(localStorage.getItem(LS_HISTORIAL)) || []; }
    catch (_) { return []; }
  }

  // ─── Paleta de categorías ────────────────────────────────────────────────────
  var PALETA = {
    motivacional: { fondo: 'rgba(74,144,217,.14)',  color: '#5ba3e8', label: 'Motivación'   },
    autocuidado:  { fondo: 'rgba(39,174,96,.14)',   color: '#2ecc71', label: 'Autocuidado'  },
    pausa:        { fondo: 'rgba(155,89,182,.14)',  color: '#b07fe0', label: 'Pausa'        },
    regulacion:   { fondo: 'rgba(230,126,34,.14)',  color: '#e8963a', label: 'Regulación'   }
  };

  function _paletaDe(cat) {
    return PALETA[cat] || { fondo: 'rgba(100,120,150,.14)', color: '#8a9bb5', label: cat || 'Bienestar' };
  }

  // ─── Escape HTML básico ──────────────────────────────────────────────────────
  function _esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ─── Formato de timestamp legible ────────────────────────────────────────────
  function _formatTs(ts) {
    if (!ts) return '';
    var d   = new Date(ts);
    var now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return 'Hoy a las ' + d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2);
    }
    var dias = ['dom','lun','mar','mié','jue','vie','sáb'];
    return dias[d.getDay()] + '. ' + d.getDate() + '/' + (d.getMonth() + 1);
  }

  // ─── Widget visual ───────────────────────────────────────────────────────────
  // Renderiza dentro del elemento con id = containerId.
  // Muestra el mensaje actual con badge de categoría y botón "Siguiente →".
  function renderWidget(containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;

    function pintar() {
      var msg = getActual();
      if (!msg) {
        el.innerHTML = '<p style="margin:0;font-size:.88rem;color:var(--muted,#8a9bb5);font-style:italic">No hay mensajes disponibles.</p>';
        return;
      }
      _guardarUltimo(msg);

      var p   = _paletaDe(msg.categoria);
      var u   = getUltimo();
      var ts  = u && u.ts ? _formatTs(u.ts) : '';

      el.innerHTML =
        '<div style="display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap">' +
          '<div style="flex:1;min-width:0">' +
            '<span style="display:inline-block;font-size:.7rem;font-weight:700;letter-spacing:.06em;' +
              'text-transform:uppercase;padding:2px 10px;border-radius:20px;margin-bottom:8px;' +
              'background:' + p.fondo + ';color:' + p.color + '">' +
              _esc(p.label) +
            '</span>' +
            '<p id="msg-texto" style="margin:0;font-size:.95rem;line-height:1.6;' +
              'color:var(--text,#cdd6e4);font-style:italic">' +
              '&#8220;' + _esc(msg.texto) + '&#8221;' +
            '</p>' +
            (ts ? '<p style="margin:6px 0 0;font-size:.7rem;color:var(--muted,#8a9bb5);opacity:.55">' + _esc(ts) + '</p>' : '') +
          '</div>' +
          '<button id="msg-sig-btn" type="button" aria-label="Ver siguiente mensaje" ' +
            'style="flex-shrink:0;align-self:flex-end;font-size:.75rem;padding:5px 13px;' +
            'border:1px solid rgba(138,155,181,.4);background:transparent;' +
            'color:var(--muted,#8a9bb5);border-radius:20px;cursor:pointer;' +
            'transition:opacity .15s;white-space:nowrap">' +
            'Siguiente →' +
          '</button>' +
        '</div>';

      var sigBtn = document.getElementById('msg-sig-btn');
      if (sigBtn) {
        sigBtn.addEventListener('mouseover', function(){ this.style.opacity = '.6'; });
        sigBtn.addEventListener('mouseout',  function(){ this.style.opacity = '1'; });
        sigBtn.addEventListener('click', function () {
          getSiguiente();
          pintar();
        });
      }
    }

    onReady(pintar);
  }

  // ─── API pública ─────────────────────────────────────────────────────────────
  window.MensajesManager = {
    onReady:      onReady,
    getActual:    getActual,
    getSiguiente: getSiguiente,
    getRandom:    getRandom,
    getUltimo:    getUltimo,
    getHistorial: getHistorial,
    renderWidget: renderWidget,
    // Para debugging / consola
    lista:        function () { return _mensajes.slice(); },
    resetIndice:  function () { localStorage.removeItem(LS_INDICE); }
  };

  // Iniciar carga al parsear el script
  cargar();

})();
