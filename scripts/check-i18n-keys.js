// Verifies that ja/en (and DEV overlay, if present) i18n dictionaries have
// identical key structures. Run: node scripts/check-i18n-keys.js <file...>
"use strict";
const fs = require("fs");

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
  const dictNames = ["I18N", "CHROME", "PAGE_I18N", "DEV"];
  for (const name of dictNames) {
    const re = new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*({[\\s\\S]*?});`, "m");
    const m = src.match(re);
    if (!m) continue;
    // eslint-disable-next-line no-eval
    const dict = eval(`(${m[1]})`);
    if (!dict.ja || !dict.en) continue;
    process.stdout.write(`${file} :: ${name} ja/en `);
    const same = diff(`${name}.ja`, dict.ja, `${name}.en`, dict.en);
    console.log(same ? "OK" : "MISMATCH");
    ok = ok && same;
  }
}
process.exit(ok ? 0 : 1);
