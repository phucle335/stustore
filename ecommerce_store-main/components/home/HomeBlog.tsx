import Image from "next/image";
import Link from "next/link";
import { HOME_BLOG_POSTS } from "@/lib/store/home-content";

export function HomeBlog() {
  return (
    <section className="home-blog">
      <h2 className="home-blog-heading">
        A SNEAKER SOCIETY &amp; CULTURE STORE
      </h2>
      <div className="home-blog-grid">
        {HOME_BLOG_POSTS.map((post) => (
          <article key={post.id} className="home-blog-card">
            <Link href={post.href} className="home-blog-image-wrap">
              <Image
                src={post.image}
                alt={post.title}
                width={600}
                height={360}
                className="home-blog-image"
              />
            </Link>
            <h3 className="home-blog-title">{post.title}</h3>
            <p className="home-blog-excerpt">{post.excerpt}</p>
            <Link href={post.href} className="home-blog-link">
              Đọc thêm
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
