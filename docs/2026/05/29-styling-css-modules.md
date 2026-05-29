# Styling refactor: CSS Modules (2026-05-29)

Status: **done for customer-facing UI** (homepage Motto, store, footer, auth, checkout, account, support, terms). Admin UI still uses `admin.css` + Tailwind utility classes.

This document is the source of truth for agents continuing styling work.

---

## Goals

1. **One CSS module file per React component** (or tight group, e.g. `Header` + `HeaderSearch` sharing `Header.module.css`).
2. Use **`styles.camelCase`** in TSX instead of global strings like `"site-footer"` or `"motto-hero"`.
3. **Colocate styles** under `styles/components/`, not inside `components/`.
4. **Load CSS from components** (and a few page shells) so styles appear on every route that mounts the component (fixes cart/footer missing on `/` when CSS was only imported from category pages).
5. Keep **design tokens** for the Motto homepage on `html.motto-page` via a small global file.

---

## Folder layout

```
styles/
├── globals.css                 # Tailwind only — imported in app/layout.tsx
├── motto/
│   └── tokens.css              # Global vars + body reset when .motto-page on <html>
├── components/
│   ├── brand.css               # StusportLogo variants (still global)
│   ├── store-reset.css         # StoreShell baseline reset
│   ├── store-alignment.css     # Cross-page alignment (no per-component classes)
│   ├── home/
│   │   └── SiteFooter.module.css
│   ├── motto/
│   │   ├── MottoHeader.module.css
│   │   ├── MottoHero.module.css
│   │   └── … (one file per Motto component)
│   └── store/
│       ├── Header.module.css
│       ├── CartModal.module.css
│       ├── ProductDetail.module.css
│       ├── CheckoutView.module.css
│       └── …
└── pages/
    ├── home.css                # Placeholder comment only
    ├── sneakers.css            # Often empty — store CSS via StoreShell / components
    └── …                       # Per-route bundles where still needed
```

**Removed / hollowed global store files** (content moved to modules; files may contain only a migration comment):

- `store-header.css`, `store-cart.css`, `store-login-modal.css`, `store-featured.css`, `store-products.css`, `store-product-detail.css`, `store-toast.css`, `store-blog.css`, `store-hero.css`, `store-home-legacy.css`, `store-static.css`, `customer.css` (logic in `Customer.module.css`)

---

## Conventions

### Import pattern

```tsx
import styles from "@/styles/components/store/Header.module.css";

<header className={styles.header}>
```

### Class names in CSS

- Source BEM/kebab in old global CSS was converted to **camelCase** in modules:  
  `.site-footer-grid` → `.grid` or `.siteFooterGrid` depending on file; prefer **short names** inside the component module (e.g. `.footer`, `.grid` in `SiteFooter.module.css`).
- **State modifiers:** `styles.isOpen`, `styles.isActive`, `styles.navActive` (not `is-open` strings in TSX).
- **Compound states in CSS:** use two classes on the element, e.g.  
  `className={`${styles.cartSidebar} ${isOpen ? styles.open : ""}`}`  
  with rules `.cartSidebar.open { … }` in the module.

### When to use `:global()`

- **Third-party / logo classes** that must stay stable:  
  `styles/motto/tokens.css` uses plain `.motto-page` (global CSS file, not a module).  
  `SiteFooter.module.css`: `.logo :global(.stusport-logo--footer) { … }`  
  `Header.module.css`: `.logo :global(.stusport-logo--mark) { … }`
- **Motto homepage footer tweak:** `MottoHomePage.module.css` passes `className={styles.footerOnMotto}` to `<SiteFooter />` (no `:global(.site-footer)` — footer is modular now).

### What stays global (intentionally)

| Kind | Example | Why |
|------|---------|-----|
| Tailwind | `app/layout.tsx` → `globals.css` | App-wide utility layer |
| Font Awesome | `className="fas fa-shopping-bag"` | External icon font classes |
| Motto tokens | `tokens.css` + `document.documentElement.classList.add("motto-page")` | Shared CSS variables on homepage |
| Brand logo | `styles/components/brand.css` | `StusportLogo` variants |
| Store shell | `store-reset.css`, `store-alignment.css` | Loaded once in `StoreShell` |
| Admin | `styles/pages/admin.css` | Admin dashboard; not migrated to modules |

