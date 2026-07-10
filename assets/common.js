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
      homeCardTitle: "開発あるある図鑑(全シミュレーター一覧)",
      homeCardDesc: "他のソフトウェア開発の「あるある」もあわせてどうぞ。",
      relatedH: "関連する問題",
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
      homeCardTitle: "Dev Sim Lab (all simulators)",
      homeCardDesc: "Explore the other software development misconceptions in this series.",
      relatedH: "Related problems",
    },
  };

  /* ---- registry of every simulator page (single source of truth for the
     landing-page card grid and every page's "related problems" section) ---- */
  const SIMS = [
    {
      id: "qcd-tradeoff", href: "qcd-tradeoff/", status: "live",
      tags: { ja: ["品質", "コスト", "納期"], en: ["Quality", "Cost", "Delivery"] },
      ja: { name: "QCDトレードオフ・シミュレーター", title: "品質・コスト・納期のトレードオフを、見える形に。", desc: "品質(Q)・コスト(C)・納期(D)は互いにトレードオフの関係にあります。ドラッグ操作でバランスを体感できるシミュレーター。" },
      en: { name: "QCD Trade-off Simulator", title: "Make the quality-cost-delivery trade-off visible.", desc: "Quality, cost and delivery are always in tension. Drag the chart to feel the trade-off for yourself." },
    },
    {
      id: "brooks-law", href: "brooks-law/", status: "live",
      tags: { ja: ["人員計画", "コミュニケーション"], en: ["Staffing", "Communication"] },
      ja: { name: "ブルックスの法則シミュレーター", title: "人が増えれば、早く終わる?", desc: "増員によるコミュニケーションコストの増加を可視化するシミュレーター。" },
      en: { name: "Brooks's Law Simulator", title: "Will adding people make it faster?", desc: "A simulator visualizing how communication overhead grows with team size." },
    },
    {
      id: "utilization-trap", href: "utilization-trap/", status: "live",
      tags: { ja: ["稼働率", "待ち時間"], en: ["Utilization", "Wait time"] },
      ja: { name: "稼働率100%の罠シミュレーター", title: "全員が常に忙しい = 効率的?", desc: "稼働率が高まるほど待ち時間が急増する様子を可視化するシミュレーター。" },
      en: { name: "Utilization Trap Simulator", title: "Is everyone being 100% busy actually efficient?", desc: "A simulator showing how wait times explode as utilization approaches 100%." },
    },
    {
      id: "context-switch", href: "context-switch/", status: "live",
      tags: { ja: ["マルチタスク", "生産性"], en: ["Multitasking", "Productivity"] },
      ja: { name: "コンテキストスイッチ・シミュレーター", title: "3案件並行なら、1/3ずつ進む?", desc: "並行案件数が増えるほど実効作業時間が失われる様子を可視化するシミュレーター。" },
      en: { name: "Context Switch Simulator", title: "Three projects at once — does each move at 1/3 speed?", desc: "A simulator visualizing how context-switching erodes effective work time." },
    },
    {
      id: "estimation-uncertainty", href: "estimation-uncertainty/", status: "live",
      tags: { ja: ["見積もり", "計画"], en: ["Estimation", "Planning"] },
      ja: { name: "見積もりの不確実性シミュレーター", title: "最初の見積もりは、そのまま信じていい?", desc: "プロジェクトの進行段階に応じて見積もりの誤差幅が狭まっていく「不確実性のコーン」を可視化するシミュレーター。" },
      en: { name: "Estimation Uncertainty Simulator", title: "Can you trust the first estimate?", desc: "A simulator visualizing the Cone of Uncertainty — how estimate accuracy narrows as a project progresses." },
    },
  ];

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

  // container: element to fill. opts: {exclude: id of the current page's own sim}
  function renderRelated(container, opts) {
    if (!container) return;
    opts = opts || {};
    const t = CHROME[LANG];
    container.innerHTML = "";
    const home = document.createElement("a");
    home.className = "sim-card";
    home.href = "../";
    home.innerHTML = `<h2>${t.homeCardTitle}</h2><p>${t.homeCardDesc}</p>`;
    container.appendChild(home);
    SIMS.filter((s) => s.id !== opts.exclude).forEach((s) => {
      const c = s[LANG];
      const a = document.createElement("a");
      a.className = "sim-card";
      a.href = "../" + s.href;
      a.innerHTML = `<h2>${c.title} | ${c.name}</h2><p>${c.desc}</p>`;
      container.appendChild(a);
    });
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
      document.querySelectorAll("[data-related-h]").forEach((elm) => (elm.textContent = t.relatedH));
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
    renderRelated,
    initChrome,
    CHROME,
    SIMS,
  };
})();
