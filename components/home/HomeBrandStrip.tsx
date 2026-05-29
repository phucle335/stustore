import { StusportLogo } from "@/components/brand/StusportLogo";
import styles from "@/styles/components/home/HomeLegacy.module.css";

export function HomeBrandStrip() {
  return (
    <section className={styles.homeBrandStrip} aria-hidden="true">
      <StusportLogo variant="hero" className="stusport-logo--strip" />
    </section>
  );
}
