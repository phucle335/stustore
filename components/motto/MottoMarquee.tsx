import { Fragment } from "react";
import styles from "@/styles/components/motto/MottoMarquee.module.css";

export function MottoMarquee({ items }: { items: readonly string[] }) {
  return (
    <div className={styles.marquee} role="region" aria-label="Cam kết dịch vụ">
      <div className={styles.marqueeTrack}>
        {items.map((item, index) => (
          <Fragment key={item}>
            {index > 0 ? (
              <span className={styles.marqueeDot} aria-hidden="true">
                •
              </span>
            ) : null}
            <span className={styles.marqueeItem}>{item}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
