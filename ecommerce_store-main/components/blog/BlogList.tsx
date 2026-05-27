import Link from "next/link";
import { ProductImage } from "@/components/store/ProductImage";
import { getBlogPostHref } from "@/lib/store/blog-content";
import { getBlogPostsMerged } from "@/lib/blog/blog-cms";

export async function BlogList() {
  const posts = await getBlogPostsMerged();

  return (
    <section className="blog-page">
      <header className="blog-page-header">
        <h1 className="blog-page-title">Blog</h1>
        <p className="blog-page-subtitle">
          Tin tức, xu hướng và mẹo chọn đồ từ Stusport
        </p>
      </header>

      <div className="home-blog-grid blog-page-grid">
        {posts.map((post) => (
          <article key={post.id} className="home-blog-card">
            <Link
              href={getBlogPostHref(post.id)}
              className="home-blog-image-wrap"
            >
              <ProductImage
                src={post.image}
                alt={post.title}
                width={600}
                height={360}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="home-blog-image"
              />
            </Link>
            <time className="blog-card-date" dateTime={post.id}>
              {post.date}
            </time>
            <h2 className="home-blog-title">
              <Link href={getBlogPostHref(post.id)}>{post.title}</Link>
            </h2>
            <p className="home-blog-excerpt">{post.excerpt}</p>
            <Link href={getBlogPostHref(post.id)} className="home-blog-link">
              Đọc thêm
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
