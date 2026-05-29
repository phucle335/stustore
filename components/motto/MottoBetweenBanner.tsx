"use client";

import Link from "next/link";
import styles from "@/styles/components/motto/MottoBetweenBanner.module.css";

export function MottoBetweenBanner({
  banner,
}: {
  banner?: null | {
    enabled: boolean;
    imageUrl: string;
    title: string;
    href: string;
  };
}) {
  if (!banner?.enabled) return null;
  if (!banner.imageUrl) return null;
  if (!banner.href) return null;

  return (
    <section className={styles.betweenBanner} aria-label="Banner">
      <Link href={banner.href} className={styles.betweenBannerLink}>
        <img
          src={banner.imageUrl}
          alt={banner.title || ""}
          className={styles.betweenBannerImg}
          loading="lazy"
          decoding="async"
        />
      </Link>
    </section>
  );
}
