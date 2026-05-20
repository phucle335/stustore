"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { getPrimaryImage } from "@/lib/store/product-images";
import type { Product } from "@/lib/store/types";

type ProductCardProps = {
  product: Product;
  showRating?: boolean;
  showSaleBadge?: boolean;
};

export function ProductCard({
  product,
  showRating = false,
  showSaleBadge = false,
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
            entry.target.classList.add("show");
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
      className={`product-card${showRating ? " product-card--home" : ""}`}
    >
      <div className="product-card-media">
        {showSaleBadge && product.oldPrice ? (
          <span className="product-sale-badge">Sale</span>
        ) : null}
        <Image
          src={getPrimaryImage(product.images)}
          alt={product.imageAlt}
          width={500}
          height={250}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="product-card-image"
        />
      </div>
      <p className="brand">{product.brand}</p>
      <h4 className="product-name">{product.name}</h4>
      {showRating ? (
        <div className="product-rating" aria-label="5 sao">
          {Array.from({ length: 5 }, (_, index) => (
            <i key={index} className="fas fa-star" aria-hidden="true" />
          ))}
        </div>
      ) : null}
      <div className="price-box">
        <span className="price">{product.price}</span>
        {product.oldPrice ? (
          <span className="old-price">{product.oldPrice}</span>
        ) : null}
      </div>
    </Link>
  );
}
