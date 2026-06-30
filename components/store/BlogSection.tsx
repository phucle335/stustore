"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { getBlogPostHref } from "@/lib/store/blog-content";
import styles from "@/styles/components/store/BlogSection.module.css";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
}

const BLOG_IDS = [
  "blog-1782208635526",
  "blog-1782192192198",
  "blog-1782197035741",
  "blog-1782224729780",
  "blog-5",
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

async function fetchBlogPosts(ids: string[]): Promise<BlogPost[]> {
  try {
    const res = await fetch(`/api/blog/posts?ids=${ids.join(",")}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts || [];
  } catch {
    return [];
  }
}

export function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetchBlogPosts(BLOG_IDS).then(setPosts);
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.titleBlock}>
            <p className={styles.eyebrow}>Latest Updates</p>
            <h2 className={styles.heading}>News & Articles</h2>
          </div>
          <Link href="/blog" className={styles.readAllBtn}>
            Read All
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </motion.div>

        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-5% 0px" }}
        >
          {posts.map((post) => (
            <motion.article key={post.id} variants={itemVariants} className={styles.card}>
              <Link href={getBlogPostHref(post.id)} className={styles.cardLink}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className={styles.image}
                    unoptimized
                  />
                </div>
                <div className={styles.cardContent}>
                  <time className={styles.date}>{post.date}</time>
                  <h3 className={styles.cardTitle}>{post.title}</h3>
                  <p className={styles.excerpt}>{post.excerpt}</p>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          className={styles.mobileReadAll}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/blog" className={styles.readAllBtn}>
            Read All Articles
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
