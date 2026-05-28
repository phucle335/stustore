"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { HERO_SLIDES } from "@/lib/store/home-content";

const AUTO_MS = 5500;

export function HomeHeroCarousel() {
  const [index, setIndex] = useState(0);

  const goTo = useCallback((next: number) => {
    const total = HERO_SLIDES.length;
    setIndex(((next % total) + total) % total);
  }, []);

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % HERO_SLIDES.length);
  }, []);

  const goPrev = useCallback(() => {
    setIndex(
      (current) => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
    );
  }, []);

  useEffect(() => {
    const timer = window.setInterval(goNext, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [goNext]);

  return (
    <div className="home-hero-carousel">
      <div className="home-hero-carousel-frame">
        {HERO_SLIDES.map((item, slideIndex) => (
          <div
            key={item.id}
            className={`home-hero-slide${slideIndex === index ? " active" : ""}`}
            aria-hidden={slideIndex !== index}
          >
            <Image
              src={item.image}
              alt={item.alt}
              fill
              priority={slideIndex === 0}
              sizes="(max-width: 1056px) 100vw, 1056px"
              className="home-hero-banner-img w-full h-auto max-w-full object-cover"
            />
            <div className="home-hero-banner-overlay" />
            <p className="home-hero-banner-text">{item.caption}</p>
          </div>
        ))}

        <button
          type="button"
          className="home-hero-nav home-hero-nav--prev"
          onClick={goPrev}
          aria-label="Ảnh trước"
        >
          <i className="fas fa-chevron-left" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="home-hero-nav home-hero-nav--next"
          onClick={goNext}
          aria-label="Ảnh sau"
        >
          <i className="fas fa-chevron-right" aria-hidden="true" />
        </button>

        <div className="home-hero-dots" role="tablist" aria-label="Chọn ảnh banner">
          {HERO_SLIDES.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              aria-label={`Ảnh ${dotIndex + 1}`}
              className={dotIndex === index ? "active" : undefined}
              onClick={() => goTo(dotIndex)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
