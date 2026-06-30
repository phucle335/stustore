import Link from "next/link";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import type { BlogCategory } from "@/lib/store/blog-categories";
import type { BlogPost } from "@/lib/store/blog-content";
import styles from "@/styles/components/store/Blog.module.css";

type BlogCategoryViewProps = {
  category: BlogCategory;
  posts: BlogPost[];
};

export function BlogCategoryView({ category, posts }: BlogCategoryViewProps) {
  return (
    <section className={styles.blogPage}>
      <header className={styles.blogCategoryPageHead}>
        <Link href="/blog" className={styles.blogPostBack}>
          <i className="fas fa-arrow-left" aria-hidden="true" />
          Back to Blog
        </Link>
        <h1 className={styles.blogSectionTitle}>{category.label}</h1>
        <p className={styles.blogCategoryPageCount}>
          {posts.length} articles
        </p>
      </header>

      <div className={styles.blogCategoryGrid}>
        {posts.map((post) => (
          <BlogPostCard
            key={post.id}
            id={post.id}
            title={post.title}
            excerpt={post.excerpt}
            image={post.image}
            date={post.date}
          />
        ))}
      </div>
    </section>
  );
}
