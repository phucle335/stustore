import { HomeRotatingWord } from "@/components/home/HomeRotatingWord";
import styles from "@/styles/components/motto/MottoHero.module.css";

export function MottoHeroIntro({
  rotatingWords,
}: {
  rotatingWords?: readonly string[];
}) {
  return (
    <div className={styles.intro}>
      <HomeRotatingWord words={rotatingWords} />
    </div>
  );
}
