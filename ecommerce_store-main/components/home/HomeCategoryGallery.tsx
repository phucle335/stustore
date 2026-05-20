import Image from "next/image";
import Link from "next/link";
import { HOME_CATEGORY_TILES } from "@/lib/store/home-content";

export function HomeCategoryGallery() {
  return (
    <section className="home-category-gallery">
      <div className="home-category-grid">
        {HOME_CATEGORY_TILES.map((tile) => (
          <Link
            key={tile.id}
            href={tile.href}
            className={`home-category-tile home-category-tile--${tile.size}`}
          >
            <Image
              src={tile.image}
              alt={tile.label}
              fill
              sizes={
                tile.size === "large"
                  ? "(max-width: 768px) 100vw, 50vw"
                  : "(max-width: 768px) 100vw, 33vw"
              }
              className="home-category-img"
            />
            <div className="home-category-overlay" />
            <span className="home-category-label">{tile.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
