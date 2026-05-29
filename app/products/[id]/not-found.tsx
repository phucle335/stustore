import Link from "next/link";
import { StoreShell } from "@/components/store/StoreShell";
import staticStyles from "@/styles/components/store/StoreStatic.module.css";

export default function ProductNotFound() {
  return (
    <StoreShell activeNav="sneakers">
      <section className={staticStyles.searchEmpty} style={{ padding: "48px 24px" }}>
        <h1 style={{ marginBottom: 12 }}>Không tìm thấy sản phẩm</h1>
        <p style={{ marginBottom: 24 }}>
          Sản phẩm không tồn tại hoặc đã bị gỡ. Vui lòng quay lại danh mục.
        </p>
        <Link href="/sneakers">Xem giày sneaker</Link>
      </section>
    </StoreShell>
  );
}
