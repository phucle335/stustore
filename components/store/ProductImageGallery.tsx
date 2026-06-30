"use client";

import { useState } from "react";
import { ProductImage } from "@/components/store/ProductImage";
import styles from "@/styles/components/store/ProductDetail.module.css";

type ProductImageGalleryProps = {
  images: string[];
  imageAlt: string;
};

export function ProductImageGallery({
  images,
  imageAlt,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(0, images.length - 1));
  const activeSrc = images[safeIndex] ?? images[0];

  if (!activeSrc) {
    return null;
  }

  return (
    <div className={styles.productDetailGallery}>
      <div className={styles.productDetailMainImage}>
        <ProductImage
          src={activeSrc}
          alt={`${imageAlt} — photo ${safeIndex + 1}`}
          width={800}
          height={800}
          priority={safeIndex === 0}
          className={styles.productDetailImg}
        />
      </div>

      {images.length > 1 ? (
        <ul className={styles.productDetailThumbs} aria-label="Product images">
          {images.map((src, index) => (
            <li key={`${src}-${index}`}>
              <button
                type="button"
                className={`${styles.productDetailThumb}${safeIndex === index ? ` ${styles.selected}` : ""}`}
                aria-label={`View image ${index + 1}`}
                aria-current={safeIndex === index}
                onClick={() => setActiveIndex(index)}
              >
                <ProductImage
                  src={src}
                  alt=""
                  width={88}
                  height={88}
                  className={styles.productDetailThumbImg}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
