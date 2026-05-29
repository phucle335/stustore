import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const HOME = path.join(ROOT, "styles/pages/home.css");
const OUT = path.join(ROOT, "styles/components/motto");

function toCamel(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function transformSelectors(css) {
  return css.replace(/\.motto-([a-zA-Z0-9-]+)/g, (_, name) => `.${toCamel(name)}`);
}

function extractBlocks(css, prefixes) {
  const lines = css.split("\n");
  const blocks = [];
  let current = null;

  for (const line of lines) {
    const match = line.match(/^\.motto-([a-z0-9-]+)/);
    if (match) {
      const prefix = match[1].split("-")[0];
      const fullClass = match[1];
      const belongs = prefixes.some(
        (p) => fullClass === p || fullClass.startsWith(`${p}-`),
      );
      if (belongs) {
        if (current) blocks.push(current);
        current = line + "\n";
        continue;
      }
    }
    if (current) {
      if (line.match(/^\.motto-/) && !line.includes(current.split("\n")[0].slice(1).split("{")[0])) {
        const m = line.match(/^\.motto-([a-z0-9-]+)/);
        if (m) {
          const belongs = prefixes.some(
            (p) => m[1] === p || m[1].startsWith(`${p}-`),
          );
          if (!belongs) {
            blocks.push(current);
            current = null;
            continue;
          }
        }
      }
      current += line + "\n";
    }
  }
  if (current) blocks.push(current);
  return blocks.join("\n");
}

/** Simpler: extract line ranges from home.css by start/end markers */
function sliceCss(css, startPattern, endPattern) {
  const start = css.indexOf(startPattern);
  if (start === -1) return "";
  const end = endPattern ? css.indexOf(endPattern, start + 1) : css.length;
  return css.slice(start, endPattern ? end : undefined).trim();
}

const home = fs.readFileSync(HOME, "utf8");

const SHARED_BTN_LINK = sliceCss(home, ".motto-btn-link {", "/* Marquee");
const SHARED_EYEBROW = sliceCss(home, ".motto-eyebrow {", ".motto-body {");
const SHARED_BODY = sliceCss(home, ".motto-body {", "/* Line reveal");
const SHARED_CONTAINER = fs.readFileSync(
  path.join(ROOT, "styles/components/motto-layout.module.css"),
  "utf8",
);

const mappings = [
  {
    file: "MottoReveal.module.css",
    css:
      sliceCss(home, "/* Line reveal", "/* Loader") +
      "\n" +
      SHARED_EYEBROW +
      "\n" +
      SHARED_BODY,
  },
  { file: "MottoLoader.module.css", css: sliceCss(home, "/* Loader", ".motto-btn-link") },
  { file: "MottoMarquee.module.css", css: sliceCss(home, "/* Marquee", "/* Big idea") },
  {
    file: "MottoLogo.module.css",
    css: sliceCss(home, ".motto-hero-wordmark", "/* Marquee"),
  },
  {
    file: "MottoBigIdea.module.css",
    css:
      sliceCss(home, "/* Big idea", "/* Trusted") +
      "\n" +
      SHARED_EYEBROW +
      "\n" +
      SHARED_BODY +
      "\n" +
      SHARED_BTN_LINK,
  },
  {
    file: "MottoTrusted.module.css",
    css: sliceCss(home, "/* Trusted", "/* Work"),
  },
  {
    file: "MottoWork.module.css",
    css: sliceCss(home, "/* Work", "/* Insights") + "\n" + SHARED_BTN_LINK,
  },
  {
    file: "MottoBetweenBanner.module.css",
    css: sliceCss(home, "/* Full-bleed banner", "/* Banner (trong"),
  },
  {
    file: "MottoInsights.module.css",
    css: sliceCss(home, "/* Insights", "/* Testimonials"),
  },
  {
    file: "MottoTestimonials.module.css",
    css: sliceCss(home, "/* Testimonials", "/* Method"),
  },
  {
    file: "MottoMethod.module.css",
    css:
      sliceCss(home, "/* Method", "/* About") +
      "\n" +
      SHARED_BODY +
      "\n" +
      SHARED_BTN_LINK,
  },
  {
    file: "MottoAbout.module.css",
    css:
      sliceCss(home, "/* About", ".motto-footer-top") +
      "\n" +
      SHARED_BODY +
      "\n" +
      SHARED_BTN_LINK,
  },
  {
    file: "MottoFooter.module.css",
    css:
      sliceCss(home, ".motto-footer-top", "/* Reduced motion") +
      "\n" +
      SHARED_CONTAINER.replace(/\.app[\s\S]*?site-footer[\s\S]*?\}\n\n/, "") +
      fs.readFileSync(path.join(ROOT, "styles/components/motto-buttons.module.css"), "utf8"),
  },
];

fs.mkdirSync(OUT, { recursive: true });

for (const { file, css } of mappings) {
  const transformed = transformSelectors(css);
  fs.writeFileSync(path.join(OUT, file), transformed.trim() + "\n", "utf8");
  console.log("Wrote", file);
}

// Tokens only
const tokens = sliceCss(home, "/* Motto layout", "/* Typography") + "\n" + sliceCss(home, ".motto-page body", "/* Typography");
fs.writeFileSync(path.join(ROOT, "styles/motto/tokens.css"), tokens.trim() + "\n");

console.log("Done");