### Dual-module components

Some components import **two** modules when styles were split by domain:

| Component | Modules |
|-----------|---------|
| `ProductCard` | `ProductCatalog.module.css` + `HomeLegacy.module.css` (`productCardHome` on homepage) |
| `ProductDetail` | `ProductDetail.module.css` + `ProductCatalog.module.css` (`price`, `brand`) |
| `CustomerPageWrap` | `Customer.module.css` + `StoreStatic.module.css` (`staticPageWrap`; `staticPage` or `staticPageDark`) |
| `CheckoutView` | `CheckoutView.module.css` only (form, dark theme, QR modal) |
| `BlogList` | `Blog.module.css` + `HomeLegacy.module.css` (card grid) |
| `HomeFeatured` | `FeaturedSection.module.css` + `HomeLegacy.module.css` |
| `LoginModal` | `LoginModal.module.css` + `Customer.module.css` + `ProductDetail.module.css` |
| `FeaturedSection` | `FeaturedSection.module.css` + `StoreStatic.module.css` (`searchEmpty`) |
| `BrandFilterBar` | `FeaturedSection.module.css` (`brandFilter`) |

Prefer **merging into one module per component** when touching these files next.

---

## Motto homepage (`components/motto/`)

- Entry: `app/page.tsx` → `MottoHomePage`.
- `MottoHomePage` imports:
  - `@/styles/motto/tokens.css`
  - `@/styles/components/motto/MottoHomePage.module.css`
- Sets `motto-page` on `<html>` in `useEffect` for token scope.
- Every Motto component uses `styles` from `@/styles/components/motto/<Name>.module.css`.
- `MottoHeroIntro` shares `MottoHero.module.css`.
- `MottoBrandMarquee` uses `MottoBrandMarquee.module.css`; `MottoTrusted` uses `MottoTrusted.module.css`.
- `SiteFooter` at bottom uses modular footer + `className={styles.footerOnMotto}` from `MottoHomePage`.

**Deleted obsolete modules (do not recreate):**

- `styles/components/motto-layout.module.css`
- `styles/components/motto-header.module.css`
- `styles/components/motto-hero.module.css` (replaced by `styles/components/motto/MottoHero.module.css`)
- `styles/components/motto-buttons.module.css`

---

## Store (`components/store/`, `components/home/`, etc.)

### Loading strategy

- **`StoreShell`** (category pages): imports `store-reset.css`, `store-alignment.css`, renders `Header`, `CommitmentBar`, `StoreMobileChrome` (bottom nav + overlays + `LoginModal`), content/footer in `StoreShell.module.css` wrapper with mobile bottom padding.
- **Root layout** (`CartProvider`, `ToastProvider`): `CartModal` and `ToastProvider` import their own modules so cart/toast work on `/` and all routes.
- **Product pages:** `ProductDetail` imports `ProductDetail.module.css`.

### Module map (store)

| Module | Primary components |
|--------|-------------------|
| `Header.module.css` | `Header`, `HeaderSearch`, `CommitmentBar` |
| `CartModal.module.css` | `CartModal` |
| `LoginModal.module.css` | `LoginModal` |
| `ToastProvider.module.css` | `ToastProvider` |
| `FeaturedSection.module.css` | `FeaturedSection`, `BrandFilterBar` |
| `ProductCatalog.module.css` | `ProductCard`, `ProductGrid`, `ProductImage`, `FavoriteButton` |
| `ProductDetail.module.css` | `ProductDetail`, gallery, variants, tabs, purchase block, policies, related |
| `Hero.module.css` | `Hero` |
| `Blog.module.css` | blog post layout bits, `HomeBrandShowcase` |
| `HomeLegacy.module.css` | `HomeHero`, carousel, featured tabs, category gallery, blog cards, brand strip/marquee |
| `Customer.module.css` | `CustomerPageWrap`, `CustomerAuthForm`, `ForbiddenMessage`, `MemberAccountPage`, shared buttons/inputs |
| `CheckoutView.module.css` | `CheckoutView` — cart lines, payment form, `.checkoutThemeDark` overrides, QR modal |
| `StoreStatic.module.css` | `TermsContent`, `SupportFaq`, `staticPage` / `staticPageDark`, shared static/search empty |
| `LivePresenceBar.module.css` | `LivePresenceBar` |
| `home/SiteFooter.module.css` | `SiteFooter` |
| `MobileBottomNav.module.css` | `MobileBottomNav` |
| `MobileNavDrawer.module.css` | `MobileNavDrawer` |
| `AccountMenuDrawer.module.css` | `AccountMenuDrawer` |
| `MobileSearchSheet.module.css` | `MobileSearchSheet` |
| `MobileOverlayLogoHeader.module.css` | `MobileOverlayLogoHeader` (shared logo row in overlays) |
| `StoreShell.module.css` | `StoreShell` — `shellWithBottomNav` padding on mobile |

