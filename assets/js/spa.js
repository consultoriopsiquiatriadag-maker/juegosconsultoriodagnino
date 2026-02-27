(() => {
  const APP = window.APP = window.APP || {};
  APP.LS = APP.LS || {
    "LANG": "app_lang",
    "AUDIO_ON": "app_audio_on",
    "AUDIO_VOL": "app_audio_vol",
    "FONT": "app_font_px"
  };

// ========= SPA CORE (PRO) =========
    APP.SPA = (() => {
      const cache = new Map();
      let navigating = false;

      function isInternalLink(a){
        if (!a || !a.getAttribute) return false;
        const href = a.getAttribute("href") || "";
        if (!href || href.startsWith("#")) return false;
        if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
        if (a.hasAttribute("download")) return false;
        if ((a.getAttribute("target") || "").toLowerCase() === "_blank") return false;
        if (a.getAttribute("data-spa") === "0") return false;

        let url;
        try { url = new URL(href, window.location.href); }
        catch { return false; }

        if (url.origin !== window.location.origin) return false;
        return true;
      }

      function shouldIgnoreClick(e){
        return e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
      }

      async function fetchDoc(url){
        const key = url.toString();
        if (cache.has(key)) return cache.get(key);

        const res = await fetch(key, { credentials:"same-origin" });
        if (!res.ok) throw new Error("Fetch failed " + res.status);
        const text = await res.text();
        cache.set(key, text);
        return text;
      }

      function extractMain(htmlText){
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        const main = doc.querySelector("#spaMain");
        const title = doc.title || "";
        return { main, title };
      }

      function replaceMain(newMain){
        const cur = document.querySelector("#spaMain");
        if (!cur) throw new Error("Current #spaMain not found");
        cur.replaceWith(newMain);
      }

      function reInitAfterSwap(title){
        const lang = APP.getLang();
        APP.applyI18n(lang);
        APP.syncLangButtons(lang);

        APP.applyFontPx(APP.getFontPx());

        APP.syncAudioButtonLabel();
        APP.syncVolumeUI();

        APP.safeTrack(title || document.title);
      }

      async function navigate(href, push=true){
        if (navigating) return;
        navigating = true;

        let url;
        try { url = new URL(href, window.location.href); }
        catch { navigating = false; return; }

        try{
          const htmlText = await fetchDoc(url);
          const { main, title } = extractMain(htmlText);

          if (!main){
            window.location.href = url.toString();
            return;
          }

          const adopted = document.importNode(main, true);
          replaceMain(adopted);

          if (title) document.title = title;
          if (push) history.pushState({ url: url.toString() }, "", url.toString());

          window.scrollTo({ top: 0, behavior: "auto" });
          reInitAfterSwap(title);

        }catch(err){
          console.warn("[SPA] navigation failed, fallback to normal:", err);
          window.location.href = url.toString();
        }finally{
          navigating = false;
        }
      }

      function onClick(e){
        if (shouldIgnoreClick(e)) return;
        const a = e.target.closest("a");
        if (!a) return;
        if (!isInternalLink(a)) return;

        e.preventDefault();
        navigate(a.href, true);
      }

      function onPop(e){
        const st = e.state;
        if (st && st.url) navigate(st.url, false);
        else navigate(window.location.href, false);
      }

      function init(){
        document.addEventListener("click", onClick);
        window.addEventListener("popstate", onPop);
        APP.safeTrack(document.title);
      }

      return { init, navigate };
    })();
})();
