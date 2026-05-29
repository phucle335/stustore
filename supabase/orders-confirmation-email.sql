-- Đánh dấu đã gửi email xác nhận (tránh gửi trùng webhook + confirm-payment)
alter table public.orders
  add column if not exists confirmation_email_sent_at timestamptz;
