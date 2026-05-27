"use client";

import Link from "next/link";

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
    <section className="motto-between-banner" aria-label="Banner">
      <Link href={banner.href} className="motto-between-banner-link">
        <img
          src={banner.imageUrl}
          alt={banner.title || ""}
          className="motto-between-banner-img"
          loading="lazy"
          decoding="async"
        />
      </Link>
    </section>
  );
}

