# Stusport E-commerce — Project Context (v2, 2026-05-27)

> File tóm tắt **ngắn gọn** để khởi động chat/context mới.  
> Nếu cần chi tiết kiến trúc cũ có thể đọc tiếp phần bên dưới (v1).

---

## A. Trạng thái hiện tại (ngắn gọn)

- **Framework:** Next.js 16 (App Router) + React 19  
- **Deploy chính thức:** Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` đã được set trên Vercel).  
- **Backend:** Supabase (Auth + Postgres + Storage).
- **Thư mục chính:** toàn bộ app nằm trong `ecommerce_store-main/`.

### A.1. Các phần đã build xong cho Stustore

- **Quản lý size / tồn kho theo category**
  - File luật: `lib/store/product-category-rules.ts`
  - `watches`, `sunglasses` **không có size** → chỉ nhập quantity.
  - Admin `ProductManager` + trang chi tiết SP đã dùng logic này.

- **Checkout flow mới**
  - API: `app/api/store/checkout/route.ts`
  - Kiểu/tính toán: `lib/store/checkout.ts`
  - Bổ sung cột cho bảng `orders`: script chính nằm ở  
    `supabase/repair-orders-table.sql` (gọi từ `checkout-order-fields.sql`).
  - Hỗ trợ:
    - COD
    - Chuyển khoản
    - Đơn pre-order cọc 50% (bank transfer)
  - Lưu `shipping_full_name`, `shipping_phone`, `shipping_address`, `order_items`.
  - Giao diện checkout: `components/store/CheckoutView.tsx` + `styles/components/store/CheckoutView.module.css`; trang bọc `CustomerPageWrap` (`theme="dark"`, `staticPageDark`).
  - Slug id giỏ (mock cũ, ví dụ `sun-3`): `lib/store/product-id.ts` — API checkout không query `products.id` bigint khi id không hợp lệ.

- **Member account / lịch sử mua hàng**
  - Trang: `app/tai-khoan/page.tsx` → `components/account/MemberAccountPage.tsx`
  - Hiển thị:
    - Mã đơn rút gọn (slice id)
    - Danh sách sản phẩm trong từng đơn (`order_items`), tối đa 5 item + “+N sản phẩm khác”.

- **Mô tả sản phẩm động + dark theme**
  - `components/store/ProductDescriptionTabs.tsx` đọc `product.description` từ DB, render theo đoạn (split `\n\n`).
  - Bỏ bảng thông số, tối ưu màu nền + accent cam trong `app/stusport.css`.

- **Hình ảnh sản phẩm / next/image**
  - File host whitelist: `lib/store/allowed-image-hosts.ts`
  - Wrapper: `components/store/ProductImage.tsx`
    - Nếu host đã config → dùng `next/image`
    - Nếu host lạ → fallback `<img>` để tránh crash.
  - Toàn bộ card/gallery/cart đã dùng `ProductImage`.

### A.2. Homepage Motto / Hero / Banner

- Trang chủ dùng: `app/page.tsx` → `MottoHomePage`.
- Menu Motto / drawer mobile: `MOTTO_NAV` = map từ `NAV_LINKS` (`lib/motto/content.ts`) — có **Trang chủ** (`/`).
- Hero:
  - `components/motto/MottoHero.tsx` + `MottoHeroIntro.tsx`
  - Rotating words: `DOMINATION / AMBITION / LIFE STYLE / SIGNATURE`… từ `HERO_ROTATING_WORDS` (nay đọc qua CMS, xem A.3).
  - Hình hero lấy từ `MOTTO_HERO_SLIDES` (hoặc override qua CMS).
- Marquee cam kết:
  - `components/motto/MottoMarquee.tsx` + dữ liệu trong `MOTTO_MARQUEE_ITEMS`.
  - Chỉ 3 dòng: “Hàng chính hãng”, “Miễn phí giao hàng”, “Đổi trả đến 14 ngày”.
- Banner full-bleed giữa “TRENDING now” và “Gợi ý phối đồ…”:
  - Component: `components/motto/MottoBetweenBanner.tsx`
  - CSS: `.motto-between-banner*` trong `app/motto.css` (100vw, `object-fit: cover`).

### A.3. Site Content CMS (Phase 1)

- Bảng cấu hình: `public.site_settings`
  - Tạo bằng: `supabase/site-content.sql`
  - RLS:
    - Ai cũng đọc (`select`)
    - Chỉ admin được insert/update/delete (dùng `public.is_admin()`).
- Kiểu dữ liệu: `lib/site-content/site-content.ts`
  - `SiteContent.motto` gồm:
    - `mottoHeroSlides` (5 slide)
    - `homeRotatingWords`
    - `mottoMarqueeItems`
    - `mottoInsights`:
      - `introText`
      - `cards` (title + href)
      - `banner` (enabled + imageUrl + title + href)
  - Hàm:
    - `getDefaultSiteContent()`: build từ `lib/motto/content.ts` + `lib/store/home-content.ts`
    - `mergeSiteContent(partial)`: merge giá trị từ DB với default.
- API đọc public:
  - `GET /api/site-content` → dùng `createStoreSupabaseClient()` (anon).
- Hook client:
  - `lib/site-content/useSiteContent.ts` → fetch `/api/site-content`, có cache in-memory, fallback default.
- Admin viết:
  - API: `PATCH /api/admin/site-content`  
    (file `app/api/admin/site-content/route.ts` dùng service role + `withAdminApi`).
  - UI: tab “Nội dung site” trong `/admin`:
    - `components/admin/SiteContentManager.tsx`
    - Cho phép:
      - Sửa hero slides (URL + alt + upload Storage)
      - Sửa rotating words
      - Sửa 3 dòng marquee
      - Sửa MottoInsights intro, card list
      - Bật/tắt banner + config banner (image/title/href)
- Trang Motto lấy nội dung:
  - `MottoHomePage.tsx` dùng `useSiteContent()`:
    - `<MottoHero slides={motto.mottoHeroSlides} rotatingWords={motto.homeRotatingWords} />`
    - `<MottoMarquee items={motto.mottoMarqueeItems} />`
    - `<MottoBetweenBanner banner={motto.mottoInsights.banner} />`
    - `<MottoInsights introText={motto.mottoInsights.introText} cards={motto.mottoInsights.cards} />`

### A.4. Product sale price (Phase 2)

- DB:
  - Cột `sale_percent` cho `public.products`:
    - Script: `supabase/add-sale-percent-products.sql`  
      và tích hợp vào `supabase/repair-products-columns.sql`.
    - Ràng buộc check 0–50%.
- Types:
  - `lib/supabase/types.ts`:
    - `DbProduct` thêm `sale_percent?: number | null;`
    - `CreateProductInput` thêm `sale_percent?: number | null;`
- Data layer / Admin:
  - `lib/store/product-query.ts` thêm `sale_percent` vào SELECT.
  - `lib/admin/data/products.ts`:
    - `mapProduct` đọc `sale_percent` (mặc định 0).
    - `buildDbRow` ghi `sale_percent` khi update.
    - `createProduct` insert `sale_percent`.
  - Admin UI: `components/admin/ProductManager.tsx`:
    - Form có:
      - “Giá gốc (VND)” → `price`
      - “% sale (0–50)” → chuỗi `sale_percent` (validate, clamp).
- Storefront:
  - `lib/store/map-product.ts`:
    - `basePrice = row.price`
    - `salePercent = clamp(row.sale_percent, 0..50)`
    - Nếu `salePercent > 0`:
      - `salePrice = basePrice * (1 - salePercent / 100)`
      - `price = formatPriceVnd(salePrice)`
      - `oldPrice = formatPriceVnd(basePrice)`
    - Ngược lại: chỉ set `price` từ basePrice, `oldPrice` undefined.
  - UI:
    - `components/store/ProductCard.tsx`:
      - Nếu `showSaleBadge && product.oldPrice` → hiện “Sale” + gạch giá cũ.
    - `components/store/ProductDetail.tsx`:
      - Box giá hiển thị `price` + `oldPrice` nếu có.

### A.5. Blog CMS (Phase 3 – cơ bản)

- Static seed: `lib/store/blog-content.ts` (6 bài viết, đã có `body` đầy đủ).
- Bảng Supabase:
  - `public.blog_posts` → tạo bằng `supabase/blog-posts.sql`.
  - Cột: `id`, `title`, `excerpt`, `image`, `date`, `body`, `updated_at`.
  - RLS:
    - Public đọc (`select`)
    - Admin ghi (insert/update/delete).
- Server helpers:
  - `lib/blog/blog-cms.ts`:
    - `getBlogPostsMerged()` → lấy từ DB; nếu thiếu id nào thì fallback BLOG_POSTS.
    - `getBlogPostByIdMerged(id)` → lấy một bài, fallback static nếu DB chưa override.
- API public:
  - `GET /api/blog-posts`
  - `GET /api/blog-posts/[id]`
- API admin:
  - `PUT /api/admin/blog-posts/[id]`  
    body: `{ title, excerpt, image, date?, body }`
- Frontend:
  - `/blog`:
    - `app/blog/page.tsx` dùng `BlogList` (server component).
    - `components/blog/BlogList.tsx`:
      - Gọi `getBlogPostsMerged()` + hiển thị bằng `ProductImage`.
  - `/blog/[id]`:
    - Dùng `getBlogPostByIdMerged()` cho `generateMetadata` + nội dung bài.
    - Ảnh hero cũng dùng `ProductImage`.
- Admin CMS Blog:
  - Tab “CMS Blog” trong `/admin`:
    - `components/admin/BlogPostManager.tsx`
    - Fetch `/api/blog-posts`, cho phép chọn 1 bài → sửa title, excerpt, image, date, body
    - Lưu qua `PUT /api/admin/blog-posts/[id]`.

### A.6. Deploy & Env

- **Build local:** `npm run build`
- **Env local:** `.env.local`
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://uicortnidhfnscuavelq.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
  SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
  ```
