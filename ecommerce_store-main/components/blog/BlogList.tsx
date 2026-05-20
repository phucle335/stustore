import Image from "next/image";
import Link from "next/link";
import { BLOG_POSTS, getBlogPostHref } from "@/lib/store/blog-content";

export function BlogList() {
  return (
    <section className="blog-page">
      <header className="blog-page-header">
        <h1 className="blog-page-title">Blog</h1>
        <p className="blog-page-subtitle">
          Tin tức, xu hướng và mẹo chọn đồ từ Stusport
        </p>
      </header>

      <div className="home-blog-grid blog-page-grid">
        {BLOG_POSTS.map((post) => (
          <article key={post.id} className="home-blog-card">
            <Link
              href={getBlogPostHref(post.id)}
              className="home-blog-image-wrap"
            >
              <Image
                src={post.image}
                alt={post.title}
                width={600}
                height={360}
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
