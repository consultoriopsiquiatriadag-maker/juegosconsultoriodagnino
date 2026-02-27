(() => {
  const APP = window.APP = window.APP || {};
  APP.LS = APP.LS || {
    "LANG":       "app_lang",
    "FONT":       "app_font_px",
    "TEXT_SCALE": "app_text_scale",
  };

  const LS           = APP.LS;
  const I18N         = APP.I18N;
  const AudioManager = APP.AudioManager; // mantenido por compatibilidad con audio.js
  const SPA          = APP.SPA;

  // ========= GA page view =========
  function trackPageView(title = document.title) {
    if (typeof gtag !== "function") return;
    gtag('event', 'page_view', {
      page_title:    title,
      page_location: window.location.href,
      page_path:     window.location.pathname
    });
  }
  window.trackPageView = trackPageView;

  function safeTrack(title){
    try { trackPageView(title); } catch(e) {}
  }

  // ========= A11Y: font scaling =========
  const FONT_MIN = 14, FONT_MAX = 22, FONT_STEP = 1;

  function getFontPx(){
    const saved = parseInt(localStorage.getItem(LS.FONT) || "16", 10);
    if (isNaN(saved)) return 16;
    return Math.max(FONT_MIN, Math.min(FONT_MAX, saved));
  }

  function applyFontPx(px){
    const clamped = Math.max(FONT_MIN, Math.min(FONT_MAX, px));
    const scale   = clamped / 16;
    applyTextScale(scale);
  }

  // ========= A11Y: text scale =========
  function getTextScale(){
    const savedScale = parseFloat(localStorage.getItem(LS.TEXT_SCALE) || "");
    if (!isNaN(savedScale) && savedScale > 0.5 && savedScale < 3) return savedScale;
    const px = getFontPx();
    return px / 16;
  }

  function applyTextScale(scale){
    const clamped = Math.max(0.85, Math.min(1.30, scale));
    document.documentElement.style.setProperty("--text-scale", String(clamped));
    localStorage.setItem(LS.TEXT_SCALE, String(clamped));
    const px = Math.round(clamped * 16);
    localStorage.setItem(LS.FONT, String(px));
  }

  // ========= i18n =========
  function getLang(){
    const saved = localStorage.getItem(LS.LANG);
    if (saved && I18N[saved]) return saved;
    const nav = (navigator.language || "es").toLowerCase();
    if (nav.startsWith("pt")) return "pt";
    if (nav.startsWith("en")) return "en";
    return "es";
  }

  function setLang(lang){
    if (!I18N[lang]) return;
    localStorage.setItem(LS.LANG, lang);
    document.documentElement.lang = lang === "es" ? "es" : lang;
    applyI18n(lang);
    syncLangButtons(lang);
  }

  function syncLangButtons(lang){
    document.querySelectorAll('[data-lang]').forEach(btn=>{
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === lang ? "true" : "false");
    });
  }

  function applyI18n(lang){
    const dict = I18N[lang] || I18N.es;
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const key = el.getAttribute("data-i18n");
      if (!(key in dict)) return;
      if (String(dict[key]).includes("<br>")) el.innerHTML = dict[key];
      else el.textContent = dict[key];
    });
  }

  // ========= Audio sync stubs (UI de ajustes eliminada; mantenida para spa.js) =========
  function syncAudioButtonLabel(){}
  function syncVolumeUI(){}

  // ========= Init =========
  (function initApp(){

    const yearNow = document.getElementById("yearNow");
    if (yearNow) yearNow.textContent = String(new Date().getFullYear());

    // PWA: Service Worker
    if ('serviceWorker' in navigator){
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(()=>{});
      });
    }

    applyTextScale(getTextScale());

    const lang = getLang();
    setLang(lang);

    // bind language buttons (se mantienen en algunas páginas)
    document.querySelectorAll("[data-lang]").forEach(btn=>{
      btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang")));
    });

    // bind font buttons (A- / A+)
    const btnAminus = document.getElementById("btnAminus");
    if (btnAminus) btnAminus.addEventListener("click", () => {
      applyFontPx(getFontPx() - FONT_STEP);
    });

    const btnAplus = document.getElementById("btnAplus");
    if (btnAplus) btnAplus.addEventListener("click", () => {
      applyFontPx(getFontPx() + FONT_STEP);
    });

    // Exponer helpers para spa.js
    APP.getLang              = getLang;
    APP.applyI18n            = applyI18n;
    APP.syncLangButtons      = syncLangButtons;
    APP.applyFontPx          = applyFontPx;
    APP.getFontPx            = getFontPx;
    APP.syncAudioButtonLabel = syncAudioButtonLabel;
    APP.syncVolumeUI         = syncVolumeUI;
    APP.safeTrack            = safeTrack;

    SPA.init();
  })();
})();
