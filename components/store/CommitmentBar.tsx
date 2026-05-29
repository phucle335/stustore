import styles from "@/styles/components/store/Header.module.css";
const COMMITMENTS = [
  { icon: "fa-shield-alt", text: "Cam kết hàng chính hãng" },
  { icon: "fa-truck", text: "Miễn phí giao hàng đơn từ 799k" },
  { icon: "fa-undo", text: "Miễn phí đổi trả đến 14 ngày" },
] as const;

export function CommitmentBar() {
  return (
    <div className={styles.commitmentBar} role="region" aria-label="Cam kết dịch vụ">
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
