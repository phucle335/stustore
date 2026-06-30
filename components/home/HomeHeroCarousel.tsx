"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { HERO_SLIDES } from "@/lib/store/home-content";
import styles from "@/styles/components/home/HomeLegacy.module.css";

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
    <div className={styles.homeHeroCarousel}>
      <div className={styles.homeHeroCarouselFrame}>
        {HERO_SLIDES.map((item, slideIndex) => (
          <div
            key={item.id}
            className={`${styles.homeHeroSlide}${slideIndex === index ? ` ${styles.active}` : ""}`}
            aria-hidden={slideIndex !== index}
          >
            <Image
              src={item.image}
              alt={item.alt}
              fill
              priority={slideIndex === 0}
              sizes="(max-width: 1056px) 100vw, 1056px"
              className={`${styles.homeHeroBannerImg} w-full h-full max-w-full object-cover`}
            />
            <div className={styles.homeHeroBannerOverlay} />
            <p className={styles.homeHeroBannerText}>{item.caption}</p>
          </div>
        ))}

        <button
          type="button"
          className={`${styles.homeHeroNav} ${styles.homeHeroNavPrev}`}
          onClick={goPrev}
          aria-label="Previous image"
        >
          <i className="fas fa-chevron-left" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`${styles.homeHeroNav} ${styles.homeHeroNavNext}`}
          onClick={goNext}
          aria-label="Next image"
        >
          <i className="fas fa-chevron-right" aria-hidden="true" />
        </button>

        <div className={styles.homeHeroDots} role="tablist" aria-label="Select banner image">
          {HERO_SLIDES.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              aria-label={`Image ${dotIndex + 1}`}
              className={dotIndex === index ? styles.active : undefined}
              onClick={() => goTo(dotIndex)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
