import Image from "next/image";
import { StusportLogo } from "@/components/brand/StusportLogo";
import styles from "@/styles/components/store/Blog.module.css";

export function HomeBrandShowcase() {
  return (
    <section className={styles.homeBrandShowcase}>
      <Image
        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
        alt="Không gian cửa hàng Stusport"
        fill
        className={styles.homeBrandShowcaseImg}
        sizes="100vw"
      />
      <div className={styles.homeBrandShowcaseOverlay} />
      <StusportLogo variant="hero" className={`${styles.homeBrandShowcaseText} stusport-logo--strip`} />
    </section>
  );
}