- **Vercel:**
  - Cần set cùng 3 biến env trên (Production + Preview).
  - Đã có route debug: `/api/debug-env` (kiểm tra nhanh env + khả năng đọc `products`).

---

# (v1 cũ) — Context chi tiết ban đầu

> Tài liệu tổng hợp để chuyển sang context/chat mới.  
> **Thư mục app:** `ecommerce_store-main/`  
> **Framework:** Next.js 16 (App Router) + React 19 + Tailwind CSS 4

---

## 1. Tổng quan

- **Storefront:** Trang bán giày / phụ kiện thể thao (Stusport), homepage kiểu agency (`MottoHomePage`), catalog tĩnh trong `lib/store/*`.
- **Backend:** Supabase (Auth + PostgreSQL).
- **Admin:** Dashboard tại `/admin` — thống kê, biểu đồ doanh thu, quản lý sản phẩm / đơn hàng / khách hàng & role.

---

## 2. Biến môi trường (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # CHỈ server, không public
```

Mẫu: `.env.example`

Sau khi sửa `.env.local` → restart `npm run dev`.

---

## 3. Supabase — Database

### 3.1 Bảng chính

| Bảng | Mô tả |
|------|--------|
| `public.users` | Profile gắn `auth.users(id)`. Cột: `id`, `email`, `role` (`user` \| `admin`), timestamps |
| `public.products` | `name`, `brand_tag`, `price`, `description`, `images` (text[]), `sizes` (jsonb) |
| `public.orders` | `user_id`, `total_price`, `status` (enum), timestamps |

### 3.2 Enum

- `user_role`: `user`, `admin`
- `order_status`: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`

