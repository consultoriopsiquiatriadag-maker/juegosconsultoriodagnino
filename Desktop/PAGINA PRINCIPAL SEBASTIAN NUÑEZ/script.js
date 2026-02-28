/**
 * ════════════════════════════════════════════════════════════════
 * SEBASTIÁN NÚÑEZ — ESCRITORIO PRINCIPAL
 * Digital Instrument Dashboard · script.js
 * ════════════════════════════════════════════════════════════════
 */

/* ──────────────────────────────────────────────────────────────
   ██████╗ ██████╗ ███╗   ██╗███████╗██╗ ██████╗
  ██╔════╝██╔═══██╗████╗  ██║██╔════╝██║██╔════╝
  ██║     ██║   ██║██╔██╗ ██║█████╗  ██║██║  ███╗
  ██║     ██║   ██║██║╚██╗██║██╔══╝  ██║██║   ██║
  ╚██████╗╚██████╔╝██║ ╚████║██║     ██║╚██████╔╝
   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝
   ─────────────────────────────────────────────────────────────
   HOW TO GET THE PUBLIC CSV URL:
   1. Open your Google Spreadsheet.
   2. File → Share → Publish to web.
   3. Under "Link" tab: choose the sheet → format "Comma-separated values (.csv)"
   4. Click Publish → copy the URL.
   5. Paste it below as SHEET_CSV_URL.
   ─────────────────────────────────────────────────────────────
*/

const CONFIG = {
  // ── Google Sheets CSV public URL ──────────────────────────────
  SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT06fjOtxEAopcL5rkiBvTJbbl9RcSIfbvdaRyZwCxPjaTAf9z6MCCNud6FB2Ud9AoU9p-ASS6v42Kr/pub?output=csv",

  // ── Category display order (must match CSV category values) ───
  CATEGORY_ORDER: [
    "Fútbol",
    "Tecnología / Sistemas",
    "Autos / Motos",
    "Turismo",
    "Casas Deportes Argentina",
    "Salud",
    "Propiedades",
    "Novedades",
  ],

  // ── Typewriter messages ────────────────────────────────────────
  TYPEWRITER_MESSAGES: [
    "Sincronizando base de datos de enlaces…",
    "Optimizando el layout del escritorio…",
    "Cacheando recursos estáticos…",
    "Validando categorías de acceso…",
    "Compilando índice de navegación…",
    "Sistema operacional al 100%.",
    "Todos los módulos activos.",
  ],

  // ── Max links shown before "Ver más" ──────────────────────────
  INITIAL_LINK_LIMIT: 6,

  // ── Retry attempts for CSV fetch ──────────────────────────────
  FETCH_RETRIES: 2,
};

/* ──────────────────────────────────────────────────────────────
   STATE
   ────────────────────────────────────────────────────────────── */
let allLinks = [];         // All parsed & enabled link objects
let startTime = Date.now(); // For uptime counter
let verMoreStates = {};    // { categoryName: boolean }

/* ──────────────────────────────────────────────────────────────
   DOM REFERENCES
   ────────────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ──────────────────────────────────────────────────────────────
   INIT — wait for GSAP to load
   ────────────────────────────────────────────────────────────── */
function init() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    // GSAP not loaded yet, retry in 50ms
    setTimeout(init, 50);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  setupFooterYear();
  setupNavbar(prefersReduced);
  setupHero(prefersReduced);
  setupMicroDash(prefersReduced);
  setupTypewriter();
  setupShuffler(prefersReduced);
  setupScheduler();
  setupUptime();
  loadLinks();
  setupPhilosophy(prefersReduced);
}

document.addEventListener("DOMContentLoaded", init);

/* ══════════════════════════════════════════════════════════════
   FOOTER YEAR
   ══════════════════════════════════════════════════════════════ */
