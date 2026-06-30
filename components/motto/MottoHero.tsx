"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { MottoHeroSlide } from "@/lib/motto/content";
import { MOTTO_HERO_SLIDES } from "@/lib/motto/content";
import { MottoHeroIntro } from "@/components/motto/MottoHeroIntro";
import styles from "@/styles/components/motto/MottoHero.module.css";

const AUTO_MS = 5000;
const REVEAL_FAILSAFE_MS = 2800;

function readReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type MottoHeroProps = {
  ready: boolean;
  slides?: MottoHeroSlide[];
  rotatingWords?: readonly string[];
};

export function MottoHero({ ready, slides, rotatingWords }: MottoHeroProps) {
  const slidesToUse = slides && slides.length > 0 ? slides : MOTTO_HERO_SLIDES;
  const slideCount = slidesToUse.length;

  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [reducedMotion] = useState(readReducedMotion);
  const [appeared, setAppeared] = useState(false);

  const goTo = useCallback((next: number) => {
    if (slideCount <= 1) return;
    setIndex(((next % slideCount) + slideCount) % slideCount);
  }, [slideCount]);

  const goNext = useCallback(() => {
    if (slideCount <= 1) return;
    setIndex((current) => (current + 1) % slideCount);
  }, [slideCount]);

  const goPrev = useCallback(() => {
    if (slideCount <= 1) return;
    setIndex((current) => (current - 1 + slideCount) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    setIndex(0);
  }, [slideCount]);

  useEffect(() => {
    const timer = window.setInterval(goNext, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [goNext]);

  useEffect(() => {
    slidesToUse.forEach((slide) => {
      const img = new window.Image();
      img.src = slide.image;
    });
  }, [slidesToUse]);

  useEffect(() => {
    if (!ready) return;

    if (reducedMotion) {
      setAppeared(true);
      return;
    }

    if (!sectionRef.current) {
      setAppeared(true);
      return;
    }

    const failSafe = window.setTimeout(() => setAppeared(true), REVEAL_FAILSAFE_MS);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => setAppeared(true),
      });

      if (mediaRef.current) {
        tl.fromTo(
          mediaRef.current,
          { scale: 1.06, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.65 },
          0,
        );
      }

      tl.fromTo(
        `.${styles.intro}`,
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 1.15 },
        0.28,
      );

      tl.fromTo(
        `.${styles.cta}`,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.95 },
        0.48,
      );
    }, sectionRef);

    return () => {
      window.clearTimeout(failSafe);
      ctx.revert();
    };
  }, [ready, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={`${styles.hero}${appeared ? ` ${styles.heroAppear}` : ""}`}
      data-ready={ready ? "true" : "false"}
      data-theme="light"
      aria-label="Stusport banner"
    >
      <h1 className={styles.srOnly}>Stusport</h1>

      <div className={styles.carouselWrap}>
        <div className={styles.media} ref={mediaRef}>
          {slidesToUse.map((slide, slideIndex) => (
            <div
              key={slide.id}
              className={`${styles.slide}${slideIndex === index ? ` ${styles.slideActive}` : ""}`}
              aria-hidden={slideIndex !== index}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className={styles.slideImg}
                decoding="async"
                fetchPriority={slideIndex === 0 ? "high" : "low"}
              />
            </div>
          ))}
          <div className={styles.mediaOverlay} />
        </div>

        <div className={styles.grid}>
          <div className={styles.cta}>
            <Link
              href="#services"
              className={`${styles.btn} ${styles.btnPill} ${styles.btnLight}`}
            >
              <span>Explore Products</span>
              <span className={styles.ctaHint}>(Scroll)</span>
            </Link>
          </div>
        </div>

        <div className={styles.controls}>
          <div
            className={styles.thumbs}
            role="tablist"
            aria-label="Select banner image"
          >
            {slidesToUse.map((slide, thumbIndex) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={thumbIndex === index}
                aria-label={`Image ${thumbIndex + 1}`}
                className={`${styles.thumb}${thumbIndex === index ? ` ${styles.thumbActive}` : ""}`}
                onClick={() => goTo(thumbIndex)}
              >
                <img
                  src={slide.image}
                  alt=""
                  width={48}
                  height={48}
                  className={styles.thumbImg}
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
          <div className={styles.arrows}>
            <button
              type="button"
              className={styles.arrow}
              onClick={goPrev}
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              type="button"
              className={styles.arrow}
              onClick={goNext}
              aria-label="Next image"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <MottoHeroIntro rotatingWords={rotatingWords} />
    </section>
  );
}
