# Stusport — Ecommerce Store

Next.js storefront inspired by minhshop-style layout: homepage, category pages, product detail, cart sidebar, and stock validation.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| UI | React 19, CSS (`app/stusport.css`) |
| Language | TypeScript 5 |
| Images | `next/image` + Unsplash (`images.unsplash.com`) |
| Icons | Font Awesome 6 (CDN) |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build (250 product pages SSG)
npm run start   # run production server
npm run lint    # ESLint
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Homepage (hero, featured tabs, category gallery, blog, footer) |
| `/sneakers` | Giày Sneaker — 16 products/page |
| `/sunglasses` | Sunglasses — 16 products/page |
| `/sandals` | Dép — 16 products/page |
| `/clothing` | Quần Áo — 16 products/page |
| `/bags` | Túi Xách — 16 products/page |
| `/products/[id]` | Product detail (e.g. `/products/sneaker-1`) |

## Project structure

```
app/
  page.tsx                 # Homepage
  sneakers|sunglasses|...  # Category listing pages
  products/[id]/           # Product detail + not-found
  layout.tsx               # Root layout (ToastProvider, CartProvider)
  stusport.css             # Main store styles

components/
  home/                    # Homepage sections
  store/                   # Header, cart, product grid, modals

lib/store/
  types.ts                 # Product, NavId types
  generate-products.ts     # Product generator (50 per category)
  products.ts              # Exported product arrays
  catalog.ts               # Lookup by id, category back links
  navigation.ts            # Header nav links
  cart.ts                  # Cart types, VND helpers, localStorage
  home-content.ts          # Homepage static content (blog, categories)
```

## Product data

- **250 products** total: 50 per category (`sneaker-1` … `bag-50`).
- Generated in `lib/store/generate-products.ts` via `buildProducts()` — not hand-edited per SKU.
- Exported from `lib/store/products.ts` as `SNEAKER_PRODUCTS`, `SUNGLASSES_PRODUCTS`, etc.

### Stock (`stock`)

Defined in **`lib/store/generate-products.ts`** → `resolveStock(index)`:

| Rule | Stock |
|------|-------|
| Product number `% 17 === 0` | `0` (out of stock) |
| Product number `% 11 === 0` | `2` (low stock) |
| Otherwise | `8 + (index % 15) + (index % 7)` |

Read at runtime via `getProductStock(productId)` in `lib/store/catalog.ts`.

To set manual stock per product, add `stock` to each seed in `ProductSeed` or replace `resolveStock()` with fixed values / external data.

### Prices

Vietnamese format: `2,550,000đ`. Optional `oldPrice` for sale display (~every 3rd product).

## Features

### Pagination (`ProductGrid`)

| Context | `pageSize` |
|---------|------------|
| Homepage featured tabs | **8** |
| Category pages | **16** (default) |

Scroll-into-view runs only when using pagination controls, not when switching homepage tabs.

### Shopping cart

- **CartProvider** — global state + `localStorage` key `stusport-cart`
- **CartModal** — right sidebar drawer
- Stock checks on add / quantity increase; toast on error

### Toast notifications

- **ToastProvider** — top-center
- Success: *Đã thêm vào giỏ hàng thành công*
- Error: out of stock / exceeds available stock

### Homepage sections

1. `HomeHero` — banner + brand bar  
2. `HomeBrandStrip` — large “UEF” typography  
3. `HomeFeatured` — tabbed product grid (8/page)  
4. `HomeCategoryGallery` — category image tiles  
5. `HomeBlog` — 3 article cards  
6. `HomeBrandShowcase` — store image + UEF overlay  
7. `SiteFooter` — links & contact  

## Configuration

### Remote images

`next.config.ts`:

```ts
images: {
  remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
}
```

### Navigation

Edit `lib/store/navigation.ts` (`NAV_LINKS`) and category back links in `lib/store/catalog.ts` (`CATEGORY_BACK`).

### Homepage content

Edit `lib/store/home-content.ts` (category tiles, blog posts, brand logos).

## Component providers

Root layout wraps the app:

```tsx
<ToastProvider>
  <CartProvider>{children}</CartProvider>
</ToastProvider>
```

Category and product pages use `StoreShell` for header + login modal.

## License

Private project (`"private": true` in `package.json`).
