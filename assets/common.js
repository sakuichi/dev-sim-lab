/* ============================================================
   dev-sim-lab: shared i18n / language state / chrome wiring
   Pattern inherited from the QCD Trade-off Simulator, extended
   with localStorage persistence and a ?lang= URL override so
   share links can force a language.
   ============================================================ */
"use strict";

window.DevSimLab = (function () {
  const LANG_KEY = "devsimlab_lang";

  function detectLang() {
    const qs = new URLSearchParams(location.search).get("lang");
    if (qs === "ja" || qs === "en") return qs;
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "ja" || saved === "en") return saved;
    return (navigator.language || "en").toLowerCase().startsWith("ja") ? "ja" : "en";
  }

  let LANG = detectLang();
  let TONE = "std"; // "std" | "dev"
  const listeners = [];

  function setLang(lang) {
    if (lang !== "ja" && lang !== "en") return;
    LANG = lang;
    localStorage.setItem(LANG_KEY, lang);
    notify();
  }
  function toggleTone() {
    TONE = TONE === "dev" ? "std" : "dev";
    notify();
  }
  function onChange(fn) {
    listeners.push(fn);
  }
  function notify() {
    listeners.forEach((fn) => fn({ lang: LANG, tone: TONE }));
  }

  /* ---- site-wide chrome strings (header/footer/share/tone) ---- */
  const CHROME = {
    ja: {
      brand: "開発あるある図鑑",
      brandEyebrow: "開発あるある図鑑",
      toneBtn: "🔥 開発者モード",
      toneNote: "※ ジョークモードです。お客様への提示には標準モードをどうぞ。",
      shareLabel: "SHARE",
      copyBtn: "URLをコピー",
      copiedMsg: "コピーしました!",
      footNote: "本サイトのシミュレーターおよびコンテンツは情報提供を目的としたものであり、特定のプロジェクトに関する助言を行うものではありません。詳細は免責事項をご覧ください。",
      footPrivacy: "プライバシーポリシー・免責事項",
      footDisclosure: "Amazonのアソシエイトとして、当サイトは適格販売により収入を得ています。",
      backToTop: "← 一覧に戻る",
    },
    en: {
      brand: "Dev Sim Lab",
      brandEyebrow: "Dev Sim Lab",
      toneBtn: "🔥 Developer mode",
      toneNote: "* Joke mode. Switch back to standard before client meetings.",
      shareLabel: "SHARE",
      copyBtn: "Copy URL",
      copiedMsg: "Copied!",
      footNote: "The simulators and content on this site are provided for informational purposes only and do not constitute advice on any specific project. See the disclaimer for details.",
      footPrivacy: "Privacy Policy & Disclaimer",
      footDisclosure: "As an Amazon Associate, this site earns from qualifying purchases.",
      backToTop: "← Back to all simulators",
    },
  };

  /* ---- share widget (networks differ by language, per requirements.md 4.4) ---- */
  const NETWORKS = {
    x: {
      label: "X",
      glyph: "X",
      bg: "#000000",
      url: (t, url) =>
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(t.shareText || "")}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(t.shareHashtags || "")}`,
    },
    hatena: {
      label: "はてブ",
      glyph: "B!",
      bg: "#00A4DE",
      url: (t, url) => `https://b.hatena.ne.jp/entry/panel/?url=${encodeURIComponent(url)}`,
    },
    facebook: {
      label: "Facebook",
      glyph: "f",
      bg: "#1877F2",
      url: (t, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    linkedin: {
      label: "LinkedIn",
      glyph: "in",
      bg: "#0A66C2",
      url: (t, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
  };
  const DEFAULT_NETWORKS = { ja: ["x", "hatena", "facebook"], en: ["x", "linkedin", "facebook"] };

  function makeIco(glyph, bg) {
    const s = document.createElement("span");
    s.className = "share-ico";
    s.style.background = bg;
    s.textContent = glyph;
    s.setAttribute("aria-hidden", "true");
    return s;
  }

  // container: element to fill. opts: {url, shareText, shareHashtags, networks}
  function renderShare(container, opts) {
    if (!container || !opts || !opts.url) return;
    const t = CHROME[LANG];
    const nets = opts.networks || DEFAULT_NETWORKS[LANG];
    container.innerHTML = "";
    nets.forEach((key) => {
      const n = NETWORKS[key];
      if (!n) return;
      const a = document.createElement("a");
      a.className = "share-btn";
      a.appendChild(makeIco(n.glyph, n.bg));
      a.appendChild(document.createTextNode(n.label));
      a.href = n.url({ shareText: opts.shareText, shareHashtags: opts.shareHashtags }, opts.url);
      a.target = "_blank";
      a.rel = "noopener";
      container.appendChild(a);
    });

    const copy = document.createElement("button");
    copy.className = "share-btn";
    copy.type = "button";
    const copyLabel = document.createElement("span");
    copy.appendChild(makeIco("⧉", "#5C6B68"));
    copyLabel.textContent = t.copyBtn;
    copy.appendChild(copyLabel);
    copy.addEventListener("click", async () => {
      let ok = false;
      try {
        await navigator.clipboard.writeText(opts.url);
        ok = true;
      } catch (e) {
        const ta = document.createElement("textarea"); // non-HTTPS fallback
        ta.value = opts.url;
        document.body.appendChild(ta);
        ta.select();
        try {
          ok = document.execCommand("copy");
        } catch (e2) {}
        ta.remove();
      }
      if (ok) {
        copyLabel.textContent = t.copiedMsg;
        copy.classList.add("copied");
        setTimeout(() => {
          copyLabel.textContent = t.copyBtn;
          copy.classList.remove("copied");
        }, 1600);
      }
    });
    container.appendChild(copy);
  }

  /* ---- header/footer wiring via data-* attributes ----
     [data-lang-switch] wraps the ja/en buttons (button[data-lang])
     [data-brand] / [data-brand-eyebrow] show the site name
     [data-tone-btn] / [data-tone-note] wire the 🔥 dev-mode toggle
     [data-foot-note] / [data-foot-privacy] / [data-foot-disclosure] / [data-share-label] / [data-back-top]
     fill in shared footer/share copy.
     Pass onRender(lang, tone) for page-specific i18n re-rendering. */
  function initChrome(opts) {
    opts = opts || {};
    document.querySelectorAll("[data-lang-switch] button").forEach((b) => {
      b.addEventListener("click", () => setLang(b.dataset.lang));
    });
    const toneBtn = document.querySelector("[data-tone-btn]");
    if (toneBtn) toneBtn.addEventListener("click", toggleTone);

    function render() {
      const t = CHROME[LANG];
      document.documentElement.lang = LANG;
      document.querySelectorAll("[data-lang-switch] button").forEach((b) =>
        b.setAttribute("aria-pressed", b.dataset.lang === LANG));
      document.querySelectorAll("[data-brand]").forEach((elm) => (elm.textContent = t.brand));
      document.querySelectorAll("[data-brand-eyebrow]").forEach((elm) => (elm.textContent = t.brandEyebrow));
      if (toneBtn) {
        toneBtn.textContent = t.toneBtn;
        toneBtn.setAttribute("aria-pressed", TONE === "dev");
      }
      const toneNote = document.querySelector("[data-tone-note]");
      if (toneNote) {
        toneNote.textContent = t.toneNote;
        toneNote.hidden = TONE !== "dev";
      }
      document.querySelectorAll("[data-foot-note]").forEach((elm) => (elm.textContent = t.footNote));
      document.querySelectorAll("[data-foot-privacy]").forEach((elm) => (elm.textContent = t.footPrivacy));
      document.querySelectorAll("[data-foot-disclosure]").forEach((elm) => (elm.textContent = t.footDisclosure));
      document.querySelectorAll("[data-share-label]").forEach((elm) => (elm.textContent = t.shareLabel));
      document.querySelectorAll("[data-back-top]").forEach((elm) => (elm.textContent = t.backToTop));
      if (typeof opts.onRender === "function") opts.onRender(LANG, TONE);
    }
    onChange(render);
    render();
  }

  return {
    getLang: () => LANG,
    getTone: () => TONE,
    setLang,
    toggleTone,
    onChange,
    renderShare,
    initChrome,
    CHROME,
  };
})();
