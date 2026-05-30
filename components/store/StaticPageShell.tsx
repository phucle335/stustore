import type { ReactNode } from "react";
import styles from "@/styles/components/store/StoreStatic.module.css";

type StaticPageShellProps = {
  children: ReactNode;
  backgroundImage?: string;
};

export function StaticPageShell({
  children,
  backgroundImage,
}: StaticPageShellProps) {
  const bg = backgroundImage?.trim();

  return (
    <div
      className={styles.staticPageWrap}
      style={
        bg
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className={styles.staticPageDark}>{children}</div>
    </div>
  );
}