function setupFooterYear() {
  const el = $("#footer-year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ══════════════════════════════════════════════════════════════
   NAVBAR — glass morphing on scroll
   ══════════════════════════════════════════════════════════════ */
function setupNavbar(reduced) {
  const nav = $("#navbar");
  if (!nav) return;

  const heroEl = $("#hero");
  const heroH = heroEl ? heroEl.offsetHeight : window.innerHeight;

  const trigger = ScrollTrigger.create({
    start: `${heroH * 0.6}px top`,
    onEnter: () => nav.classList.add("scrolled"),
    onLeaveBack: () => nav.classList.remove("scrolled"),
  });
}

/* ══════════════════════════════════════════════════════════════
   HERO ANIMATIONS
   ══════════════════════════════════════════════════════════════ */
function setupHero(reduced) {
  if (reduced) return;

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(".hero-label", {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: 0.3,
    })
    .to(".hero-word", {
      y: "0%",
      duration: 1.1,
      stagger: 0.15,
      ease: "power3.out",
    }, "-=0.5")
    .to(".hero-sub", {
      opacity: 1,
      duration: 1,
    }, "-=0.6")
    .to(".hero-scroll-hint", {
      opacity: 1,
      duration: 0.8,
    }, "-=0.5");
  }, document.body);
}

/* ══════════════════════════════════════════════════════════════
   MICRO-DASHBOARD — artifact reveals
   ══════════════════════════════════════════════════════════════ */
function setupMicroDash(reduced) {
  if (reduced) return;

  gsap.utils.toArray(".artifact").forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      delay: i * 0.12,
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
      },
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   TYPEWRITER
   ══════════════════════════════════════════════════════════════ */
function setupTypewriter() {
  const el = $("#typewriter-text");
  if (!el) return;

  const msgs = CONFIG.TYPEWRITER_MESSAGES;
  let mi = 0;
  let ci = 0;
  let isDeleting = false;
  let timer;

  function tick() {
    const current = msgs[mi];

    if (!isDeleting) {
      el.textContent = current.slice(0, ci + 1);
      ci++;
      if (ci === current.length) {
        isDeleting = true;
        timer = setTimeout(tick, 2000);
        return;
      }
    } else {
      el.textContent = current.slice(0, ci - 1);
      ci--;
      if (ci === 0) {
        isDeleting = false;
        mi = (mi + 1) % msgs.length;
      }
    }

    const speed = isDeleting ? 35 : 55;
    timer = setTimeout(tick, speed);
  }

  timer = setTimeout(tick, 800);
}

/* ══════════════════════════════════════════════════════════════
   UPTIME COUNTER
   ══════════════════════════════════════════════════════════════ */
function setupUptime() {
  const el = $("#uptime-counter");
  if (!el) return;

  function format(secs) {
    const h = Math.floor(secs / 3600).toString().padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    el.textContent = format(elapsed);
  }, 1000);
}

/* ══════════════════════════════════════════════════════════════
   DIAGNOSTIC SHUFFLER
   ══════════════════════════════════════════════════════════════ */
function setupShuffler(reduced) {
  const cards = $$(".shuffler-card");
  if (!cards.length) return;

  const data = [
    { metric: "98.4%", meta: "Link Uptime" },
    { metric: "12ms",  meta: "Avg Load" },
    { metric: "7",     meta: "Categorías" },
  ];

  let active = 2; // index of front card

  function updateCards() {
    // front card goes to back-left, others shift forward
    const prev2 = (active + 1) % 3;
    const prev1 = (active + 2) % 3;
    const front = active;

    if (reduced) return;

    gsap.to(cards[front], {
      rotate: -4,
      scale: 0.93,
      opacity: 0.5,
      zIndex: 1,
      top: "15px",
      duration: 0.8,
      ease: "power2.inOut",
    });
    gsap.to(cards[prev2], {
      rotate: -1.5,
      scale: 0.96,
      opacity: 0.75,
      zIndex: 2,
      top: "8px",
      duration: 0.8,
      ease: "power2.inOut",
    });
    gsap.to(cards[prev1], {
      rotate: 0,
      scale: 1,
      opacity: 1,
      zIndex: 3,
      top: "0px",
      duration: 0.8,
      ease: "power2.inOut",
    });

    active = (active + 1) % 3;
  }

  setInterval(updateCards, 3000);
}

/* ══════════════════════════════════════════════════════════════
   PROTOCOL SCHEDULER
   ══════════════════════════════════════════════════════════════ */