### 3.3 Cột `sizes` (jsonb)

```json
[
  { "size": "40", "quantity": 12 },
  { "size": "41", "quantity": 8 }
]
```

### 3.4 SQL — thứ tự chạy trong Supabase SQL Editor

1. **`supabase/admin-schema.sql`** — Tạo bảng, enum, RLS, trigger cơ bản, policies.
2. **`supabase/auth-user-trigger.sql`** — Cập nhật trigger đăng ký Auth → `public.users` + backfill user cũ.

### 3.5 Trigger Auth → `public.users`

- **Function:** `public.handle_new_auth_user()`
- **Trigger:** `on_auth_user_created` — `AFTER INSERT` trên `auth.users`
- **Logic role:**
  - `workspaceplace22@gmail.com` → `role = 'admin'`
  - Email khác → `role = 'user'`
- File SQL có **backfill** user Auth đã tồn tại + `UPDATE` đảm bảo email admin luôn là `admin`.

### 3.6 RLS (tóm tắt)

- `products`: ai cũng đọc; chỉ admin ghi (qua `public.is_admin()`).
- `orders`: user đọc đơn của mình; admin đọc/ghi tất cả.
- `users`: user đọc profile mình; admin đọc/cập nhật/xóa tất cả.

**Lưu ý:** Server Actions / API admin dùng **service role** (bypass RLS) nhưng vẫn có **middleware + `guardAdmin()`** phía app.

