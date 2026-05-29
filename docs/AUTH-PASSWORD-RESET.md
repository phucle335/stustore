# Quên mật khẩu (Supabase Auth)

## Trang

| Đối tượng | Quên MK | Đặt lại MK (từ email) | Đăng nhập |
|-----------|---------|------------------------|-----------|
| Khách hàng | `/quen-mat-khau` | `/dat-lai-mat-khau` | `/dang-nhap` |
| Admin | `/login/quen-mat-khau` | `/login/dat-lai-mat-khau` | `/login` |

Callback OAuth/recovery: `/auth/callback?next=...`

## Cấu hình Supabase (bắt buộc)

**Authentication → URL Configuration**

- **Site URL:** `https://stusport.vercel.app` (hoặc domain production)
- **Redirect URLs** (thêm từng dòng):
  - `https://stusport.vercel.app/auth/callback`
  - `https://stusport.vercel.app/dat-lai-mat-khau`
  - `https://stusport.vercel.app/login/dat-lai-mat-khau`
  - `http://localhost:3000/auth/callback` (dev)

**Authentication → Email** — bật gửi email (SMTP hoặc Supabase mặc định).

## Biến môi trường

- `NEXT_PUBLIC_SITE_URL` — URL production (dùng trong link reset)
