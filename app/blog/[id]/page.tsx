import Link from "next/link";
import { notFound } from "next/navigation";
import { StoreShell } from "@/components/store/StoreShell";
import { BLOG_POSTS } from "@/lib/store/blog-content";
import { ProductImage } from "@/components/store/ProductImage";
import { getBlogPostByIdMerged } from "@/lib/blog/blog-cms";
import styles from "@/styles/components/store/Blog.module.css";

type BlogPostPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams(): { id: string }[] {
  return BLOG_POSTS.map((post) => ({ id: post.id }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { id } = await params;
  const post = await getBlogPostByIdMerged(id);

  if (!post) {
    return { title: "Not Found — Stusport" };
  }

  return { title: `${post.title} — Stusport` };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;
  const post = await getBlogPostByIdMerged(id);

  if (!post) {
    notFound();
  }

  return (
    <StoreShell activeNav="blog">
      <div className={styles.blogPage}>
        <article className={styles.blogPost}>
          <Link href="/blog" className={styles.blogPostBack}>
            <i className="fas fa-arrow-left" aria-hidden="true" />
            Back to Blog
          </Link>
          <time className={styles.blogPostDate}>{post.date}</time>
          <h1 className={styles.blogPostTitle}>{post.title}</h1>
          <div className={styles.blogPostImageWrap}>
            <ProductImage
              src={post.image}
              alt={post.title}
              width={1200}
              height={640}
              priority
              className={styles.blogPostImage}
            />
          </div>
          <p className={styles.blogPostLead}>{post.excerpt}</p>
          <div className={styles.blogPostBody}>
            {post.body
              .split(/\n\n/)
              .map((p) => p.trim())
              .filter(Boolean)
              .map((paragraph, paragraphIdx) => (
                <p key={paragraphIdx}>{paragraph}</p>
              ))}
          </div>
        </article>
      </div>
    </StoreShell>
  );
}
