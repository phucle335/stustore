import Link from "next/link";
import { ProductImage } from "@/components/store/ProductImage";
import { getBlogPostHref } from "@/lib/store/blog-content";
import { getBlogPostsMerged } from "@/lib/blog/blog-cms";
import homeStyles from "@/styles/components/home/HomeLegacy.module.css";
import styles from "@/styles/components/store/Blog.module.css";

export async function BlogList() {
  const posts = await getBlogPostsMerged();

  return (
    <section className={styles.blogPage}>
      <header className={styles.blogPageHeader}>
        <h1 className={styles.blogPageTitle}>Blog</h1>
        <p className={styles.blogPageSubtitle}>
          Tin tức, xu hướng và mẹo chọn đồ từ Stusport
        </p>
      </header>

      <div className={`${homeStyles.homeBlogGrid} ${styles.blogPageGrid}`}>
        {posts.map((post) => (
          <article key={post.id} className={homeStyles.homeBlogCard}>
            <Link
              href={getBlogPostHref(post.id)}
              className={homeStyles.homeBlogImageWrap}
            >
              <ProductImage
                src={post.image}
                alt={post.title}
                width={600}
                height={360}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={homeStyles.homeBlogImage}
              />
            </Link>
            <time className={styles.blogCardDate} dateTime={post.id}>
              {post.date}
            </time>
            <h2 className={homeStyles.homeBlogTitle}>
              <Link href={getBlogPostHref(post.id)}>{post.title}</Link>
            </h2>
            <p className={homeStyles.homeBlogExcerpt}>{post.excerpt}</p>
            <Link href={getBlogPostHref(post.id)} className={homeStyles.homeBlogLink}>
              Đọc thêm
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
