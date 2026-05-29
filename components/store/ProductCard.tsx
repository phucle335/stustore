"use client";

import Link from "next/link";
import { ProductImage } from "@/components/store/ProductImage";
import { useEffect, useRef } from "react";
import { getPrimaryImage } from "@/lib/store/product-images";
import type { Product } from "@/lib/store/types";
import catalogStyles from "@/styles/components/store/ProductCatalog.module.css";
import homeStyles from "@/styles/components/home/HomeLegacy.module.css";

type ProductCardProps = {
  product: Product;
  showRating?: boolean;
  showSaleBadge?: boolean;
  lightSurface?: boolean;
};

export function ProductCard({
  product,
  showRating = false,
  showSaleBadge = false,
  lightSurface = false,
}: ProductCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(catalogStyles.show);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(card);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Link
      ref={cardRef}
      href={`/products/${product.id}`}
      data-product-name={product.name}
      data-track={`Xem sản phẩm: ${product.name}`}
      className={`${catalogStyles.productCard}${lightSurface ? ` ${catalogStyles.productCardLight} ${catalogStyles.show}` : ""}${showRating ? ` ${homeStyles.productCardHome}` : ""}`}
    >
      <div className={homeStyles.productCardMedia}>
        {showSaleBadge && product.oldPrice ? (
          <span className={homeStyles.productSaleBadge}>Sale</span>
        ) : null}
        <ProductImage
          src={getPrimaryImage(product.images)}
          alt={product.imageAlt}
          width={400}
          height={400}
          className={catalogStyles.productCardImage}
        />
      </div>
      <p className={catalogStyles.brand}>{product.brand}</p>
      {!lightSurface ? (
        <p>
          {product.fulfillmentType === "pre_order" ? "Pre-order" : "Có sẵn"}
        </p>
      ) : null}
      <h4 className={catalogStyles.productName}>{product.name}</h4>
      {showRating ? (
        <div className={homeStyles.productRating} aria-label="5 sao">
          {Array.from({ length: 5 }).map((_, index) => (
            <i key={index} className="fas fa-star" aria-hidden="true" />
          ))}
        </div>
      ) : null}
      <div className={catalogStyles.priceBox}>
        <span className={catalogStyles.price}>{product.price}</span>
        {product.oldPrice ? (
          <span className={catalogStyles.oldPrice}>{product.oldPrice}</span>
        ) : null}
      </div>
    </Link>
  );
}
