"use client";

import Image from "next/image";
import { useState } from "react";

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
    <div className="product-detail-gallery">
      <div className="product-detail-main-image">
        <Image
          src={activeSrc}
          alt={`${imageAlt} — ảnh ${safeIndex + 1}`}
          width={800}
          height={800}
          priority={safeIndex === 0}
          className="product-detail-img"
        />
      </div>

      {images.length > 1 ? (
        <ul className="product-detail-thumbs" aria-label="Ảnh sản phẩm">
          {images.map((src, index) => (
            <li key={`${src}-${index}`}>
              <button
                type="button"
                className={`product-detail-thumb${safeIndex === index ? " selected" : ""}`}
                aria-label={`Xem ảnh ${index + 1}`}
                aria-current={safeIndex === index}
                onClick={() => setActiveIndex(index)}
              >
                <Image
                  src={src}
                  alt=""
                  width={88}
                  height={88}
                  className="product-detail-thumb-img"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
