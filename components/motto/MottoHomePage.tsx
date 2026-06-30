"use client";

import "@/styles/motto/tokens.css";
import styles from "@/styles/components/motto/MottoHomePage.module.css";
import { useCallback, useEffect, useState } from "react";
import { SiteFooter } from "@/components/home/SiteFooter";
import { useSiteContent } from "@/lib/site-content/useSiteContent";
import { MottoAbout } from "./MottoAbout";
import { MottoBigIdea } from "./MottoBigIdea";
import { MottoHeader } from "./MottoHeader";
import { MottoHero } from "./MottoHero";
import { MottoLoader } from "./MottoLoader";
import { MottoMarquee } from "./MottoMarquee";
import { MottoBetweenBanner } from "./MottoBetweenBanner";
import { MottoSmoothScroll } from "./MottoSmoothScroll";
import { MottoTrusted } from "./MottoTrusted";
import { MottoWork } from "./MottoWork";
import { BlogSection } from "@/components/store/BlogSection";

const INTRO_FAILSAFE_MS = 4000;

export function MottoHomePage() {
  const [entered, setEntered] = useState(false);

  const onLoaderComplete = useCallback(() => {
    setEntered(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("motto-page");
    return () => document.documentElement.classList.remove("motto-page");
  }, []);

  /** Prevent loader/hero stuck on back (bfcache) or cancelled timer */
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setEntered(true);
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  useEffect(() => {
    if (entered) return;
    const id = window.setTimeout(() => setEntered(true), INTRO_FAILSAFE_MS);
    return () => window.clearTimeout(id);
  }, [entered]);

  const { siteContent } = useSiteContent();
  const motto = siteContent.motto;

  return (
    <MottoSmoothScroll>
      <div className={`${styles.app} ${entered ? styles.appEntered : ""}`}>
        {!entered && <MottoLoader onComplete={onLoaderComplete} />}
        <MottoHeader theme="light" />
        <main id="main">
          <MottoHero
            ready={entered}
            slides={motto.mottoHeroSlides}
            rotatingWords={motto.homeRotatingWords}
          />
          <MottoMarquee items={motto.mottoMarqueeItems} />
          <MottoBigIdea />
          <MottoTrusted />
          <MottoWork />
          <BlogSection />
        </main>
        <SiteFooter className={styles.footerOnMotto} />
      </div>
    </MottoSmoothScroll>
  );
}
