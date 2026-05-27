"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function ForbiddenMessage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const isAdmin = from === "admin";

  return (
    <div className="forbidden-page">
      <p className="customer-page-eyebrow">Stusport</p>
      <h1>Bạn không được cấp phép</h1>
      <p>
        {isAdmin
          ? "Tài khoản của bạn không có quyền quản trị. Chỉ admin mới vào được trang quản lý."
          : "Bạn không có quyền xem nội dung này."}
      </p>
      <div className="forbidden-page-actions">
        <Link href="/" className="store-btn-primary">
          Về trang chủ
        </Link>
        {isAdmin ? (
          <Link href="/login" className="forbidden-page-link">
            Đăng nhập admin khác
          </Link>
        ) : null}
      </div>
    </div>
  );
}