---

## 4. Supabase clients (Next.js)

| File | Mục đích |
|------|----------|
| `lib/supabase/client.ts` | Browser — `getSupabaseClient()` (lazy singleton) |
| `lib/supabase/auth-server.ts` | Server — session cookie (`@supabase/ssr`) |
| `lib/supabase/server.ts` | Server — **service role** (`createAdminSupabaseClient()`) |
| `lib/supabase/middleware.ts` | Refresh session + chặn `/admin`, `/api/admin` |
| `middleware.ts` | Matcher: `/api/admin/:path*`, `/admin/:path*` |

---

## 5. Auth & bảo mật Admin

### Luồng

1. User đăng nhập tại **`/login`** (`LoginForm` → `signInWithPassword`).
2. Middleware kiểm tra session + `public.users.role === 'admin'`.
3. Không đăng nhập → redirect `/login?redirect=/admin`.
4. Đã login nhưng không phải admin → redirect `/`.

### Bảo vệ kép

- **Middleware** (`lib/supabase/middleware.ts`)
- **`guardAdmin()`** / **`withAdminAction()`** — Server Actions
- **`withAdminApi()`** — API Route Handlers

### Admin mặc định

- Email: **`workspaceplace22@gmail.com`** (tự gán `admin` qua trigger SQL).

---

## 6. Admin Dashboard (`/admin`)

### UI

- **4 thẻ thống kê:** doanh thu, đơn hàng, sản phẩm, khách hàng
- **Biểu đồ:** doanh thu 6 tháng (Recharts) — đơn không `cancelled`
- **3 tab:**
  - **Sản phẩm** — form CRUD, tồn kho theo size có nút **− / +**
  - **Đơn hàng** — CRUD, đổi status, gán khách
  - **Khách hàng** — bảng user, gán role admin/user, xóa tài khoản

### Trang & components

```
app/admin/page.tsx          # Server: fetch stats, products, orders, users
app/admin/layout.tsx
app/login/page.tsx

components/admin/
  AdminDashboard.tsx
  AdminTabs.tsx
  StatCards.tsx
  RevenueChart.tsx
  ProductManager.tsx
  OrderManager.tsx
  CustomerManager.tsx
  AdminHeader.tsx
  LoginForm.tsx
  format.ts
  order-status.ts
```

---

## 7. Server Actions

| File | Actions |
|------|---------|
| `lib/admin/actions/dashboard.ts` | `getDashboardStatsAction` |
| `lib/admin/actions/products.ts` | `getProductsAction`, `getProductAction`, `createProductAction`, `updateProductAction`, `deleteProductAction` |
| `lib/admin/actions/orders.ts` | `getOrdersAction`, `getOrderAction`, `createOrderAction`, `updateOrderAction`, `deleteOrderAction` |
| `lib/admin/actions/users.ts` | `getCustomersAction`, `getUserAction`, `updateUserAction`, `assignRoleAction`, `deleteUserAction` |

Tất cả bọc qua `withAdminAction()` → gọi data layer.

### Data layer (service role)

- `lib/admin/data/products.ts`
- `lib/admin/data/orders.ts`
- `lib/admin/data/users.ts`

### Kiểu kết quả

```ts
type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };
```

Helper: `lib/admin/result.ts`, `lib/admin/auth.ts`, `lib/admin/stats.ts`

---

## 8. REST API (Admin)