---

## Mobile chrome (bottom nav + overlays)

Customer-facing mobile navigation for **Store** (`StoreShell`) and **Motto** (`MottoHeader`). Desktop header unchanged (full nav + `HeaderSearch`).

### Breakpoints

| Surface | Bottom nav visible | Header on mobile |
|---------|-------------------|------------------|
| Store | `max-width: 768px` | Logo only; `.mainNav`, `.headerSearch`, `.headerIcons` hidden in `Header.module.css` |
| Motto | `max-width: 979px` | Desktop nav hidden; top burger removed; `MottoHomePage.module.css` adds bottom padding |

### Bottom bar (`MobileBottomNav`)

Four tabs: **Menu**, **Tìm kiếm**, **Giỏ hàng** (cart badge), **Đăng nhập** / **Tài khoản**.

- Fixed bottom, `z-index: 110`, `#111` background, accent top border.
- Store login opens `LoginModal` via `StoreMobileChrome`; Motto uses link `/dang-nhap`.
- Logged-in **Tài khoản** opens `AccountMenuDrawer` (right slide) from `StoreMobileChrome` / `MottoHeader`; desktop header “Hi, …” still links to `/tai-khoan`.

### Menu drawer (`MobileNavDrawer`)

- Slides from **left** (`translateX(-100%)` → `0`), width `min(88vw, 320px)`.
- Lists category links from `NAV_LINKS` (store drawer) or `MOTTO_NAV` (homepage). **`MOTTO_NAV` is mapped from `NAV_LINKS`** in `lib/motto/content.ts` (includes **Trang chủ**).
- Top: `MobileOverlayLogoHeader` (STUSPORT mark + close), then section title “Danh mục”.
- `z-index` 200 (backdrop) / 201 (panel). Only one overlay open at a time (menu vs search vs account).

### Account menu drawer (`AccountMenuDrawer`)

- Slides from **right** on bottom-nav **Tài khoản** (logged in); width `min(88vw, 320px)`.
- **Dark theme** aligned with `MobileNavDrawer` (`#111`, white links, orange active/hover text).
- Header: `MobileOverlayLogoHeader`, title “Tài khoản”, greeting `Hi, {name}`.
- Options from `lib/account/member-sections.ts` (`MEMBER_ACCOUNT_SECTIONS`); tap → `router.push` `/tai-khoan?section=…` and close drawer.
- `z-index` 200 / 201 (same layer as menu drawer). Desktop header account link unchanged.

### Search sheet (`MobileSearchSheet`)

- Slides from **top** on “Tìm kiếm”.
- Top: `MobileOverlayLogoHeader`, then search form (input + magnifying glass submit).
- Submit → `lib/store/search-navigation.ts` → `/search?q=…` (same as `HeaderSearch`).
- `z-index` 201 / 202.

### Cart (`CartModal`)

- Right drawer; **dark theme** aligned with menu (`#111`, white text, `#2a2a2a` borders).
- Top: `MobileOverlayLogoHeader`, then “Giỏ hàng (n)” heading.
- `z-index` 1000 (above mobile overlays).

### Shared logo header (`MobileOverlayLogoHeader`)

- Reuses header logo sizing: `:global(.stusport-logo--mark)` at 22px (see `Header.module.css` `.logo`).
- Safe-area top padding; close button matches drawer style.

### State owners

