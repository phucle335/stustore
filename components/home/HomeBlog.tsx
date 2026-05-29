import Image from "next/image";
import Link from "next/link";
import { HOME_BLOG_POSTS } from "@/lib/store/home-content";
import styles from "@/styles/components/home/HomeLegacy.module.css";

export function HomeBlog() {
  return (
    <section className={styles.homeBlog}>
      <h2 className={styles.homeBlogHeading}>
        A SNEAKER SOCIETY &amp; CULTURE STORE
      </h2>
      <div className={styles.homeBlogGrid}>
        {HOME_BLOG_POSTS.map((post) => (
          <article key={post.id} className={styles.homeBlogCard}>
            <Link href={post.href} className={styles.homeBlogImageWrap}>
              <Image
                src={post.image}
                alt={post.title}
                width={600}
                height={360}
                className={styles.homeBlogImage}
              />
            </Link>
            <h3 className={styles.homeBlogTitle}>{post.title}</h3>
            <p className={styles.homeBlogExcerpt}>{post.excerpt}</p>
            <Link href={post.href} className={styles.homeBlogLink}>
              Đọc thêm
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
