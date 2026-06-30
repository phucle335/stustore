import type { ReactNode } from "react";
import customerStyles from "@/styles/components/store/Customer.module.css";
import staticStyles from "@/styles/components/store/StoreStatic.module.css";

type CustomerPageWrapProps = {
  children: ReactNode;
  /** Login / checkout form — narrow column */
  narrow?: boolean;
  theme?: "light" | "dark";
  pageClassName?: string;
};

export function CustomerPageWrap({
  children,
  narrow = false,
  theme = "light",
  pageClassName,
}: CustomerPageWrapProps) {
  return (
    <div
      className={[
        staticStyles.staticPageWrap,
        customerStyles.customerPageWrap,
        theme === "dark" ? customerStyles.customerPageWrapDark : "",
        pageClassName,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          theme === "dark"
            ? staticStyles.staticPageDark
            : staticStyles.staticPage,
          customerStyles.customerPageSurface,
          narrow ? customerStyles.customerPageNarrow : "",
          theme === "dark" ? customerStyles.customerPageSurfaceDark : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
