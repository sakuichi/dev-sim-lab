// Verifies that ja/en (and DEV overlay, if present) i18n dictionaries have
// identical key structures. Runs each page's inline script in a minimal DOM
// stub via vm so top-level consts/functions resolve normally; errors from
// later DOM-manipulation statements are ignored as long as the dictionaries
// were already assigned.
// Run: node scripts/check-i18n-keys.js <file...>
"use strict";
const fs = require("fs");
const vm = require("vm");

function fakeElement() {
  const el = {
    style: {},
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    dataset: {},
    children: [],
    addEventListener() {},
    setAttribute() {},
    getAttribute: () => null,
    appendChild(child) { this.children.push(child); return child; },
    querySelector: () => fakeElement(),
    querySelectorAll: () => [],
    remove() {},
  };
  Object.defineProperty(el, "innerHTML", { get() { return this._html || ""; }, set(v) { this._html = v; } });
  Object.defineProperty(el, "textContent", { get() { return this._text || ""; }, set(v) { this._text = v; } });
  return el;
}

function runInSandbox(src) {
  const sandbox = {
    console,
    document: {
      documentElement: fakeElement(),
      title: "",
      getElementById: () => fakeElement(),
      querySelector: () => fakeElement(),
      querySelectorAll: () => [],
      createElement: () => fakeElement(),
      createElementNS: () => fakeElement(),
      createTextNode: (t) => ({ textContent: t }),
      addEventListener() {},
    },
    window: {},
    navigator: { language: "en", clipboard: { writeText: async () => {} } },
    location: { search: "", href: "" },
    localStorage: { getItem: () => null, setItem() {} },
    URLSearchParams,
    DevSimLab: {
      initChrome() {},
      renderShare() {},
      onChange() {},
      getLang: () => "ja",
      getTone: () => "std",
      CHROME: {},
    },
    setTimeout,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  try {
    vm.runInContext(src, sandbox, { timeout: 2000 });
  } catch (e) {
    // Later DOM-manipulation statements may fail against the stub;
    // dictionaries assigned earlier in the script are still usable.
  }
  // Top-level const/let bindings aren't own properties of the sandbox, so
  // pull them out explicitly via globalThis assignment in the same context.
  const grab = ["I18N", "CHROME", "PAGE_I18N", "DEV"]
    .map((n) => `globalThis.${n} = typeof ${n} !== "undefined" ? ${n} : (typeof DevSimLab !== "undefined" && DevSimLab.${n} ? DevSimLab.${n} : undefined);`)
    .join("\n");
  try {
    vm.runInContext(grab, sandbox, { timeout: 2000 });
  } catch (e) {}
  return sandbox;
}

function keySet(obj, prefix = "") {
  const keys = new Set();
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return keys;
  for (const k of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    keys.add(path);
    for (const sub of keySet(obj[k], path)) keys.add(sub);
  }
  return keys;
}

function diff(aName, a, bName, b) {
  const aKeys = keySet(a);
  const bKeys = keySet(b);
  const onlyA = [...aKeys].filter((k) => !bKeys.has(k));
  const onlyB = [...bKeys].filter((k) => !aKeys.has(k));
  if (onlyA.length === 0 && onlyB.length === 0) return true;
  if (onlyA.length) console.error(`  only in ${aName}: ${onlyA.join(", ")}`);
  if (onlyB.length) console.error(`  only in ${bName}: ${onlyB.join(", ")}`);
  return false;
}

let ok = true;
for (const file of process.argv.slice(2)) {
  const src = fs.readFileSync(file, "utf8");
  const sandbox = runInSandbox(src);
  const dictNames = ["I18N", "CHROME", "PAGE_I18N", "DEV"];
  for (const name of dictNames) {
    const dict = sandbox[name];
    if (!dict || !dict.ja || !dict.en) continue;
    process.stdout.write(`${file} :: ${name} ja/en `);
    const same = diff(`${name}.ja`, dict.ja, `${name}.en`, dict.en);
    console.log(same ? "OK" : "MISMATCH");
    ok = ok && same;
  }
}
process.exit(ok ? 0 : 1);