| Component | Owns |
|-----------|------|
| `StoreMobileChrome` | `menuOpen`, `searchOpen`, `accountMenuOpen`, `loginOpen`; mounts category drawer, account drawer, search sheet, bottom nav, `LoginModal` |
| `MottoHeader` | `menuOpen`, `searchOpen`, `accountMenuOpen`; mounts category drawer, account drawer, search sheet, bottom nav |

### Search logic

- `lib/store/search.ts` — `searchProducts()` matches name, id, brand, and **category** (slug, nav labels, `CATEGORY_BACK`, Vietnamese/English aliases via `getProductSearchHaystack()`).
- `lib/store/search-navigation.ts` — `submitStoreSearch()` / `buildSearchUrl()` shared by `HeaderSearch` and `MobileSearchSheet`.

### Product grid (`ProductCatalog.module.css`)

Used by `ProductGrid` on all category pages (`FeaturedSection` → sneakers, clothing, …).

| Viewport | Breakpoint | Columns |
|----------|------------|---------|
| Mobile | `< 768px` | **1** (`minmax(0, 1fr)`) |
| Tablet | `768px` – `1023px` | **2** |
| Desktop | `≥ 1024px` | **4** |

Mobile-first rules live in `styles/components/store/ProductCatalog.module.css` (`.productGrid`).

### Checkout dark surface (`CustomerPageWrap` + `CheckoutView`)

- `/checkout` uses `CustomerPageWrap` with `theme="dark"` and `narrow`.
- **Do not** put `staticPage` (white) and dark checkout on the same node: `staticPage` can win in the bundle and cause **white text on white** (e.g. `.checkoutItemName` invisible).
- **Fix:** `CustomerPageWrap` uses `StoreStatic.staticPageDark` when `theme="dark"` (not `staticPage`), plus `Customer.customerPageSurfaceDark` on the same element.
- Checkout UI classes live in **`CheckoutView.module.css`**. Wrapper `checkoutThemeDark` scopes dark overrides (`.checkoutThemeDark .checkoutItemName`, inputs, buttons) — **parent and child selectors must be in the same CSS module file**.
- Shared auth/member buttons remain in `Customer.module.css` (`checkoutPrimaryBtn`, etc.) for login/account; checkout page imports its own module.

### Z-index stack (reference)

| Layer | z-index |
|-------|---------|
| Header sticky | 100 |
| Bottom nav | 110 |
| Menu drawer | 200 / 201 |
| Search sheet | 201 / 202 |
| Cart sidebar | 1000 |
| Toast | 1100 (bottom-right offset above nav @ ≤979px in `ToastProvider.module.css`) |

---

## Path alias

`tsconfig.json`:

```json
"baseUrl": ".",
"paths": { "@/*": ["./*"] }
```

Use: `import styles from "@/styles/components/store/Header.module.css"`.

---

## Migration scripts (optional reference)

Located in `scripts/`. Used during bulk migration; **not required** for day-to-day dev.

| Script | Purpose |
|--------|---------|
| `migrate-store-css-modules.mjs` | Global `store-*.css` → modules + TSX `className` rewrites |
| `fix-broken-classnames.mjs` | Repair Font Awesome / template literals broken by automation |
| `fix-classname-arrays.mjs` | Fix `className={[…].join()}` mistakes |
| `fix-kebab-classnames.mjs` | Map leftover `className={"kebab-case"}` to `styles.*` |
| `gen-motto-modules.mjs` / `build-motto-modules.mjs` / `consolidate-motto-styles.mjs` | Motto slice/generation from legacy `home.css` |

If you re-run automation scripts, **commit TSX + CSS together** and run `npm run build`.

---

## Adding a new component (checklist)

1. Create `styles/components/<area>/MyComponent.module.css` with **camelCase** class names.
2. In `MyComponent.tsx`:  
   `import styles from "@/styles/components/<area>/MyComponent.module.css"`  
   Use `className={styles.myClass}` everywhere (except FA icons / Tailwind if deliberate).
3. **Do not** add styles only to `styles/pages/*.css` unless the route has no owning component.
4. For nested third-party classes (logo), use `:global(.their-class)` inside the module.
5. Run `npm run build` and smoke-test the route that mounts the component.

---

## Known limitations / follow-ups

