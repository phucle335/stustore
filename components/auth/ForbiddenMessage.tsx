"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StusportLogo } from "@/components/brand/StusportLogo";
import styles from "@/styles/components/store/Customer.module.css";

export function ForbiddenMessage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const isAdmin = from === "admin";

  return (
    <div className={styles.forbiddenPage}>
      <div className={styles.customerPageEyebrow}>
        <StusportLogo
          variant="mark"
          tone="on-light"
          href="/"
          className="stusport-logo--compact"
        />
      </div>
      <h1>Bạn không được cấp phép</h1>
      <p>
        {isAdmin
          ? "Tài khoản của bạn không có quyền quản trị. Chỉ admin mới vào được trang quản lý."
          : "Bạn không có quyền xem nội dung này."}
      </p>
      <div className={styles.forbiddenPageActions}>
        <Link href="/" className={styles.storeBtnPrimary}>
          Về trang chủ
        </Link>
        {isAdmin ? (
          <Link href="/login" className={styles.forbiddenPageLink}>
            Đăng nhập admin khác
          </Link>
        ) : null}
      </div>
    </div>
  );
}
