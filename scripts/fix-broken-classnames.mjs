/**
 * Repair className strings broken by migrate-store-css-modules.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const FA_FIXES = [
  [/className=\{\["fas", "fa-shopping-bag"\]\.filter\(Boolean\)\.join\(" "\)\}/g, 'className="fas fa-shopping-bag"'],
  [/className=\{\["fas", "fa-search"\]\.filter\(Boolean\)\.join\(" "\)\}/g, 'className="fas fa-search"'],
  [/className=\{\["fas", "fa-arrow-left"\]\.filter\(Boolean\)\.join\(" "\)\}/g, 'className="fas fa-arrow-left"'],
  [/className=\{\["fas", "fa-chevron-left"\]\.filter\(Boolean\)\.join\(" "\)\}/g, 'className="fas fa-chevron-left"'],
  [/className=\{\["fas", "fa-chevron-right"\]\.filter\(Boolean\)\.join\(" "\)\}/g, 'className="fas fa-chevron-right"'],
  [/className=\{\["fas", "fa-star"\]\.filter\(Boolean\)\.join\(" "\)\}/g, 'className="fas fa-star"'],
  [/className=\{\["far", "fa-user"\]\.filter\(Boolean\)\.join\(" "\)\}/g, 'className="far fa-user"'],
  [/className=\{\["fas", "\$\{item\.icon\}"\]\.filter\(Boolean\)\.join\(" "\)\}/g, 'className={`fas ${item.icon}`}'],
  [/className=\{\["fas", "\$\{policy\.icon\}"\]\.filter\(Boolean\)\.join\(" "\)\}/g, 'className={`fas ${policy.icon}`}'],
];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith(".tsx")) fixFile(p);
  }
}

function fixFile(filePath) {
  let s = fs.readFileSync(filePath, "utf8");
  const orig = s;
  for (const [re, rep] of FA_FIXES) s = s.replace(re, rep);
  if (s !== orig) {
    fs.writeFileSync(filePath, s);
    console.log("FA fix:", path.relative(ROOT, filePath));
  }
}

walk(path.join(ROOT, "components"));