- [ ] **Admin UI** — still `admin-*` classes + `styles/pages/admin.css`; not converted to CSS modules.
- [ ] **Consolidate dual-module imports** — reduce split imports listed above.
- [ ] **`productCardMedia`** — defined mainly under `HomeLegacy` for homepage cards; catalog cards use structure without a dedicated `.productCardMedia` in `ProductCatalog.module.css`.
- [ ] **Page CSS files** — many `styles/pages/*.css` are placeholders; confirm before re-adding `@import` chains.
- [ ] **GSAP selectors** — Motto/store animations should use `` `.${styles.className}` `` or `querySelector` on refs, not hardcoded global strings.
- [ ] **Orphan rules in `Customer.module.css`** — some `@media` blocks still reference `.checkout*` class names that only exist in `CheckoutView.module.css` (harmless dead CSS; clean up when touching `Customer.module.css`).

---

## Verification

```bash
npm run build
```

Dev server: restart after large CSS changes so Turbopack drops stale global bundles.

---

## Changelog (2026-05-29)

- Migrated all Motto components to `styles/components/motto/*.module.css`.
- Moved Motto tokens to `styles/motto/tokens.css` (plain global selectors, no `:global()` wrapper).
- Migrated store customer UI to `styles/components/store/*.module.css` and `styles/components/home/`.
- Migrated `SiteFooter` and `LivePresenceBar` to CSS modules.
- Removed legacy `store-site-footer.css` and hollowed migrated `store-*.css` stubs.
- Updated `MottoHomePage` to pass `footerOnMotto` class to `SiteFooter` instead of targeting `.site-footer` globally.
- Trimmed `store-alignment.css` rules that targeted old global footer/header class names.
- Added `docs/` with this file for cross-session context.
- Moved all repository markdown (`README` → `docs/PROJECT.md`, `CONTEXT.md`, `PAYOS-SETUP.md`, `PAYMENT-CHANGES.md`) into `docs/`; root `README.md` links here.

## Changelog (2026-05-29, mobile chrome)

- Added `MobileBottomNav`, `MobileNavDrawer` (left slide, category labels), `MobileSearchSheet` (top slide, search form), `MobileOverlayLogoHeader`, `StoreMobileChrome`, `StoreShell.module.css` under `styles/components/store/`.
- Store mobile (≤768px): slim header (logo only), bottom nav, drawer + search sheet via `StoreShell`; `LoginModal` moved into `StoreMobileChrome`.
- Motto mobile (≤979px): bottom nav + shared drawer/search; removed top burger and right `mobileNav` panel.
- Extended `lib/store/search.ts` to match product category labels and aliases; shared submit via `lib/store/search-navigation.ts`.
- `CartModal` restyled to dark theme (#111) to match menu drawer; logo header row at top of cart panel.
- All three overlays (menu, search, cart) use `MobileOverlayLogoHeader` at the top (STUSPORT mark + close).

## Changelog (2026-05-29, account menu drawer)

- Added `lib/account/member-sections.ts` (`MemberSectionId`, `MEMBER_ACCOUNT_SECTIONS`, `buildMemberAccountUrl`, `parseMemberSectionId`).
- Added `AccountMenuDrawer` + `AccountMenuDrawer.module.css`; wired in `StoreMobileChrome` and `MottoHeader` (`accountMenuOpen`, bottom nav `onClick` instead of `href`).
- `MemberAccountPage` reads/writes `?section=` via `useSearchParams` + `router.replace` on in-page nav.

## Changelog (2026-05-29, checkout + grid + nav)

- **`CheckoutView.module.css`:** checkout form, `.checkoutThemeDark` overrides, payment QR modal (moved off Tailwind / split `Customer.module.css` checkout block).
- **`StoreStatic.staticPageDark`:** dark card surface for `CustomerPageWrap theme="dark"` (checkout, account) — avoids `staticPage` white background overriding dark text.
- **`ProductCatalog.module.css`:** responsive `.productGrid` — 1 col (mobile), 2 (tablet `@768px`), 4 (desktop `@1024px`).
- **`MOTTO_NAV`:** derived from `NAV_LINKS` so mobile/desktop Motto menu includes **Trang chủ**.
- Checkout API: `lib/store/product-id.ts` — skip DB `bigint` lookup for slug cart ids (e.g. legacy mock `sun-3`); use cart `fulfillment_type` when id is not queryable.
