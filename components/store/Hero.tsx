import styles from "@/styles/components/store/Hero.module.css";
export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h2>DOMINATION</h2>
        <h3>
          Inspired From <span>World</span>
        </h3>
      </div>
    </section>
  );
}
