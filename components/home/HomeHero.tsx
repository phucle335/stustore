import { HomeBrandMarquee } from "./HomeBrandMarquee";
import { HomeHeroCarousel } from "./HomeHeroCarousel";
import { HomeRotatingWord } from "./HomeRotatingWord";
import { StusportLogo } from "@/components/brand/StusportLogo";
import styles from "@/styles/components/home/HomeLegacy.module.css";

export function HomeHero() {
  return (
    <section className={styles.homeHero} aria-label="Trang chủ Stusport">
      <HomeHeroCarousel />

      <div className={styles.homeHeroIntro}>
        <HomeRotatingWord />
        <div className={styles.homeHeroTagline}>
          <p className={styles.homeHeroTaglinePrefix}>Inspired From</p>
          <StusportLogo variant="hero" size="L" />
        </div>
      </div>

      <HomeBrandMarquee />
    </section>
  );
}
