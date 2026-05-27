# PAYMENT / ORDER FLOW CHANGES

## Những việc đã làm

### 1) PayOS payment link API
- Tạo file `app/api/create-payment-link/route.js`
- Khởi tạo PayOS SDK bằng:
  - `PAYOS_CLIENT_ID`
  - `PAYOS_API_KEY`
  - `PAYOS_CHECKSUM_KEY`
- Nhận `POST` với:
  - `orderId`
  - `depositAmount`
  - `description`
- Làm sạch description:
  - viết hoa
  - bỏ dấu
  - bỏ ký tự đặc biệt
- Trả về JSON có `checkoutUrl`
- Có xử lý lỗi `try/catch`

### 2) PayOS webhook
- Tạo file `app/api/webhook/payos/route.js`
- Xác thực webhook bằng `payos.verifyPaymentWebhookData(body)`
- Khi thanh toán thành công:
  - lấy `orderCode`
  - cập nhật `orders.status = 'deposit_paid'`
- Dùng Supabase Server Client để update DB
- Trả JSON phản hồi thành công cho PayOS

### 3) Trang thanh toán cọc động
- Tạo file `app/checkout/payment/[id]/page.jsx`
- Là Client Component
- Lấy `id` đơn hàng từ params
- Fetch đơn hàng từ Supabase
- Tự gọi `/api/create-payment-link`
- Hiển thị giao diện thanh toán cọc hiện đại
- Nhúng `checkoutUrl`
- Subscribe Supabase Realtime cho `orders`
- Nếu `status === 'deposit_paid'` thì tự động chuyển sang `/checkout/success`

### 4) Checkout flow
- Cập nhật `components/store/CheckoutView.tsx`
- Khi đặt đơn xong, không hiện success ngay nữa
- Tự động chuyển sang `/checkout/payment/[id]`
- Hỗ trợ phương thức mới:
  - `cod_deposit`
  - `bank_transfer_full`
  - `preorder_deposit`
- Hiển thị đúng thông điệp cọc:
  - pre-order: cọc 50%
  - hàng có sẵn: cọc 100k hoặc chuyển khoản full

### 5) API checkout
- Cập nhật `app/api/store/checkout/route.ts`
- Set trạng thái mới:
  - `pending_payment`
- Thêm các field:
  - `deposit_amount`
  - `remaining_amount`
- Enforce rule thanh toán:
  - pre-order chỉ được cọc 50%
  - hàng có sẵn chỉ được cọc 100k COD hoặc chuyển khoản full

### 6) Order status mở rộng
- Cập nhật `lib/supabase/types.ts`
- Cập nhật `components/admin/order-status.ts`
- Thêm các status mới:
  - `pending_payment`
  - `deposit_paid`
  - `payment_verified`
- Giữ lại các status cũ:
  - `confirmed`
  - `processing`
  - `shipped`
  - `delivered`
  - `cancelled`

### 7) Product fulfillment type
- Thêm `fulfillment_type` cho product:
  - `in_stock`
  - `pre_order`
- Cập nhật:
  - `lib/supabase/types.ts`
  - `lib/store/product-query.ts`
  - `lib/admin/data/products.ts`
  - `components/admin/ProductManager.tsx`
- Cho phép admin chọn loại fulfillment trong form sản phẩm

### 8) Admin dashboard style refresh
- Cập nhật nhiều component admin để thống nhất giao diện mới
- Các file đã chỉnh bao gồm:
  - `components/admin/AdminHeader.tsx`
  - `components/admin/AdminDashboardClient.tsx`
  - `components/admin/StatCards.tsx`
  - `components/admin/layout/AdminSidebar.tsx`
  - `app/admin/admin-dashboard.css`
- Đổi sang hệ UI sáng, bo góc, button pill, shadow mềm

### 9) Member account payment display
- Cập nhật `components/account/MemberAccountPage.tsx`
- Hiển thị rõ:
  - đã cọc
  - còn lại
- Phù hợp với flow thanh toán mới

### 10) Supabase migration
- Tạo file `supabase/payment-migration.sql`
- Bao gồm:
  - `products.fulfillment_type`
  - `orders.deposit_amount`
  - `orders.remaining_amount`
  - `orders.payment_method`
  - `orders.is_preorder`
  - mở rộng `orders.status`
  - mở rộng `orders.payment_method`
  - backfill dữ liệu cũ
  - index cần thiết
  - helper function tính tiền cọc
  - bảng log webhook `payment_webhook_logs`

## Trạng thái hiện tại
- Build production đã pass
- Lint cho các file vừa chạm đã pass
- Payment flow mới đã được scaffold và kết nối end-to-end ở mức code

## Ghi chú
- Một số phần sẽ cần migrate DB trên Supabase trước khi chạy production đầy đủ
- Webhook PayOS cần public URL khi deploy thực tế
