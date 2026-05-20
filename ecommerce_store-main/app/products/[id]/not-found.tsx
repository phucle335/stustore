import Link from "next/link";
import { StoreShell } from "@/components/store/StoreShell";

export default function ProductNotFound() {
  return (
    <StoreShell activeNav="sneakers">
      <section className="product-detail product-detail-not-found">
        <h1 className="product-detail-title">Không tìm thấy sản phẩm</h1>
        <p className="product-detail-description">
          Sản phẩm bạn tìm không tồn tại hoặc đã được gỡ khỏi cửa hàng.
        </p>
        <Link href="/" className="product-detail-add-btn product-detail-back-home">
          Về trang chủ
        </Link>
      </section>
    </StoreShell>
  );
}
