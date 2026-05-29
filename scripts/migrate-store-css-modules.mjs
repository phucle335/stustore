/**
 * Migrate store global CSS + className strings to CSS modules.
 * Run: node scripts/migrate-store-css-modules.mjs
 */
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

function extractClassesFromCss(css) {
  const set = new Set();
  for (const m of css.matchAll(/\.([a-zA-Z][\w-]*)/g)) {
    set.add(m[1]);
  }
  return [...set];
}

function transformCss(css) {
  return css.replace(/\.([a-zA-Z][\w-]*)/g, (full, name) => `.${toCamel(name)}`);
}

function buildClassMap(css) {
  const map = {};
  for (const cls of extractClassesFromCss(css)) {
    map[cls] = toCamel(cls);
  }
  return map;
}

function classNameExpr(value, classMap) {
  const parts = value.split(/\s+/).filter(Boolean);
  const bits = parts.map((p) => {
    if (classMap[p]) return `styles.${classMap[p]}`;
    return JSON.stringify(p);
  });
  if (bits.length === 1) return bits[0];
  return `[${bits.join(", ")}].filter(Boolean).join(" ")`;
}

function transformTsx(content, classMap, moduleImportPath, removeImports = []) {
  let out = content;

  for (const pat of removeImports) {
    out = out.replace(pat, "");
  }

  if (!out.includes(`from "${moduleImportPath}"`)) {
    const importLines = [...out.matchAll(/^import .+;\r?\n/gm)];
    const insertPos = importLines.length
      ? importLines[importLines.length - 1].index +
        importLines[importLines.length - 1][0].length
      : 0;
    out =
      out.slice(0, insertPos) +
      `import styles from "${moduleImportPath}";\n` +
      out.slice(insertPos);
  }

  out = out.replace(/className="([^"]+)"/g, (_, v) => {
    return `className={${classNameExpr(v, classMap)}}`;
  });

  out = out.replace(
    /className=\{([^}?]+)\?\s*"([^"]+)"\s*:\s*undefined\}/g,
    (_, cond, cls) => {
      if (classMap[cls]) {
        return `className={${cond.trim()} ? styles.${classMap[cls]} : undefined}`;
      }
      return `className={${cond.trim()} ? "${cls}" : undefined}`;
    },
  );

  out = out.replace(
    /className=\{`([^`]+)`\}/g,
    (_, v) => `className={${classNameExpr(v, classMap)}}`,
  );

  return out;
}

/** @type {{ css: string, module: string, tsx: string[], extraRemove?: RegExp[] }[]} */
const BUNDLES = [
  {
    css: "styles/components/store-header.css",
    module: "styles/components/store/Header.module.css",
    tsx: [
      "components/store/Header.tsx",
      "components/store/HeaderSearch.tsx",
      "components/store/CommitmentBar.tsx",
    ],
  },
  {
    css: "styles/components/store-cart.css",
    module: "styles/components/store/CartModal.module.css",
    tsx: ["components/store/CartModal.tsx"],
  },
  {
    css: "styles/components/store-login-modal.css",
    module: "styles/components/store/LoginModal.module.css",
    tsx: ["components/store/LoginModal.tsx"],
  },
  {
    css: "styles/components/store-featured.css",
    module: "styles/components/store/FeaturedSection.module.css",
    tsx: ["components/store/FeaturedSection.tsx"],
  },
  {
    css: "styles/components/store-products.css",
    module: "styles/components/store/ProductCatalog.module.css",
    tsx: [
      "components/store/ProductCard.tsx",
      "components/store/ProductGrid.tsx",
      "components/store/BrandFilterBar.tsx",
      "components/store/FavoriteButton.tsx",
      "components/store/ProductImage.tsx",
    ],
  },
  {
    css: "styles/components/store-product-detail.css",
    module: "styles/components/store/ProductDetail.module.css",
    tsx: [
      "components/store/ProductDetail.tsx",
      "components/store/ProductImageGallery.tsx",
      "components/store/ProductVariantPicker.tsx",
      "components/store/ProductDescriptionTabs.tsx",
      "components/store/ProductPurchaseBlock.tsx",
      "components/store/ProductPurchasePolicies.tsx",
      "components/store/AddToCartButton.tsx",
      "components/store/ProductRelatedByBrand.tsx",
    ],
  },
  {
    css: "styles/components/store-toast.css",
    module: "styles/components/store/ToastProvider.module.css",
    tsx: ["components/store/ToastProvider.tsx"],
  },
  {
    css: "styles/components/store-hero.css",
    module: "styles/components/store/Hero.module.css",
    tsx: ["components/store/Hero.tsx"],
  },
  {
    css: "styles/components/store-blog.css",
    module: "styles/components/store/Blog.module.css",
    tsx: ["components/blog/BlogList.tsx", "components/home/HomeBlog.tsx"],
  },
  {
    css: "styles/components/store-home-legacy.css",
    module: "styles/components/home/HomeLegacy.module.css",
    tsx: [
      "components/home/HomeHero.tsx",
      "components/home/HomeHeroCarousel.tsx",
      "components/home/HomeRotatingWord.tsx",
      "components/home/HomeFeatured.tsx",
      "components/home/HomeBrandStrip.tsx",
      "components/home/HomeBrandMarquee.tsx",
      "components/home/HomeBrandShowcase.tsx",
      "components/home/HomeCategoryGallery.tsx",
    ],
  },
  {
    css: "styles/components/store-static.css",
    module: "styles/components/store/StoreStatic.module.css",
    tsx: [
      "components/terms/TermsContent.tsx",
      "components/support/SupportFaq.tsx",
    ],
  },
  {
    css: "styles/components/customer.css",
    module: "styles/components/store/Customer.module.css",
    tsx: [
      "components/store/CustomerPageWrap.tsx",
      "components/store/CheckoutView.tsx",
      "components/auth/CustomerAuthForm.tsx",
      "components/auth/ForbiddenMessage.tsx",
      "components/account/MemberAccountPage.tsx",
    ],
  },
];

const importFromModule = (modulePath) =>
  `@/${modulePath.replace(/\\/g, "/").replace(/\.module\.css$/, ".module.css")}`;

for (const bundle of BUNDLES) {
  const cssPath = path.join(ROOT, bundle.css);
  if (!fs.existsSync(cssPath)) {
    console.warn("Skip missing:", bundle.css);
    continue;
  }

  const rawCss = fs.readFileSync(cssPath, "utf8");
  const classMap = buildClassMap(rawCss);
  const moduleCss = transformCss(rawCss);
  const modulePath = path.join(ROOT, bundle.module);
  fs.mkdirSync(path.dirname(modulePath), { recursive: true });
  fs.writeFileSync(modulePath, moduleCss);

  const moduleImport = importFromModule(bundle.module);
  const removePat = [
    new RegExp(
      `import\\s+["']@/styles/components/${path.basename(bundle.css).replace(".", "\\.")}["'];\\n?`,
      "g",
    ),
    /import\s+["']@\/styles\/components\/store-products\.css["'];\n?/g,
    /import\s+["']@\/styles\/components\/store-featured\.css["'];\n?/g,
    /import\s+["']@\/styles\/components\/customer\.css["'];\n?/g,
    /import\s+["']@\/styles\/components\/store-static\.css["'];\n?/g,
    /import\s+["']@\/styles\/components\/store-blog\.css["'];\n?/g,
  ];

  for (const rel of bundle.tsx) {
    const tsxPath = path.join(ROOT, rel);
    if (!fs.existsSync(tsxPath)) {
      console.warn("Skip missing tsx:", rel);
      continue;
    }
    const raw = fs.readFileSync(tsxPath, "utf8");
    const updated = transformTsx(raw, classMap, moduleImport, removePat);
    fs.writeFileSync(tsxPath, updated);
    console.log("Updated", rel);
  }

  fs.writeFileSync(
    cssPath,
    `/* Migrated to ${bundle.module} */\n`,
  );
  console.log("Wrote module:", bundle.module);
}

console.log("Done.");
