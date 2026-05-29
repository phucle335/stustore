import styles from "@/styles/components/motto/MottoTrusted.module.css";
import { MottoBrandMarquee } from "./MottoBrandMarquee";

export function MottoTrusted() {
  return (
    <section className={styles.trusted} aria-label="Thương hiệu đối tác">
      <MottoBrandMarquee />
    </section>
  );
}
