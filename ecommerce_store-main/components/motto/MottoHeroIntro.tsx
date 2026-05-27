import { StusportLogo } from "@/components/brand/StusportLogo";
import { HomeRotatingWord } from "@/components/home/HomeRotatingWord";

export function MottoHeroIntro({
  rotatingWords,
}: {
  rotatingWords?: readonly string[];
}) {
  return (
    <div className="motto-hero-intro">
      <HomeRotatingWord words={rotatingWords} />
      <div className="motto-hero-tagline">
        <p className="motto-hero-tagline-prefix">Inspired From</p>
        <StusportLogo variant="hero" />
      </div>
    </div>
  );
}
