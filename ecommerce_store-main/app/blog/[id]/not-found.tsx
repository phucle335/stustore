import Link from "next/link";
import { StoreShell } from "@/components/store/StoreShell";

export default function BlogPostNotFound() {
  return (
    <StoreShell activeNav="blog">
      <section className="blog-page blog-page--not-found">
        <h1 className="blog-page-title">Không tìm thấy bài viết</h1>
        <p className="blog-page-subtitle">
          Bài viết có thể đã bị gỡ hoặc đường dẫn không đúng.
        </p>
        <Link href="/blog" className="product-detail-add-btn">
          Về danh sách Blog
        </Link>
      </section>
    </StoreShell>
  );
}