function setupScheduler() {
  const dayBtns = $$(".day-btn");
  const cursor = $("#scheduler-cursor");
  const saveBtn = $("#save-btn");
  const savedConfirm = $("#saved-confirm");

  if (!dayBtns.length || !cursor) return;

  // Get the position of active day button and animate cursor there
  function animateCursorToDay(btn) {
    const btnRect = btn.getBoundingClientRect();
    const rowEl = btn.closest(".week-row");
    const rowRect = rowEl.getBoundingClientRect();
    const cursorParent = cursor.closest(".scheduler-cursor-row");
    const parentRect = cursorParent.getBoundingClientRect();

    const targetX = btnRect.left + btnRect.width / 2 - parentRect.left - 9;

    if (typeof gsap !== "undefined") {
      gsap.to(cursor, {
        x: targetX,
        duration: 0.5,
        ease: "power3.out",
      });
    } else {
      cursor.style.transform = `translateX(calc(${targetX}px - 50%))`;
    }
  }

  // Init cursor position
  const initActive = $(".day-btn.active");
  if (initActive) {
    // wait for layout
    requestAnimationFrame(() => animateCursorToDay(initActive));
  }

  dayBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      dayBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      animateCursorToDay(btn);
    });
  });

  // Auto-rotate through days (GSAP timeline)
  if (typeof gsap !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let currentDay = 2;

    const schedulerTl = gsap.timeline({
      repeat: -1,
      delay: 5,
    });

    dayBtns.forEach((_, i) => {
      schedulerTl.call(() => {
        dayBtns.forEach((b) => b.classList.remove("active"));
        dayBtns[i].classList.add("active");
        animateCursorToDay(dayBtns[i]);
      }, [], `+=${i === 0 ? 0 : 1.5}`);
    });
  }

  // Save button
  if (saveBtn && savedConfirm) {
    saveBtn.addEventListener("click", () => {
      savedConfirm.textContent = "✓ Guardado";
      savedConfirm.classList.add("show");

      if (typeof gsap !== "undefined") {
        gsap.fromTo(saveBtn, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: "power2.out" });
      }

      setTimeout(() => savedConfirm.classList.remove("show"), 2500);
    });
  }
}

/* ══════════════════════════════════════════════════════════════
   CSV — FETCH + PARSE + RENDER
   ══════════════════════════════════════════════════════════════ */
async function loadLinks(attempt = 0) {
  const loadingEl = $("#zocalos-loading");
  const errorEl = $("#zocalos-error");
  const gridEl = $("#zocalos-grid");
  const searchEmptyEl = $("#search-empty");

  if (loadingEl) loadingEl.removeAttribute("hidden");
  if (errorEl) errorEl.setAttribute("hidden", "");
  if (gridEl) gridEl.setAttribute("hidden", "");

  try {
    const response = await fetch(CONFIG.SHEET_CSV_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    const parsed = parseCSV(text);

    // Filter enabled === "TRUE"
    const enabled = parsed.filter(
      (row) => (row.enabled || "").trim().toUpperCase() === "TRUE"
    );

    if (!enabled.length) throw new Error("No enabled links found");

    allLinks = enabled;

    if (loadingEl) loadingEl.setAttribute("hidden", "");
    if (gridEl) gridEl.removeAttribute("hidden");

    renderGrid(allLinks);
    setupSearch();
    setupRetry();

  } catch (err) {
    console.error("[Dashboard] CSV load error:", err);

    if (attempt < CONFIG.FETCH_RETRIES) {
      await delay(1000 * (attempt + 1));
      return loadLinks(attempt + 1);
    }

    if (loadingEl) loadingEl.setAttribute("hidden", "");
    if (errorEl) errorEl.removeAttribute("hidden");

    setupRetry();
  }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];

  const headers = parseCSVRow(lines[0]).map((h) => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVRow(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (values[idx] || "").trim();
    });
    rows.push(obj);
  }

  return rows;
}

function parseCSVRow(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  result.push(current);
  return result;
}

/* ══════════════════════════════════════════════════════════════
   RENDER GRID
   ══════════════════════════════════════════════════════════════ */
