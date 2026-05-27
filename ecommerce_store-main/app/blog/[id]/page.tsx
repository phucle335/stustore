import Link from "next/link";
import { notFound } from "next/navigation";
import { StoreShell } from "@/components/store/StoreShell";
import { BLOG_POSTS } from "@/lib/store/blog-content";
import { ProductImage } from "@/components/store/ProductImage";
import { getBlogPostByIdMerged } from "@/lib/blog/blog-cms";

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
    return { title: "Không tìm thấy — Stusport" };
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
      <article className="blog-post">
        <Link href="/blog" className="blog-post-back">
          <i className="fas fa-arrow-left" aria-hidden="true" />
          Quay lại Blog
        </Link>
        <time className="blog-post-date">{post.date}</time>
        <h1 className="blog-post-title">{post.title}</h1>
        <div className="blog-post-image-wrap">
          <ProductImage
            src={post.image}
            alt={post.title}
            width={1200}
            height={640}
            priority
            className="blog-post-image"
          />
        </div>
        <p className="blog-post-lead">{post.excerpt}</p>
        <div className="blog-post-body">
          {post.body
            .split(/\n\n/)
            .map((p, idx) => p.trim())
            .filter(Boolean)
            .map((paragraph, paragraphIdx) => (
              <p key={paragraphIdx}>{paragraph}</p>
            ))}
        </div>
      </article>
    </StoreShell>
  );
}
