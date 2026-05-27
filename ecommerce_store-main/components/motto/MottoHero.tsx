"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { MottoHeroSlide } from "@/lib/motto/content";
import { MOTTO_HERO_SLIDES } from "@/lib/motto/content";
import { MottoHeroIntro } from "./MottoHeroIntro";

const AUTO_MS = 5000;

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
  const [reducedMotion, setReducedMotion] = useState(false);

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
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

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
    if (!ready || !sectionRef.current) return;

    if (reducedMotion) {
      sectionRef.current.classList.add("is-appear");
      return;
    }

    const ctx = gsap.context(() => {
      if (mediaRef.current) {
        gsap.fromTo(
          mediaRef.current,
          { scale: 1.08, opacity: 0.85 },
          { scale: 1, opacity: 1, duration: 1.4, ease: "power2.out", delay: 0.15 },
        );
      }

      gsap.fromTo(
        ".motto-hero-cta, .motto-hero-intro",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.4,
          stagger: 0.15,
          ease: "power2.out",
        },
      );
    }, sectionRef);

    sectionRef.current.classList.add("is-appear");

    return () => ctx.revert();
  }, [ready, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="motto-hero"
      data-theme="light"
      aria-label="Stusport banner"
    >
      <h1 className="motto-sr-only">Stusport</h1>

      <div className="motto-hero-carousel-wrap">
        <div className="motto-hero-media" ref={mediaRef}>
          {slidesToUse.map((slide, slideIndex) => (
            <div
              key={slide.id}
              className={`motto-hero-slide${slideIndex === index ? " is-active" : ""}`}
              aria-hidden={slideIndex !== index}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="motto-hero-slide-img"
                decoding="async"
                fetchPriority={slideIndex === 0 ? "high" : "low"}
              />
            </div>
          ))}
          <div className="motto-hero-media-overlay" />
        </div>

        <div className="motto-hero-grid">
          <div className="motto-hero-cta">
            <Link
              href="#services"
              className="motto-btn motto-btn--pill motto-btn--light"
            >
              <span>Khám phá sản phẩm</span>
              <span className="motto-hero-cta-hint">(Scroll)</span>
            </Link>
          </div>
        </div>

        <div className="motto-hero-controls">
          <div
            className="motto-hero-thumbs"
            role="tablist"
            aria-label="Chọn ảnh banner"
          >
            {slidesToUse.map((slide, thumbIndex) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={thumbIndex === index}
                aria-label={`Ảnh ${thumbIndex + 1}`}
                className={`motto-hero-thumb${thumbIndex === index ? " is-active" : ""}`}
                onClick={() => goTo(thumbIndex)}
              >
                <img
                  src={slide.image}
                  alt=""
                  width={48}
                  height={48}
                  className="motto-hero-thumb-img"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
          <div className="motto-hero-arrows">
            <button
              type="button"
              className="motto-hero-arrow"
              onClick={goPrev}
              aria-label="Ảnh trước"
            >
              ←
            </button>
            <button
              type="button"
              className="motto-hero-arrow"
              onClick={goNext}
              aria-label="Ảnh tiếp theo"
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