Tất cả yêu cầu **admin đã login** (cookie session).

| Method | Endpoint |
|--------|----------|
| GET, POST | `/api/admin/products` |
| GET, PATCH, DELETE | `/api/admin/products/[id]` |
| GET, POST | `/api/admin/orders` |
| GET, PATCH, DELETE | `/api/admin/orders/[id]` |
| GET | `/api/admin/users?role=user` |
| GET, PATCH, DELETE | `/api/admin/users/[id]` |
| PATCH | `/api/admin/users/[id]/role` — body: `{ "role": "admin" \| "user" }` |

Wrapper: `lib/admin/api.ts` → `withAdminApi()`, `jsonResult()`

---

## 9. Types

`lib/supabase/types.ts` — `DbUser`, `DbProduct`, `DbOrder`, `ProductSizeStock`, `OrderStatus`, `UserRole`, input types cho CRUD.

---

## 10. Storefront (chưa nối Supabase)

Catalog / giỏ hàng vẫn dùng dữ liệu **tĩnh**:

- `lib/store/catalog.ts`, `products.ts`, `cart.ts`, …
- Homepage: `components/motto/MottoHomePage.tsx`
- Trang category: `app/sneakers`, `app/clothing`, …
- Chi tiết SP: `app/products/[id]`

**Chưa làm:** Đồng bộ sản phẩm storefront ↔ `public.products` Supabase.

---

## 11. Dependencies liên quan Backend/Admin

```json
"@supabase/supabase-js": "^2.106.2",
"@supabase/ssr": "^0.10.3",
"recharts": "^3.8.1",
"lucide-react": "^1.16.0"
```

---

## 12. Setup nhanh (checklist)

- [ ] Tạo project Supabase
- [ ] Chạy `supabase/admin-schema.sql`
- [ ] Chạy `supabase/auth-user-trigger.sql`
- [ ] Điền `.env.local` (URL, anon, **service_role**)
- [ ] `npm install` → `npm run dev`
- [ ] Tạo user Auth (hoặc dùng `workspaceplace22@gmail.com`)
- [ ] Kiểm tra `select * from public.users` — role đúng
- [ ] Vào `http://localhost:3000/login` → `/admin`

---

## 13. Lệnh thường dùng

```bash
cd ecommerce_store-main
npm run dev
npm run build
```

---

## 14. Việc có thể làm tiếp

- Nối storefront đọc `products` từ Supabase thay catalog tĩnh
- Checkout tạo `orders` từ giỏ hàng
- Trang đăng ký user (`/register`)
- Bảo vệ production: rate limit API admin, audit log
- `order_items` (chi tiết từng SP trong đơn)
- Upload ảnh Supabase Storage thay URL thủ công

---

## 15. Cây thư mục Backend/Admin (rút gọn)

```
ecommerce_store-main/
├── app/
│   ├── admin/page.tsx
│   ├── login/page.tsx
│   └── api/admin/
│       ├── products/route.ts, [id]/route.ts
│       ├── orders/route.ts, [id]/route.ts
│       └── users/route.ts, [id]/route.ts, [id]/role/route.ts
├── components/admin/          # UI dashboard
├── lib/
│   ├── supabase/              # clients, types, middleware helper
│   └── admin/
│       ├── actions/           # Server Actions
│       ├── data/              # Supabase queries (service role)
│       ├── auth.ts
│       ├── stats.ts
│       ├── api.ts
│       └── result.ts
├── supabase/
│   ├── admin-schema.sql
│   └── auth-user-trigger.sql
├── middleware.ts
├── .env.example
└── docs/CONTEXT.md            # ← this file
```

---

## 16. Ghi chú kỹ thuật

- `app/admin/page.tsx` và `app/login/page.tsx` có `export const dynamic = "force-dynamic"`.
- Next.js 16 có cảnh báo deprecation `middleware` → `proxy` (chưa migrate).
- `deleteUser` trong admin gọi `supabase.auth.admin.deleteUser` (cần service role).
- Giá / doanh thu format VND: `components/admin/format.ts`.

---

*Cập nhật lần cuối: theo session tích hợp Supabase + Admin Dashboard + trigger Auth.*
