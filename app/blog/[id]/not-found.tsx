import Link from "next/link";
import { StoreShell } from "@/components/store/StoreShell";
import styles from "@/styles/components/store/Blog.module.css";

export default function BlogPostNotFound() {
  return (
    <StoreShell activeNav="blog">
      <section
        className={`${styles.blogPage} ${styles.blogPageNotFound}`}
      >
        <h1 className={styles.blogPageTitle}>Không tìm thấy bài viết</h1>
        <p className={styles.blogPageSubtitle}>
          Bài viết có thể đã bị gỡ hoặc đường dẫn không đúng.
        </p>
        <Link href="/blog" className="product-detail-add-btn">
          Về danh sách Blog
        </Link>
      </section>
    </StoreShell>
  );
}
