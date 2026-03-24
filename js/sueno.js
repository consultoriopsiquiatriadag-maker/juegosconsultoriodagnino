// js/sueno.js — Recomendaciones de higiene del sueño
// Módulo independiente. Sin dependencias externas ni librerías.
// Fuente de datos: /data/mensajes-sueno.json (fetch local, sin backend).
// Preferencias del usuario en localStorage.
//
// ARQUITECTURA PARA MIGRACIÓN FUTURA:
//   Para conectar con Firebase/backend, reemplazar únicamente la función
//   cargarMensajes() — el resto del módulo consume el array resultante
//   sin conocer el origen de los datos.

(function () {
  'use strict';

  // ─── Configuración ──────────────────────────────────────────────────────────
  // DEFAULT_HORA_BASE: hora de referencia usada en el JSON.
  // Si el usuario elige otra, los mensajes se desplazan proporcionalmente.
  var DEFAULT_HORA_BASE = '23:00';

  var HORA_OPCIONES = ['21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00'];

  // ─── Claves localStorage ────────────────────────────────────────────────────
  var LS_ACTIVO    = 'sueno_activo';
  var LS_HORA_BASE = 'sueno_hora_base';
  var LS_ULTIMO    = 'sueno_ultimo_msg';

  // ─── Fallback si el JSON no carga ──────────────────────────────────────────
  var FALLBACK = [
    { id:2, tipo:'sueno', titulo:'Bajá la intensidad',  mensaje:'Evitá decisiones importantes o conversaciones que activen tu mente ahora.',           hora:'21:00', duracion_min:60, activo:true },
    { id:4, tipo:'sueno', titulo:'Reducí las pantallas', mensaje:'La luz azul puede retrasar el sueño hasta dos horas. Dejá el teléfono fuera del cuarto.', hora:'22:00', duracion_min:60, activo:true },
    { id:6, tipo:'sueno', titulo:'Priorizá el descanso', mensaje:'Lo que queda pendiente puede esperar. El sueño perdido no se recupera igual mañana.',  hora:'23:00', duracion_min:60, activo:true }
  ];

  // ─── Fuente de datos ───────────────────────────────────────────────────────
  // PUNTO DE MIGRACIÓN: para conectar con Firebase, reemplazar esta función
  // por una que llame a Firestore.collection('mensajes_sueno').get()
  // y devuelva el array al mismo callback.
  function cargarMensajes(callback) {
    fetch('/data/mensajes-sueno.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var activos = data.filter(function (m) { return m.activo !== false; });
        callback(activos.length ? activos : FALLBACK);
      })
      .catch(function () {
        callback(FALLBACK);
      });
  }

  // ─── Preferencias (localStorage) ──────────────────────────────────────────
  // PUNTO DE MIGRACIÓN: en una fase futura, leer/escribir en perfil Firebase.
  function isActivo()     { return localStorage.getItem(LS_ACTIVO) === '1'; }
  function setActivo(v)   { v ? localStorage.setItem(LS_ACTIVO, '1') : localStorage.removeItem(LS_ACTIVO); }
  function getHoraBase()  { return localStorage.getItem(LS_HORA_BASE) || DEFAULT_HORA_BASE; }
  function setHoraBase(h) { localStorage.setItem(LS_HORA_BASE, h); }

  // ─── Lógica horaria ────────────────────────────────────────────────────────

  // parsearHora: "HH:MM" → minutos desde medianoche
  function parsearHora(str) {
    var p = String(str).split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1] || '0', 10);
  }

  // offsetMin: desplazamiento en minutos entre la hora_base del usuario
  // y la hora_base de referencia del JSON.
  // Ej: usuario duerme a 22:00 → offset = 22*60 - 23*60 = -60 (todo 1h antes)
  function offsetMin() {
    return parsearHora(getHoraBase()) - parsearHora(DEFAULT_HORA_BASE);
  }

  // horaAjustada: minutos desde medianoche para un mensaje según preferencia del usuario
  function horaAjustada(msg) {
    var base = parsearHora(msg.hora) + offsetMin();
    return ((base % 1440) + 1440) % 1440; // normalizar a [0, 1440)
  }

  // ahoraMin: minutos actuales desde medianoche
  function ahoraMin() {
    var n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  }

  // getMensajeActual: devuelve el mensaje cuya franja horaria incluye el momento actual
  function getMensajeActual(mensajes) {
    var ahora = ahoraMin();
    for (var i = 0; i < mensajes.length; i++) {
      var m     = mensajes[i];
      var start = horaAjustada(m);
      var end   = (start + (m.duracion_min || 30)) % 1440;
      // manejar franjas que cruzan la medianoche (ej. 23:30 + 60min = 00:30)
      var activa = start < end
        ? (ahora >= start && ahora < end)
        : (ahora >= start || ahora < end);
      if (activa) return m;
    }
    return null;
  }

  // formatHora: minutos desde medianoche → "HH:MM"
  function formatHora(min) {
    var m = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(m / 60);
    return ('0' + h).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  }

  // guardarUltimo: persiste el último mensaje mostrado
  function guardarUltimo(msg) {
    try {
      localStorage.setItem(LS_ULTIMO, JSON.stringify({ id: msg.id, titulo: msg.titulo, ts: Date.now() }));
    } catch (_) {}
  }

  // ─── Escape HTML básico ────────────────────────────────────────────────────
  function _esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ─── Notificación demo ─────────────────────────────────────────────────────
  // Reutiliza la infraestructura de notifications.js / sw.js si está disponible.
  function mostrarNotif(titulo, cuerpo) {
    var perm = window.NotifManager
      ? window.NotifManager.getPermission()
      : ('Notification' in window ? Notification.permission : 'unsupported');

    if (perm === 'granted') {
      var opts = {
        body:      cuerpo,
        icon:      '/icon-192.png',
        tag:       'sueno',
        renotify:  true,
        vibrate:   [150, 80, 150]
      };
      var swReady = window.SWReady ||
        ('serviceWorker' in navigator ? navigator.serviceWorker.ready : null);
      if (swReady) {
        swReady.then(function (reg) {
          reg.showNotification(titulo, opts);
        }).catch(function () { new Notification(titulo, opts); });
      } else {
        new Notification(titulo, opts);
      }
    } else {
      // Sin permisos: feedback visual en el mismo widget
      _flash(titulo + ': ' + cuerpo);
    }
  }

  // Muestra mensaje temporal en el área de flash (sin alert)
  function _flash(texto) {
    var el = document.getElementById('sueno-flash');
    if (!el) return;
    el.textContent = '▶ ' + texto;
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.style.opacity = '0'; }, 4500);
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  function renderUI(containerId, mensajes) {
    var el = document.getElementById(containerId);
    if (!el) return;

    function pintar() {
      var activo   = isActivo();
      var horaBase = getHoraBase();
      var actual   = activo ? getMensajeActual(mensajes) : null;

      if (activo && actual) guardarUltimo(actual);

      // Opciones del selector de hora
      var optsHtml = HORA_OPCIONES.map(function (h) {
        return '<option value="' + h + '"' + (h === horaBase ? ' selected' : '') + '>' + h + '</option>';
      }).join('');

      // Toggle visual
      var bgToggle  = activo ? '#4a90d9' : 'rgba(100,120,150,.3)';
      var posKnob   = activo ? '21px' : '3px';

      // Bloque del mensaje activo actual
      var msgActualHtml = '';
      if (activo) {
        if (actual) {
          var hAdj = formatHora(horaAjustada(actual));
          msgActualHtml =
            '<div style="margin-top:14px;padding:14px 16px;border-radius:10px;' +
              'background:rgba(74,144,217,.07);border:1px solid rgba(74,144,217,.18)">' +
              '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">' +
                '<span style="font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;' +
                  'padding:2px 10px;border-radius:20px;background:rgba(74,144,217,.18);color:#5ba3e8">' +
                  'Sueño &middot; ' + _esc(hAdj) +
                '</span>' +
                '<span style="font-size:.85rem;font-weight:600;color:var(--text,#cdd6e4)">' +
                  _esc(actual.titulo) +
                '</span>' +
              '</div>' +
              '<p style="margin:0 0 11px;font-size:.9rem;line-height:1.65;color:var(--text,#cdd6e4)">' +
                _esc(actual.mensaje) +
              '</p>' +
              '<button class="sueno-probar" data-id="' + actual.id + '" ' +
                'style="font-size:.75rem;padding:4px 14px;border:1px solid rgba(74,144,217,.4);' +
                'background:transparent;color:#5ba3e8;border-radius:20px;cursor:pointer;transition:opacity .15s" ' +
                'onmouseover="this.style.opacity=\'.65\'" onmouseout="this.style.opacity=\'1\'">' +
                'Probar notificación →' +
              '</button>' +
            '</div>';
        } else {
          msgActualHtml =
            '<p style="margin-top:12px;font-size:.84rem;color:var(--muted,#8a9bb5);font-style:italic">' +
              'Fuera del horario de recordatorios por ahora.' +
            '</p>';
        }
      }

      // Lista completa de recordatorios con botón Probar individual
      var listaHtml = '';
      if (activo) {
        listaHtml =
          '<div style="margin-top:16px;border-top:1px solid rgba(255,255,255,.06);padding-top:14px">' +
            '<p style="margin:0 0 10px;font-size:.68rem;font-weight:700;letter-spacing:.1em;' +
              'text-transform:uppercase;color:var(--muted,#8a9bb5)">— Todos los recordatorios —</p>' +
            mensajes.map(function (m) {
              var hA      = formatHora(horaAjustada(m));
              var esActual = actual && actual.id === m.id;
              return (
                '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;' +
                  'border-bottom:1px solid rgba(255,255,255,.04);' +
                  (esActual ? 'opacity:1' : 'opacity:.75') + '">' +
                  '<span style="font-size:.74rem;font-family:monospace;color:' +
                    (esActual ? '#5ba3e8' : 'var(--muted,#8a9bb5)') +
                    ';min-width:44px;flex-shrink:0">' + _esc(hA) + '</span>' +
                  '<span style="flex:1;font-size:.84rem;color:var(--text,#cdd6e4);' +
                    (esActual ? 'font-weight:600' : '') + '">' + _esc(m.titulo) + '</span>' +
                  '<button class="sueno-probar" data-id="' + m.id + '" ' +
                    'style="font-size:.72rem;padding:3px 11px;border:1px solid rgba(138,155,181,.28);' +
                    'background:transparent;color:var(--muted,#8a9bb5);border-radius:20px;cursor:pointer;' +
                    'white-space:nowrap;flex-shrink:0;transition:opacity .15s" ' +
                    'onmouseover="this.style.opacity=\'.6\'" onmouseout="this.style.opacity=\'1\'">' +
                    'Probar' +
                  '</button>' +
                '</div>'
              );
            }).join('') +
          '</div>';
      }

      el.innerHTML =
        // Fila superior: toggle + label + selector hora
        '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
          '<button id="sueno-toggle" role="switch" aria-checked="' + activo + '" ' +
            'style="position:relative;width:42px;height:24px;border-radius:24px;border:none;' +
            'background:' + bgToggle + ';cursor:pointer;flex-shrink:0;transition:background .25s;padding:0" ' +
            'aria-label="' + (activo ? 'Desactivar' : 'Activar') + ' recordatorios de sueño">' +
            '<span style="position:absolute;top:3px;left:' + posKnob + ';width:18px;height:18px;' +
              'background:#fff;border-radius:50%;transition:left .25s;pointer-events:none"></span>' +
          '</button>' +
          '<span style="font-size:.88rem;color:var(--text,#cdd6e4)">' +
            (activo ? 'Recordatorios de sueño activados' : 'Activar recordatorios de sueño') +
          '</span>' +
          (activo
            ? '<div style="margin-left:auto;display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
                '<label for="sueno-hora-sel" ' +
                  'style="font-size:.75rem;color:var(--muted,#8a9bb5);white-space:nowrap">' +
                  'Hora de dormir:' +
                '</label>' +
                '<select id="sueno-hora-sel" ' +
                  'style="background:rgba(255,255,255,.06);border:1px solid rgba(138,155,181,.3);' +
                  'color:var(--text,#cdd6e4);border-radius:8px;padding:4px 8px;font-size:.82rem;cursor:pointer">' +
                  optsHtml +
                '</select>' +
              '</div>'
            : '') +
        '</div>' +
        // Flash de feedback sin permisos de notificación
        '<p id="sueno-flash" ' +
          'style="margin:7px 0 0;font-size:.8rem;color:#5ba3e8;opacity:0;transition:opacity .3s;min-height:1em"></p>' +
        msgActualHtml +
        listaHtml;

      // ── Eventos ────────────────────────────────────────────────────────────
      var toggleBtn = document.getElementById('sueno-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
          setActivo(!isActivo());
          pintar();
        });
      }

      var horaSel = document.getElementById('sueno-hora-sel');
      if (horaSel) {
        horaSel.addEventListener('change', function () {
          setHoraBase(this.value);
          pintar();
        });
      }

      el.querySelectorAll('.sueno-probar').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = parseInt(this.getAttribute('data-id'), 10);
          var m  = null;
          for (var i = 0; i < mensajes.length; i++) {
            if (mensajes[i].id === id) { m = mensajes[i]; break; }
          }
          if (m) mostrarNotif(m.titulo, m.mensaje);
        });
      });
    }

    pintar();

    // Actualización automática cada minuto para detectar cambio de franja horaria
    setInterval(function () {
      if (isActivo()) pintar();
    }, 60000);
  }

  // ─── API pública ───────────────────────────────────────────────────────────
  // Expuesta para debugging en consola y para futura integración con otros módulos.
  window.SuenoManager = {
    isActivo:         isActivo,
    setActivo:        setActivo,
    getHoraBase:      getHoraBase,
    setHoraBase:      setHoraBase,
    getMensajeActual: getMensajeActual,
    mostrarNotif:     mostrarNotif,
    // helpers de debugging
    ahoraMin:         ahoraMin,
    offsetMin:        offsetMin,
    formatHora:       formatHora
  };

  // ─── Init ──────────────────────────────────────────────────────────────────
  function init() {
    cargarMensajes(function (mensajes) {
      renderUI('sueno-widget', mensajes);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
