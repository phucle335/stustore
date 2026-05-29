import fs from "fs";
import path from "path";

const ROOT = process.cwd();

function toCamel(className) {
  const segments = className.split("--");
  let out = "";
  for (let si = 0; si < segments.length; si++) {
    const words = segments[si].split("-").filter(Boolean);
    for (let wi = 0; wi < words.length; wi++) {
      const w = words[wi];
      if (si === 0 && wi === 0) out += w;
      else out += w.charAt(0).toUpperCase() + w.slice(1);
    }
  }
  return out;
}

function buildMapFromCss(cssPath) {
  const css = fs.readFileSync(cssPath, "utf8");
  const map = {};
  for (const m of css.matchAll(/\.([a-zA-Z][\w]*)/g)) {
    map[m[1]] = toCamel(m[1]);
  }
  return map;
}

function fixFile(tsxPath) {
  let s = fs.readFileSync(tsxPath, "utf8");
  const importMatch = s.match(
    /import styles from ["'](@\/[^"']+\.module\.css)["']/,
  );
  if (!importMatch) return false;

  const cssPath = path.join(
    ROOT,
    importMatch[1].replace("@/", "").replace(/\//g, path.sep),
  );
  if (!fs.existsSync(cssPath)) return false;

  const reverseMap = {};
  const cssClasses = fs.readFileSync(cssPath, "utf8");
  for (const m of cssClasses.matchAll(/\.([a-zA-Z][\w]*)/g)) {
    const camel = toCamel(m[1]);
    reverseMap[m[1].replace(/([A-Z])/g, "-$1").toLowerCase()] = camel; // noop
  }

  // Build kebab -> camel from css class names in file (original kebab from migration - classes are camel in css now)
  // Map camel export names
  const camelExports = {};
  for (const m of cssClasses.matchAll(/\.([a-zA-Z][\w]*)/g)) {
    camelExports[m[1]] = m[1];
  }

  // Try matching className={"kebab-case"} to camel in module
  const orig = s;
  s = s.replace(/className=\{"([a-z][a-z0-9-]*)"}/g, (_, kebab) => {
    const camel = toCamel(kebab);
    if (camelExports[camel]) return `className={styles.${camel}}`;
    return `className={"${kebab}"}`;
  });

  // Remove stray global suffixes in templates like ` ${styles.foo} product-detail-tab-panel`
  s = s.replace(
    /`\$\{styles\.(\w+)\} ([a-z][a-z0-9-]*)`/g,
    "`${styles.$1}`",
  );

  if (s !== orig) {
    fs.writeFileSync(tsxPath, s);
    return true;
  }
  return false;
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith(".tsx") && fixFile(p)) {
      console.log("kebab fix:", path.relative(ROOT, p));
    }
  }
}

walk(path.join(ROOT, "components"));
