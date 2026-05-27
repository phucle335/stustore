import { HomeBrandMarquee } from "./HomeBrandMarquee";
import { HomeHeroCarousel } from "./HomeHeroCarousel";
import { HomeRotatingWord } from "./HomeRotatingWord";
import { StusportLogo } from "@/components/brand/StusportLogo";

export function HomeHero() {
  return (
    <section className="home-hero" aria-label="Trang chủ Stusport">
      <HomeHeroCarousel />

      <div className="home-hero-intro">
        <HomeRotatingWord />
        <div className="home-hero-tagline">
          <p className="home-hero-tagline-prefix">Inspired From</p>
          <StusportLogo variant="hero" />
        </div>
      </div>

      <HomeBrandMarquee />
    </section>
  );
}
