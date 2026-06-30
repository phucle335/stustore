import styles from "@/styles/components/motto/MottoTrusted.module.css";
import { MottoBrandMarquee } from "./MottoBrandMarquee";
import { HomeNewArrivalClient } from "@/components/home/HomeNewArrivalClient";

export function MottoTrusted() {
  return (
    <section className={styles.trusted} aria-label="Partner brands">
      <MottoBrandMarquee />
      <div className={styles.newArrivalWrapper}>
        <HomeNewArrivalClient />
      </div>
    </section>
  );
}
