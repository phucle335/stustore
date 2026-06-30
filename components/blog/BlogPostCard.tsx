import Link from "next/link";
import { ProductImage } from "@/components/store/ProductImage";
import { getBlogPostHref } from "@/lib/store/blog-content";
import styles from "@/styles/components/store/Blog.module.css";

type BlogPostCardProps = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
};

export function BlogPostCard({
  id,
  title,
  excerpt,
  image,
  date,
}: BlogPostCardProps) {
  return (
    <article className={styles.blogSectionCard}>
      <Link href={getBlogPostHref(id)} className={styles.blogSectionCardImageWrap}>
        <ProductImage
          src={image}
          alt={title}
          width={640}
          height={400}
          sizes="(max-width: 767px) 78vw, 320px"
          className={styles.blogSectionCardImage}
        />
      </Link>
      <div className={styles.blogSectionCardBody}>
        <h3 className={styles.blogSectionCardTitle}>
          <Link href={getBlogPostHref(id)}>{title}</Link>
        </h3>
        <time className={styles.blogSectionCardDate} dateTime={id}>
          {date}
        </time>
        <p className={styles.blogSectionCardExcerpt}>{excerpt}</p>
        <Link href={getBlogPostHref(id)} className={styles.blogSectionCardLink}>
          [Read more]
        </Link>
      </div>
    </article>
  );
}
