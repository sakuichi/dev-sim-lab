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
    {
      id: "technical-debt", href: "technical-debt/", status: "live",
      tags: { ja: ["技術的負債", "リファクタリング"], en: ["Technical debt", "Refactoring"] },
      ja: { name: "技術的負債シミュレーター", title: "技術的負債は、あとでまとめて返せばいい?", desc: "放置している間も借金の利息のように対応コストが複利で膨らんでいく様子を可視化するシミュレーター。" },
      en: { name: "Technical Debt Simulator", title: "Can you just pay off tech debt later?", desc: "A simulator visualizing how the cost of unaddressed technical debt compounds like interest over time." },
    },
    {
      id: "code-review", href: "code-review/", status: "live",
      tags: { ja: ["コードレビュー", "品質"], en: ["Code review", "Quality"] },
      ja: { name: "コードレビュー係数シミュレーター", title: "レビューは、早く終わらせた方がいい?", desc: "レビュー速度が上がるほど欠陥の検出率が下がっていく様子を可視化するシミュレーター。" },
      en: { name: "Code Review Coefficient Simulator", title: "Is it better to finish reviews quickly?", desc: "A simulator visualizing how defect detection rate drops as code review speed increases." },
    },
    {
      id: "release-frequency", href: "release-frequency/", status: "live",
      tags: { ja: ["リリース頻度", "DevOps"], en: ["Release frequency", "DevOps"] },
      ja: { name: "リリース頻度シミュレーター", title: "リリースは、まとめて少ない回数でやった方が安全?", desc: "リリース頻度が下がるほど変更失敗率・復旧時間が悪化していく様子をDORAの調査データで可視化するシミュレーター。" },
      en: { name: "Release Frequency Simulator", title: "Is it safer to release less often, in bigger batches?", desc: "A simulator visualizing how change failure rate and recovery time worsen as release frequency drops, based on DORA's research." },
    },
    {
      id: "cost-of-change", href: "cost-of-change/", status: "live",
      tags: { ja: ["修正コスト", "品質"], en: ["Cost of change", "Quality"] },
      ja: { name: "修正コスト・シミュレーター", title: "バグは、後工程で見つかるほど直すコストが跳ね上がる?", desc: "「後工程ほど修正コストが跳ね上がる」という通説と、実証研究の結果を比較できるシミュレーター。" },
      en: { name: "Cost of Change Simulator", title: "Does a bug cost dramatically more to fix the later it's found?", desc: "A simulator comparing the widely-cited claim that late-found bugs cost dramatically more against what empirical research actually found." },
    },
    {
      id: "wip-lead-time", href: "wip-lead-time/", status: "live",
      tags: { ja: ["WIP", "リードタイム"], en: ["WIP", "Lead time"] },
      ja: { name: "WIP・リードタイム シミュレーター", title: "仕掛かり(WIP)を増やせば、もっと早く終わる?", desc: "リトルの法則にもとづき、仕掛かり件数を増やすほどリードタイムが伸びていく様子を可視化するシミュレーター。" },
      en: { name: "WIP & Lead Time Simulator", title: "If we take on more work in parallel, will it finish faster?", desc: "A simulator visualizing how lead time grows as work in progress increases, based on Little's Law." },
    },
    {
      id: "pause-cost", href: "pause-cost/", status: "live",
      tags: { ja: ["中断コスト", "ナレッジ管理"], en: ["Pause cost", "Knowledge management"] },
      ja: { name: "中断コスト・シミュレーター", title: "作業を止めても、コストは増え続ける?", desc: "長期間中断した作業を再開するときの思い出し工数と作業漏れリスクを可視化するシミュレーター。" },
      en: { name: "Pause Cost Simulator", title: "If you pause the work, does the cost keep climbing?", desc: "A simulator visualizing the reacquisition cost and omission risk of resuming work after a long pause." },
    },
    {
      id: "zero-bugs", href: "zero-bugs/", status: "live",
      tags: { ja: ["信頼性", "SRE"], en: ["Reliability", "SRE"] },
      ja: { name: "バグゼロ・コストシミュレーター", title: "バグゼロのシステムは、目指せば作れる?", desc: "信頼性を100%に近づけようとするほどコストが指数的に増えていく様子をSREの考え方で可視化するシミュレーター。" },
      en: { name: "Zero Bugs Cost Simulator", title: "Can you actually build a zero-bug system if you aim for it?", desc: "A simulator visualizing how cost grows exponentially as target reliability approaches 100%, based on SRE practice." },
    },
    {
      id: "curse-of-knowledge", href: "curse-of-knowledge/", status: "live",
      tags: { ja: ["知識の呪縛", "コミュニケーション"], en: ["Curse of knowledge", "Communication"] },
      ja: { name: "知識の呪縛シミュレーター", title: "自分がわかっていることは、相手にも伝わっている?", desc: "送り手が思う理解度と受け手が実際に理解している度合いのギャップを、有名な実験にもとづいて可視化するシミュレーター。" },
      en: { name: "Curse of Knowledge Simulator", title: "If you understand something, does the other person understand it too?", desc: "A simulator visualizing the gap between a sender's assumed understanding and a receiver's actual understanding, based on a famous experiment." },
    },
    {
      id: "onboarding-ramp", href: "onboarding-ramp/", status: "live",
      tags: { ja: ["オンボーディング", "生産性"], en: ["Onboarding", "Productivity"] },
      ja: { name: "オンボーディング立ち上がりシミュレーター", title: "新しく加わった人は、初日から「1人月」分働ける?", desc: "新しく加わったメンバーの生産性が時間をかけて立ち上がっていく様子を、業界調査データにもとづいて可視化するシミュレーター。" },
      en: { name: "Onboarding Ramp-Up Simulator", title: "Can a new team member contribute a full \"person-month\" from day one?", desc: "A simulator visualizing how a new team member's productivity ramps up over time, based on industry survey data." },
    },
    {
      id: "skill-variance", href: "skill-variance/", status: "live",
      tags: { ja: ["生産性", "見積もり"], en: ["Productivity", "Estimation"] },
      ja: { name: "生産性ばらつきシミュレーター", title: "見積もりの「1人日」は、誰が担当しても同じ?", desc: "開発者間の生産性のばらつき(いわゆる「10倍プログラマ」)が見積もりとの乖離にどう影響するかを可視化するシミュレーター。" },
      en: { name: "Developer Productivity Variance Simulator", title: "Is a \"person-day\" the same no matter who's assigned?", desc: "A simulator visualizing how developer productivity variance (the \"10x programmer\" debate) affects deviation from estimates." },
    },
    {
      id: "speak-up-cost", href: "speak-up-cost/", status: "live",
      tags: { ja: ["心理的安全性", "組織"], en: ["Psychological safety", "Organization"] },
      ja: { name: "発言コスト・シミュレーター", title: "その意見、言ったら自分の仕事になる?", desc: "「発言するとタスクを負わされる」という構造が発言意欲とリスクの見逃しにどう影響するかを可視化するシミュレーター。" },
      en: { name: "Speak-Up Cost Simulator", title: "If you say that, does it become your job?", desc: "A simulator visualizing how a \"speaking up means you own the task\" structure affects willingness to speak up and the risk of issues being missed." },
    },
    {
      id: "psychological-safety", href: "psychological-safety/", status: "live",
      tags: { ja: ["心理的安全性", "組織"], en: ["Psychological safety", "Organization"] },
      ja: { name: "心理的安全性シミュレーター", title: "ミスの報告が少ないチームは、優れたチーム?", desc: "心理的安全性の水準が、報告される問題と隠れた問題の割合にどう影響するかをEdmondsonの研究にもとづいて可視化するシミュレーター。" },
      en: { name: "Psychological Safety Simulator", title: "Is a team with fewer reported mistakes the better team?", desc: "A simulator visualizing how psychological safety level affects the split between reported and hidden problems, based on Edmondson's research." },
    },
    {
      id: "survivorship-bias", href: "survivorship-bias/", status: "live",
      tags: { ja: ["生存者バイアス", "組織"], en: ["Survivorship bias", "Organization"] },
      ja: { name: "生存者バイアス・シミュレーター", title: "生き残った人だけを見て、その指導方法は正しいと言える?", desc: "指導方法の厳しさが、方法に起因する離脱と配置段階のミスマッチにどう影響するかを可視化するシミュレーター。" },
      en: { name: "Survivorship Bias Simulator", title: "If you only look at who stayed, was the training method actually right?", desc: "A simulator visualizing how a training method's harshness affects method-driven attrition versus baseline placement mismatch." },
    },
    {
      id: "bikeshedding", href: "bikeshedding/", status: "live",
      tags: { ja: ["ビケシェッディング", "会議"], en: ["Bikeshedding", "Meetings"] },
      ja: { name: "ビケシェッディング・シミュレーター", title: "自転車置き場の色は45分、原子炉の契約は2分で決まる?", desc: "パーキンソンの法則(1957年)にもとづき、議題の専門性が本来かけるべき時間と実際にかけられがちな時間のズレにどう影響するかを可視化するシミュレーター。" },
      en: { name: "Bikeshedding Simulator", title: "The bike shed color takes 45 minutes, the reactor contract takes 2?", desc: "Based on Parkinson's Law (1957), a simulator visualizing how a topic's required expertise drives a gap between ideal and actual discussion time." },
    },
    {
      id: "yak-shaving", href: "yak-shaving/", status: "live",
      tags: { ja: ["ヤク剃り", "集中"], en: ["Yak shaving", "Focus"] },
      ja: { name: "ヤク剃り・シミュレーター", title: "その作業、本題とどうつながってるんだっけ?", desc: "「先にアレが必要」の連鎖(ヤク剃り)の深さが、本題に着手できる時刻と1日の残り時間にどう影響するかを可視化するシミュレーター。" },
      en: { name: "Yak Shaving Simulator", title: "Wait — how is this task connected to what I was doing?", desc: "A simulator visualizing how the depth of a \"but first I need...\" chain pushes back the real task's start time and eats the workday." },
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
      const tags = (s.tags && s.tags[LANG]) || [];
      a.innerHTML = `<h2>${c.title} | ${c.name}</h2><p>${c.desc}</p>
        <div class="sim-tags">${tags.map((tag) => `<span>${tag}</span>`).join("")}</div>`;
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
