"use client";

import "@/app/stusport.css";
import { useCallback, useEffect, useState } from "react";
import { SiteFooter } from "@/components/home/SiteFooter";
import { useSiteContent } from "@/lib/site-content/useSiteContent";
import { MottoAbout } from "./MottoAbout";
import { MottoBigIdea } from "./MottoBigIdea";
import { MottoHeader } from "./MottoHeader";
import { MottoHero } from "./MottoHero";
import { MottoInsights } from "./MottoInsights";
import { MottoLoader } from "./MottoLoader";
import { MottoMarquee } from "./MottoMarquee";
import { MottoMethod } from "./MottoMethod";
import { MottoBetweenBanner } from "./MottoBetweenBanner";
import { MottoSmoothScroll } from "./MottoSmoothScroll";
import { MottoTestimonials } from "./MottoTestimonials";
import { MottoTrusted } from "./MottoTrusted";
import { MottoWork } from "./MottoWork";

export function MottoHomePage() {
  const [loaded, setLoaded] = useState(false);
  const [heroReady, setHeroReady] = useState(false);

  const onLoaderComplete = useCallback(() => {
    setLoaded(true);
    setHeroReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("motto-page");
    return () => document.documentElement.classList.remove("motto-page");
  }, []);

  useEffect(() => {
    setHeroReady(true);
  }, []);

  const { siteContent } = useSiteContent();
  const motto = siteContent.motto;

  return (
    <MottoSmoothScroll>
      <div className="motto-app">
        {!loaded && <MottoLoader onComplete={onLoaderComplete} />}
        <MottoHeader theme="light" />
        <main id="main">
          <MottoHero
            ready={heroReady}
            slides={motto.mottoHeroSlides}
            rotatingWords={motto.homeRotatingWords}
          />
          <MottoMarquee items={motto.mottoMarqueeItems} />
          <MottoBigIdea />
          <MottoTrusted />
          <MottoWork />
          <MottoBetweenBanner banner={motto.mottoInsights.banner} />
          <MottoInsights
            introText={motto.mottoInsights.introText}
            cards={motto.mottoInsights.cards}
          />
          <MottoTestimonials />
          <MottoMethod />
          <MottoAbout />
        </main>
        <SiteFooter />
      </div>
    </MottoSmoothScroll>
  );
}
