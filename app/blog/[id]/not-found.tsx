import Link from "next/link";
import { StoreShell } from "@/components/store/StoreShell";
import styles from "@/styles/components/store/Blog.module.css";

export default function BlogPostNotFound() {
  return (
    <StoreShell activeNav="blog">
      <section
        className={`${styles.blogPage} ${styles.blogPageNotFound}`}
      >
        <h1 className={styles.blogPageTitle}>Post Not Found</h1>
        <p className={styles.blogPageSubtitle}>
          This post may have been removed or the link is incorrect.
        </p>
        <Link href="/blog" className="product-detail-add-btn">
          Back to Blog List
        </Link>
      </section>
    </StoreShell>
  );
}
