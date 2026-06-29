/* ============================================================
   departamento-riobamba-919 — script.js
   Sin librerías externas. Funciones: WhatsApp, copiar link,
   placeholders de fotos faltantes y lightbox de galería.
   ============================================================ */

/* EDITAR ACÁ: número de WhatsApp con código de país, sin "+" ni espacios. */
const WHATSAPP_NUMBER = "5491160473562";
const WHATSAPP_MESSAGE = "Hola, te contacto por el alquiler del inmueble de Riobamba 919, Barrio Norte.";

(function () {
  "use strict";

  /* ── WhatsApp: completar todos los enlaces .riobamba-whatsapp-link ── */
  function setWhatsAppLinks() {
    const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(WHATSAPP_MESSAGE);
    document.querySelectorAll(".riobamba-whatsapp-link").forEach(function (el) {
      el.setAttribute("href", url);
    });
  }

  /* ── Toast genérico ── */
  function showToast(text) {
    const toast = document.getElementById("riobambaToast");
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("riobamba-toast-visible");
    clearTimeout(toast._riobambaTimer);
    toast._riobambaTimer = setTimeout(function () {
      toast.classList.remove("riobamba-toast-visible");
    }, 2800);
  }

  /* ── Copiar link de la página ── */
  function setupCopyLink() {
    const btn = document.getElementById("riobambaCopyLink");
    if (!btn) return;
    btn.addEventListener("click", async function () {
      const url = window.location.href;
      try {
        await navigator.clipboard.writeText(url);
      } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      showToast("Link copiado");
    });
  }

  /* ── Lightbox de galería ── */
  function setupLightbox() {
    const photos = Array.from(document.querySelectorAll(".riobamba-photo"));
    if (!photos.length) return;

    const lightbox = document.getElementById("riobambaLightbox");
    const imgEl = document.getElementById("riobambaLightboxImg");
    const placeholderEl = document.getElementById("riobambaLightboxPlaceholder");
    const captionEl = document.getElementById("riobambaLightboxCaption");
    const closeBtn = document.getElementById("riobambaLightboxClose");
    const prevBtn = document.getElementById("riobambaLightboxPrev");
    const nextBtn = document.getElementById("riobambaLightboxNext");

    let currentIndex = 0;

    function isPhotoMissing(photoEl) {
      return photoEl.classList.contains("riobamba-img-missing");
    }

    function render(index) {
      currentIndex = (index + photos.length) % photos.length;
      const photoEl = photos[currentIndex];
      const caption = photoEl.getAttribute("data-caption") || "";
      const placeholderText = photoEl.getAttribute("data-placeholder-text") || "Foto a reemplazar";

      if (isPhotoMissing(photoEl)) {
        imgEl.hidden = true;
        imgEl.removeAttribute("src");
        placeholderEl.hidden = false;
        placeholderEl.textContent = placeholderText;
      } else {
        const realImg = photoEl.querySelector("img");
        imgEl.src = realImg ? realImg.src : "";
        imgEl.alt = realImg ? realImg.alt : caption;
        imgEl.hidden = false;
        placeholderEl.hidden = true;
      }
      captionEl.textContent = caption;
    }

    function open(index) {
      render(index);
      lightbox.classList.add("riobamba-lightbox-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function close() {
      lightbox.classList.remove("riobamba-lightbox-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    photos.forEach(function (photoEl, index) {
      photoEl.addEventListener("click", function () {
        open(index);
      });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () { render(currentIndex - 1); });
    nextBtn.addEventListener("click", function () { render(currentIndex + 1); });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("riobamba-lightbox-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") render(currentIndex - 1);
      if (e.key === "ArrowRight") render(currentIndex + 1);
    });
  }

  /* ── Audio (podcast): si el archivo no existe, mostrar placeholder ── */
  function setupAudioFallback() {
    const audio = document.getElementById("riobambaAudio");
    const placeholder = document.getElementById("riobambaAudioPlaceholder");
    if (!audio || !placeholder) return;
    audio.addEventListener("error", function () {
      audio.hidden = true;
      placeholder.hidden = false;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setWhatsAppLinks();
    setupCopyLink();
    setupLightbox();
    setupAudioFallback();
  });
})();

/* ── Detección de imagen faltante (llamado desde el atributo onerror del <img>) ──
   Si la foto real no existe (404), se oculta la imagen y se muestra el
   placeholder elegante que ya está junto a ella en el HTML (mismo padre).
   Funciona tanto para las fotos de la galería como para la imagen de portada
   del hero, porque ambas comparten la misma estructura: <img> + .riobamba-placeholder
   dentro de un contenedor común. */
function riobambaImgError(imgEl) {
  imgEl.onerror = null;
  imgEl.hidden = true;
  const container = imgEl.parentElement;
  if (!container) return;
  container.classList.add("riobamba-img-missing");
  const placeholder = container.querySelector(".riobamba-placeholder");
  if (placeholder) placeholder.hidden = false;
}
