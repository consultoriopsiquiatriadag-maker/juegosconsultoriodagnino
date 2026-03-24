// js/notifications.js — Recordatorios de bienestar
// Infraestructura mínima para notificaciones push (fase demo sin backend).
// Compatible con Netlify, vanilla JS, sin Firebase.

(function () {
  'use strict';

  var LS_KEY = 'notif_subscribed';

  // Frases de bienestar para modo demo local
  var DEMO_MSGS = [
    '¿Respiraste hondo hoy? Un minuto de pausa puede cambiar tu jornada.',
    'Pedir ayuda es un acto de valentía, no de debilidad.',
    'Tu mente también necesita descanso. Date un momento para vos.',
    '¿Cómo te sentís ahora mismo? Tomá un instante para notarlo.',
    'Pequeños pasos cuentan. ¿Cuál fue el tuyo hoy?',
    'Recordá hidratarte. El bienestar también es físico.',
    'Una pausa de 5 minutos al aire libre puede bajar el cortisol notablemente.'
  ];

  function randomMsg() {
    return DEMO_MSGS[Math.floor(Math.random() * DEMO_MSGS.length)];
  }

  // --- Estado ---

  function getPermission() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission; // 'default' | 'granted' | 'denied'
  }

  function isSubscribed() {
    return localStorage.getItem(LS_KEY) === '1';
  }

  function setSubscribed(val) {
    if (val) localStorage.setItem(LS_KEY, '1');
    else localStorage.removeItem(LS_KEY);
  }

  // --- UI ---

  function updateUI() {
    var btn     = document.getElementById('notif-btn');
    var status  = document.getElementById('notif-status');
    var demoBtn = document.getElementById('notif-demo-btn');
    if (!btn || !status) return;

    var perm = getPermission();

    if (perm === 'unsupported') {
      btn.textContent = 'No disponible en este navegador';
      btn.disabled = true;
      btn.className = 'btn-secondary';
      btn.style.opacity = '0.5';
      status.textContent = 'Tu navegador no soporta notificaciones web.';
      status.style.color = '#b8860b';
      if (demoBtn) demoBtn.style.display = 'none';
      return;
    }

    if (perm === 'denied') {
      btn.textContent = 'Notificaciones bloqueadas';
      btn.disabled = true;
      btn.className = 'btn-secondary';
      btn.style.opacity = '0.5';
      status.textContent = 'Bloqueaste las notificaciones. Podés reactivarlas desde los ajustes del navegador.';
      status.style.color = '#c0392b';
      if (demoBtn) demoBtn.style.display = 'none';
      return;
    }

    if (perm === 'granted') {
      if (isSubscribed()) {
        btn.textContent = '✓ Recordatorios activos';
        btn.disabled = true;
        btn.className = 'btn-primary';
        btn.style.opacity = '0.75';
        status.textContent = 'Estás suscrito/a a los recordatorios de bienestar.';
        status.style.color = '#27ae60';
      } else {
        btn.textContent = 'Activar recordatorios';
        btn.disabled = false;
        btn.className = 'btn-primary';
        btn.style.opacity = '1';
        status.textContent = 'Permiso concedido. Presioná el botón para activar.';
        status.style.color = '#27ae60';
      }
      if (demoBtn) demoBtn.style.display = 'inline-block';
      return;
    }

    // 'default' — aún no se pidió permiso
    btn.textContent = 'Activar recordatorios';
    btn.disabled = false;
    btn.className = 'btn-primary';
    btn.style.opacity = '1';
    status.textContent = '';
    if (demoBtn) demoBtn.style.display = 'none';
  }

  // --- Notificación local (sin push backend) ---

  function showLocalNotification(title, body) {
    if (getPermission() !== 'granted') return;

    var opts = {
      body: body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'bienestar',
      renotify: true,
      vibrate: [200, 100, 200]
    };

    // Preferir SW para que funcione en background / PWA instalada
    var swReady = window.SWReady || ('serviceWorker' in navigator ? navigator.serviceWorker.ready : null);

    if (swReady) {
      swReady.then(function (reg) {
        reg.showNotification(title, opts);
      }).catch(function () {
        new Notification(title, opts);
      });
    } else {
      new Notification(title, opts);
    }
  }

  // --- Flujo principal ---

  function requestAndSubscribe() {
    if (!('Notification' in window)) return;

    var btn    = document.getElementById('notif-btn');
    var status = document.getElementById('notif-status');

    if (btn) {
      btn.textContent = 'Solicitando permiso…';
      btn.disabled = true;
      btn.style.opacity = '0.7';
    }
    if (status) {
      status.textContent = 'Esperando tu respuesta…';
      status.style.color = '#4a90d9';
    }

    // Notification.requestPermission puede devolver promesa o usar callback (legacy)
    var permPromise = Notification.requestPermission();
    if (!(permPromise && typeof permPromise.then === 'function')) {
      // Fallback para Safari antiguo
      permPromise = new Promise(function (resolve) {
        Notification.requestPermission(resolve);
      });
    }

    permPromise.then(function (permission) {
      if (permission === 'granted') {
        // Demo: guardar estado en localStorage sin backend
        setSubscribed(true);
        updateUI();
        showLocalNotification(
          'Recordatorios activados ✓',
          'A partir de ahora recibirás frases y recordatorios de bienestar.'
        );
      } else {
        updateUI();
      }
    }).catch(function (e) {
      console.warn('[notifications] Error al solicitar permiso:', e);
      updateUI();
    });
  }

  function showDemo() {
    var perm = getPermission();
    if (perm === 'unsupported' || perm === 'denied') return;
    if (perm !== 'granted') {
      requestAndSubscribe();
      return;
    }
    showLocalNotification('Recordatorio de bienestar', randomMsg());
  }

  // --- Inicialización ---

  function init() {
    updateUI();

    var btn     = document.getElementById('notif-btn');
    var demoBtn = document.getElementById('notif-demo-btn');

    if (btn) {
      btn.addEventListener('click', function () {
        var perm = getPermission();
        if (perm === 'granted' && !isSubscribed()) {
          setSubscribed(true);
          updateUI();
          showLocalNotification(
            'Recordatorios activados ✓',
            'A partir de ahora recibirás frases y recordatorios de bienestar.'
          );
        } else if (perm === 'default') {
          requestAndSubscribe();
        }
      });
    }

    if (demoBtn) {
      demoBtn.addEventListener('click', showDemo);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // API pública para consola / debugging
  window.NotifManager = {
    showDemo:           showDemo,
    requestAndSubscribe: requestAndSubscribe,
    updateUI:           updateUI,
    getPermission:      getPermission,
    isSubscribed:       isSubscribed,
    resetDemo: function () { setSubscribed(false); updateUI(); }
  };

})();