function renderGrid(links, query = "") {
  const gridEl = $("#zocalos-grid");
  if (!gridEl) return;

  // Group by category in config order
  const grouped = {};
  CONFIG.CATEGORY_ORDER.forEach((cat) => {
    grouped[cat] = [];
  });

  links.forEach((link) => {
    const cat = (link.category || "").trim();
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(link);
  });

  // Sort each group by order
  Object.keys(grouped).forEach((cat) => {
    grouped[cat].sort((a, b) => {
      const oa = parseInt(a.order, 10) || 0;
      const ob = parseInt(b.order, 10) || 0;
      return oa - ob;
    });
  });

  // Filter by search query
  const q = query.trim().toLowerCase();

  gridEl.innerHTML = "";

  let anyVisible = false;

  CONFIG.CATEGORY_ORDER.forEach((cat) => {
    const catLinks = grouped[cat] || [];
    if (!catLinks.length) return;

    const filtered = q
      ? catLinks.filter((l) =>
          (l.title || "").toLowerCase().includes(q) ||
          (l.category || "").toLowerCase().includes(q)
        )
      : catLinks;

    if (q && !filtered.length) return; // skip empty categories in search

    anyVisible = true;

    const card = buildZocaloCard(cat, filtered, q);
    gridEl.appendChild(card);
  });

  // Reveal empty state if needed
  const searchEmptyEl = $("#search-empty");
  const searchQueryEl = $("#search-empty-query");

  if (q && !anyVisible) {
    if (searchEmptyEl) {
      searchEmptyEl.removeAttribute("hidden");
      if (searchQueryEl) searchQueryEl.textContent = query;
    }
  } else {
    if (searchEmptyEl) searchEmptyEl.setAttribute("hidden", "");
  }

  // Animate cards in
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && typeof gsap !== "undefined") {
    gsap.utils.toArray(".zocalo-card").forEach((card, i) => {
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: "power3.out",
        delay: i * 0.08,
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
        },
      });
    });

    // Section header
    gsap.to(".section-header", {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".section-header",
        start: "top 88%",
      },
    });
  } else {
    // Reduced motion: show immediately
    $$(".zocalo-card").forEach((c) => {
      c.style.opacity = "1";
      c.style.transform = "none";
    });
    const sh = $(".section-header");
    if (sh) { sh.style.opacity = "1"; sh.style.transform = "none"; }
  }
}

/* ──────────────────────────────────────────────────────────────
   BUILD A SINGLE ZÓCALO CARD
   ────────────────────────────────────────────────────────────── */
function buildZocaloCard(category, links, query = "") {
  const limit = CONFIG.INITIAL_LINK_LIMIT;
  const hasMore = links.length > limit;
  const isExpanded = verMoreStates[category] || false;

  const card = document.createElement("article");
  card.className = "zocalo-card";
  card.dataset.category = category;
  card.setAttribute("aria-label", `Categoría: ${category}`);

  // ─ Header
  const header = document.createElement("div");
  header.className = "zocalo-header";
  header.innerHTML = `
    <div class="zocalo-title-wrap">
      <span class="zocalo-cat-label">
        <svg width="6" height="6" viewBox="0 0 6 6" aria-hidden="true"><circle cx="3" cy="3" r="3" fill="currentColor"/></svg>
        ${escapeHtml(category)}
      </span>
      <h3 class="zocalo-title">${escapeHtml(category)}</h3>
    </div>
    <div class="zocalo-status">
      <span class="status-dot" aria-hidden="true"></span>
      <span class="mono-label">Operacional</span>
    </div>
  `;
  card.appendChild(header);

  // ─ Initial links (up to limit)
  const mainList = document.createElement("ul");
  mainList.className = "zocalo-links";
  mainList.setAttribute("aria-label", `Enlaces de ${category}`);

  const firstBatch = links.slice(0, limit);
  firstBatch.forEach((link) => {
    mainList.appendChild(buildLinkItem(link, query));
  });
  card.appendChild(mainList);

  // ─ More links (hidden initially)
  if (hasMore) {
    const moreWrap = document.createElement("div");
    moreWrap.className = "more-links-wrap";
    moreWrap.setAttribute("aria-hidden", !isExpanded);

    const moreList = document.createElement("ul");
    moreList.className = "zocalo-links";
    const moreBatch = links.slice(limit);
    moreBatch.forEach((link) => {
      moreList.appendChild(buildLinkItem(link, query));
    });

    moreWrap.appendChild(moreList);
    card.appendChild(moreWrap);

    // Restore expanded state
    if (isExpanded) {
      moreWrap.style.maxHeight = moreWrap.scrollHeight + "px";
    }

    // ─ Ver más button
    const footer = document.createElement("div");
    footer.className = "zocalo-footer";

    const btn = document.createElement("button");
    btn.className = "ver-mas-btn" + (isExpanded ? " expanded" : "");
    btn.setAttribute("aria-expanded", isExpanded);
    btn.setAttribute("aria-controls", "");
    btn.innerHTML = `
      ${isExpanded ? "Ver menos" : `Ver más (${moreBatch.length})`}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    `;

    btn.addEventListener("click", () => {
      const expanded = btn.classList.toggle("expanded");
      btn.setAttribute("aria-expanded", expanded);
      verMoreStates[category] = expanded;

      if (expanded) {
        btn.innerHTML = `Ver menos <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
        moreWrap.setAttribute("aria-hidden", "false");

        if (typeof gsap !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          gsap.to(moreWrap, {
            maxHeight: moreWrap.scrollHeight + "px",
            duration: 0.55,
            ease: "power2.inOut",
          });
        } else {
          moreWrap.style.maxHeight = moreWrap.scrollHeight + "px";
        }
      } else {
        btn.innerHTML = `Ver más (${moreBatch.length}) <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
        moreWrap.setAttribute("aria-hidden", "true");

        if (typeof gsap !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          gsap.to(moreWrap, {
            maxHeight: 0,
            duration: 0.45,
            ease: "power2.inOut",
          });
        } else {
          moreWrap.style.maxHeight = "0";
        }
      }
    });

    footer.appendChild(btn);
    card.appendChild(footer);
  }

  return card;
}

