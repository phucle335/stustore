import Image from "next/image";
import Link from "next/link";
import { HOME_CATEGORY_TILES } from "@/lib/store/home-content";
import styles from "@/styles/components/home/HomeLegacy.module.css";

export function HomeCategoryGallery() {
  return (
    <section className={styles.homeCategoryGallery}>
      <div className={styles.homeCategoryGrid}>
        {HOME_CATEGORY_TILES.map((tile) => (
          <Link
            key={tile.id}
            href={tile.href}
            className={styles.homeCategoryTile}
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
              className={styles.homeCategoryImg}
            />
            <div className={styles.homeCategoryOverlay} />
            <span className={styles.homeCategoryLabel}>{tile.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
