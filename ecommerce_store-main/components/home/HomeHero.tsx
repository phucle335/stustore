import { STORE_NAME } from "@/lib/store/site";
import { HomeBrandMarquee } from "./HomeBrandMarquee";
import { HomeHeroCarousel } from "./HomeHeroCarousel";
import { HomeRotatingWord } from "./HomeRotatingWord";

export function HomeHero() {
  return (
    <section className="home-hero">
      <div className="home-hero-intro">
        <HomeRotatingWord />
        <h1 className="home-hero-title">
          Inspired From <span>{STORE_NAME}</span>
        </h1>
      </div>

      <HomeHeroCarousel />
      <HomeBrandMarquee />
    </section>
  );
}
