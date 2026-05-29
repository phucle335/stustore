# Stusport documentation

Central docs for humans and Cursor agents. All repository `.md` files (except this index entry point at the repo root) live under `docs/`.

## Index

| Document | Description |
|----------|-------------|
| [PROJECT.md](./PROJECT.md) | Project overview, routes, structure, cart, products, getting started |
| [CONTEXT.md](./CONTEXT.md) | Full project context (Supabase, checkout, admin, history) — Vietnamese + English mix |
| [PAYOS-SETUP.md](./PAYOS-SETUP.md) | PayOS + Supabase integration setup |
| [PAYMENT-CHANGES.md](./PAYMENT-CHANGES.md) | Payment / order flow change log |
| [2026/05/29.md](./2026/05/29.md) | Short session log (2026-05-29) |
| [2026/05/29-styling-css-modules.md](./2026/05/29-styling-css-modules.md) | CSS Modules migration (Motto + store + footer) |

## How to use this folder

1. **New to the repo** — read [PROJECT.md](./PROJECT.md), then [CONTEXT.md](./CONTEXT.md) for backend and checkout.
2. **Styling work** — read [2026/05/29-styling-css-modules.md](./2026/05/29-styling-css-modules.md) (`styles.*`, one module per component).
3. **Payments** — [PAYOS-SETUP.md](./PAYOS-SETUP.md) and [PAYMENT-CHANGES.md](./PAYMENT-CHANGES.md).
4. **After a meaningful change** — append to the relevant doc or add `docs/YYYY/MM/DD-<topic>.md`.

## Quick reference (styling)

- **Path alias:** `@/*` → project root (`tsconfig.json`).
- **Component CSS:** `import styles from "@/styles/components/<area>/<Name>.module.css"`.
- **Motto tokens:** `styles/motto/tokens.css` + class `motto-page` on `<html>`.
- **App-wide Tailwind:** `styles/globals.css` in `app/layout.tsx` only.
- **Mobile chrome:** `MobileBottomNav`, `MobileNavDrawer`, `MobileSearchSheet`, `MobileOverlayLogoHeader`, `StoreMobileChrome`, `AccountMenuDrawer` — see [29-styling-css-modules.md § Mobile chrome](./2026/05/29-styling-css-modules.md#mobile-chrome-bottom-nav--overlays). Store @768px, Motto @979px.
- **Product grid (category pages):** `ProductCatalog.module.css` — 1 col (&lt;768px), 2 col (tablet), 4 col (≥1024px).
- **Checkout styles:** `CheckoutView.module.css` + `CustomerPageWrap` / `staticPageDark` — see [§ Checkout dark surface](./2026/05/29-styling-css-modules.md#checkout-dark-surface-customerpagewrap--checkoutview).
