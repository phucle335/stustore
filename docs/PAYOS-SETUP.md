# PayOS + Supabase Setup (Stusport)

File này hướng dẫn tích hợp PayOS vào project **Next.js + Supabase** của bạn theo đúng flow production.

## 0) Điều kiện

- Đã có project PayOS và lấy được 3 key:
  - `PAYOS_CLIENT_ID`
  - `PAYOS_API_KEY`
  - `PAYOS_CHECKSUM_KEY`
- Đã có Supabase project:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (chỉ dùng server/webhook)

## 1) Chạy SQL migration trên Supabase

1. Vào **Supabase Dashboard → SQL Editor**
2. Copy/paste và chạy file:
   - `supabase/payment-migration.sql`

Các cột quan trọng cho payment flow:
- `orders.deposit_amount`
- `orders.remaining_amount`
- `orders.payment_method`
- `orders.payment_gateway`
- `orders.payment_reference`
- `orders.payment_paid_at`
- mở rộng `orders.status` (có `pending_payment`, `deposit_paid`, `payment_verified`)

## 2) Cấu hình env (Local)

Trong `.env.local` (ví dụ):

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

PAYOS_CLIENT_ID=...
PAYOS_API_KEY=...
PAYOS_CHECKSUM_KEY=...

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Sau khi đổi env, **restart** dev server:

```bash
npm run dev
```

## 3) Cấu hình env (Vercel)

Vercel → **Project → Settings → Environment Variables** (Production) thêm y hệt các biến ở local.

Quan trọng:
- `NEXT_PUBLIC_SITE_URL` nên là domain production, ví dụ:
  - `https://stusport.vercel.app`
- Không thêm dấu `/` ở cuối.

Sau khi cập nhật env: **Redeploy** (khuyên dùng *Clear build cache*).

## 4) Test tạo link thanh toán (không cần webhook)

Webhook **không cần** để tạo link/hiện QR.

Flow test:
1. Đăng nhập user
2. Checkout tạo order → order có `status = pending_payment`
3. Vào trang:
   - `/checkout/payment/[id]`
4. Trang sẽ gọi:
   - `POST /api/create-payment-link`
5. Nếu OK sẽ nhận `checkoutUrl` và hiển thị iframe/nút PayOS.

Nếu lỗi: xem **Vercel Function Logs** (production) hoặc terminal log (local) của endpoint:
- `app/api/create-payment-link/route.js`

## 5) Cấu hình webhook (để tự cập nhật trạng thái)

Webhook dùng để PayOS gọi về server khi thanh toán thành công, giúp bạn tự update:
- `orders.status = deposit_paid` (hoặc `payment_verified`)

### 5.1) URL webhook

Production URL:
- `https://<your-domain>/api/webhook/payos`

Ví dụ Vercel:
- `https://stusport.vercel.app/api/webhook/payos`

### 5.2) Test webhook

Sau khi thanh toán thành công trên PayOS:
- Kiểm tra `orders.status` trong Supabase có đổi sang `deposit_paid` không.

## 6) Các lỗi thường gặp

### A) Không tạo được link thanh toán

- Thiếu env PayOS trên Vercel (Production).
- Chưa chạy SQL migration nên thiếu cột/logic deposit.
- `orderCode` bị trùng (reload trang tạo link nhiều lần).

### B) Thanh toán xong nhưng đơn không đổi trạng thái

- Chưa cấu hình webhook trong PayOS dashboard.
- Webhook bị chặn/không public (local).
- Sai key `PAYOS_CHECKSUM_KEY` → verify webhook fail.

---

Nếu bạn muốn mình hỗ trợ debug nhanh: gửi **Vercel Function Logs** của `/api/create-payment-link` và `/api/webhook/payos`.

