// js/register-sw.js — Utilidad de acceso al Service Worker
// NO re-registra el SW (ya lo hace assets/js/app.js).
// Expone window.SWReady: Promise<ServiceWorkerRegistration>
// Compatible con Netlify, vanilla JS.

(function () {
  'use strict';

  if ('serviceWorker' in navigator) {
    // Evitar doble registro: solo registra si no hay SW activo en /
    navigator.serviceWorker.getRegistration('/').then(function (existing) {
      if (!existing) {
        navigator.serviceWorker.register('/sw.js').catch(function (e) {
          console.warn('[register-sw] Registro fallido:', e);
        });
      }
    });

    // Exponer promesa global para que notifications.js la consuma
    window.SWReady = navigator.serviceWorker.ready;
  } else {
    window.SWReady = Promise.reject(new Error('ServiceWorker no soportado'));
  }
})();
