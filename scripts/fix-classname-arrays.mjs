import fs from "fs";
import path from "path";

const ROOT = process.cwd();

function fixContent(s) {
  return s.replace(
    /className=\{\[([^\]]+)\]\.filter\(Boolean\)\.join\(" "\)\}/g,
    (_, inner) => {
      const parts = [...inner.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      const styleRefs = [...inner.matchAll(/(styles\.\w+)/g)].map((m) => m[1]);

      if (styleRefs.length > 0 && parts.length === 0) {
        const unique = [...new Set(styleRefs)];
        if (unique.length === 1) return `className={${unique[0]}}`;
        return `className={\`${unique.map((r) => `\${${r}}`).join(" ")}\`}`;
      }

      if (parts.length > 0 && styleRefs.length === 0) {
        return `className="${parts.join(" ")}"`;
      }

      if (styleRefs.length > 0 && parts.length > 0) {
        const all = [
          ...styleRefs.map((r) => `\${${r}}`),
          ...parts,
        ];
        return `className={\`${all.join(" ")}\`}`;
      }

      return `className="${parts.join(" ")}"`;
    },
  );
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith(".tsx")) {
      const raw = fs.readFileSync(p, "utf8");
      const next = fixContent(raw);
      if (next !== raw) {
        fs.writeFileSync(p, next);
        console.log("fixed:", path.relative(ROOT, p));
      }
    }
  }
}

walk(path.join(ROOT, "components"));
