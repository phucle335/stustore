import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const home = fs.readFileSync(path.join(ROOT, "styles/pages/home.css"), "utf8");
const out = path.join(ROOT, "styles/components/motto");

const tf = (c) =>
  c.replace(/\.motto-([a-z0-9-]+)/g, (_, n) =>
    `.${n.replace(/-([a-z])/g, (_, x) => x.toUpperCase())}`,
  );

const slice = (a, b) => {
  const i = home.indexOf(a);
  const j = b ? home.indexOf(b, i + 1) : home.length;
  return i < 0 ? "" : home.slice(i, j).trim();
};

const btnLink = slice(".motto-btn-link {", "/* Marquee");
const eyebrow = slice(".motto-eyebrow {", ".motto-body {");
const body = slice(".motto-body {", "/* Line reveal");
const sharedTypo = `${eyebrow}\n${body}\n${btnLink}`;

const container = `
.container {
  width: var(--motto-container);
  margin-inline: auto;
  padding-inline: 5.33vw;
}
@media (max-width: 767px) {
  .container { padding-inline: 1.75rem; }
}
@media (max-width: 768px) {
  .container { width: min(100% - 24px, 100%); }
}
`;

const btn = fs.readFileSync(
  path.join(ROOT, "styles/components/motto-buttons.module.css"),
  "utf8",
);

const needsContainer = new Set([
  "MottoBigIdea.module.css",
  "MottoWork.module.css",
  "MottoInsights.module.css",
  "MottoTestimonials.module.css",
  "MottoMethod.module.css",
  "MottoAbout.module.css",
  "MottoFooter.module.css",
]);

const files = {
  "MottoReveal.module.css": `${slice("/* Line reveal", "/* Loader")}\n${sharedTypo}`,
  "MottoLoader.module.css": slice("/* Loader", ".motto-btn-link"),
  "MottoMarquee.module.css": slice("/* Marquee", "/* Big idea"),
  "MottoLogo.module.css": slice(".motto-hero-wordmark", "/* Marquee"),
  "MottoBigIdea.module.css": `${slice("/* Big idea", "/* Trusted")}\n${sharedTypo}`,
  "MottoTrusted.module.css": slice("/* Trusted", "/* Work"),
  "MottoWork.module.css": `${slice("/* Work", "/* Insights")}\n${btnLink}`,
  "MottoBetweenBanner.module.css": slice(
    "/* Full-bleed banner",
    "/* Banner (trong",
  ),
  "MottoInsights.module.css": slice("/* Insights", "/* Testimonials"),
  "MottoTestimonials.module.css": slice("/* Testimonials", "/* Method"),
  "MottoMethod.module.css": `${slice("/* Method", "/* About")}\n${body}\n${btnLink}`,
  "MottoAbout.module.css": `${slice("/* About", ".motto-footer-top")}\n${body}\n${btnLink}`,
  "MottoFooter.module.css": `${slice(".motto-footer-top", "/* Reduced motion")}\n${btn}`,
};

for (const [file, content] of Object.entries(files)) {
  let css = tf(content);
  if (needsContainer.has(file)) {
    css += `\n${container}`;
  }
  fs.writeFileSync(path.join(out, file), `${css.trim()}\n`, "utf8");
  console.log("wrote", file);
}