/* ──────────────────────────────────────────────────────────────
   BUILD LINK ITEM
   ────────────────────────────────────────────────────────────── */
function buildLinkItem(link, query = "") {
  const li = document.createElement("li");
  li.className = "link-item";

  const target = (link.target || "_blank").trim();
  const rel = target === "_blank" ? 'rel="noopener noreferrer"' : "";
  const icon = (link.icon || "🔗").trim();
  const title = escapeHtml((link.title || "Sin título").trim());
  const url = escapeHtml((link.url || "#").trim());

  // Highlight matching text
  const displayTitle = query
    ? highlightText(title, query)
    : title;

  li.innerHTML = `
    <a
      href="${url}"
      target="${target}"
      ${rel}
      class="link-anchor"
      aria-label="${title}${target === "_blank" ? " (abre en nueva pestaña)" : ""}"
    >
      <span class="link-icon" aria-hidden="true">${icon}</span>
      <span class="link-title">${displayTitle}</span>
      <svg class="link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
      </svg>
    </a>
  `;

  return li;
}

/* ══════════════════════════════════════════════════════════════
   SEARCH
   ══════════════════════════════════════════════════════════════ */
function setupSearch() {
  const searchInput = $("#search-input");
  const resetBtn = $("#reset-btn");
  const resetInlineBtn = $("#reset-inline-btn");

  if (!searchInput) return;

  let debounceTimer;

  searchInput.addEventListener("input", () => {
    const q = searchInput.value;

    // Show/hide reset button
    if (q) {
      resetBtn?.removeAttribute("hidden");
    } else {
      resetBtn?.setAttribute("hidden", "");
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      renderGrid(allLinks, q);
      ScrollTrigger.refresh();
    }, 250);
  });

  function clearSearch() {
    searchInput.value = "";
    resetBtn?.setAttribute("hidden", "");
    renderGrid(allLinks, "");
    ScrollTrigger.refresh();
    searchInput.focus();
  }

  resetBtn?.addEventListener("click", clearSearch);
  resetInlineBtn?.addEventListener("click", clearSearch);
}

/* ══════════════════════════════════════════════════════════════
   RETRY BUTTON
   ══════════════════════════════════════════════════════════════ */
function setupRetry() {
  const retryBtn = $("#retry-btn");
  if (!retryBtn) return;
  retryBtn.addEventListener("click", () => loadLinks(), { once: true });
}

/* ══════════════════════════════════════════════════════════════
   PHILOSOPHY SECTION ANIMATIONS
   ══════════════════════════════════════════════════════════════ */
function setupPhilosophy(reduced) {
  if (reduced) {
    $$(".phil-word, .phil-label, .phil-divider").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  const ctx = gsap.context(() => {
    // Labels
    gsap.to(".phil-label", {
      opacity: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".philosophy",
        start: "top 75%",
      },
    });

    // Divider
    gsap.to(".phil-divider", {
      opacity: 1,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".philosophy",
        start: "top 70%",
      },
    });

    // Words — stagger reveal per-word
    gsap.to(".phil-word", {
      y: "0%",
      opacity: 1,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".philosophy",
        start: "top 72%",
      },
    });
  }, ".philosophy");
}

/* ══════════════════════════════════════════════════════════════
   UTILITIES
   ══════════════════════════════════════════════════════════════ */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  return text.replace(regex, '<mark style="background:rgba(204,88,51,0.18);color:inherit;border-radius:2px;">$1</mark>');
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
