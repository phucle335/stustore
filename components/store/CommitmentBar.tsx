import styles from "@/styles/components/store/Header.module.css";
const COMMITMENTS = [
  { icon: "fa-shield-alt", text: "100% Authentic Products" },
  { icon: "fa-truck", text: "Free shipping on orders from 799k" },
  { icon: "fa-undo", text: "Free returns within 7 days" },
] as const;

export function CommitmentBar() {
  return (
    <div className={styles.commitmentBar} role="region" aria-label="Service commitment">
      <div className={styles.commitmentBarInner}>
        {COMMITMENTS.map((item) => (
          <div key={item.text} className={styles.commitmentBarItem}>
            <i className={`fas ${item.icon}`} aria-hidden="true" />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
