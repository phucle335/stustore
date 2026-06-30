"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef } from "react";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import {
  BLOG_SECTION_PREVIEW_MAX,
  getBlogCategoryHref,
  groupPostsByCategory,
} from "@/lib/store/blog-categories";
import type { BlogPost } from "@/lib/store/blog-content";
import styles from "@/styles/components/store/Blog.module.css";

type BlogListViewProps = {
  posts: BlogPost[];
};

export function BlogListView({ posts }: BlogListViewProps) {
  const sections = useMemo(() => groupPostsByCategory(posts), [posts]);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const scrollToCategory = useCallback((categoryId: string) => {
    const node = sectionRefs.current[categoryId];
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  return (
    <section className={styles.blogPage}>
      <header className={styles.blogPageHero}>
        <h1 className={styles.blogPageHeroTitle}>
          Trends, fashion &amp; lifestyle from Stusport
        </h1>
      </header>

        <nav className={styles.blogCategoryNav} aria-label="Blog categories">
        {sections.map(({ category }) => (
          <button
            key={category.id}
            type="button"
            className={styles.blogCategoryNavItem}
            onClick={() => scrollToCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </nav>

      <div className={styles.blogSections}>
        {sections.map(({ category, posts: categoryPosts }) => {
          const previewPosts = categoryPosts.slice(0, BLOG_SECTION_PREVIEW_MAX);
          const hasMore = categoryPosts.length > BLOG_SECTION_PREVIEW_MAX;

          return (
            <section
              key={category.id}
              id={`blog-${category.id}`}
              ref={(node) => {
                sectionRefs.current[category.id] = node;
              }}
              className={styles.blogSection}
            >
              <div className={styles.blogSectionHead}>
                <h2 className={styles.blogSectionTitle}>{category.label}</h2>
                {hasMore ? (
                  <Link
                    href={getBlogCategoryHref(category.id)}
                    className={styles.blogSectionSeeAll}
                  >
                    [ View all ]
                  </Link>
                ) : null}
              </div>

              <div className={styles.blogSectionTrack}>
                {previewPosts.map((post) => (
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
        })}
      </div>
    </section>
  );
}
