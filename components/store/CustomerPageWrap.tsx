import type { ReactNode } from "react";
import customerStyles from "@/styles/components/store/Customer.module.css";
import staticStyles from "@/styles/components/store/StoreStatic.module.css";

type CustomerPageWrapProps = {
  children: ReactNode;
  /** Form đăng nhập / thanh toán — cột hẹp */
  narrow?: boolean;
  theme?: "light" | "dark";
};

export function CustomerPageWrap({
  children,
  narrow = false,
  theme = "light",
}: CustomerPageWrapProps) {
  return (
    <div
      className={`${staticStyles.staticPageWrap} ${customerStyles.customerPageWrap}${theme === "dark" ? ` ${customerStyles.customerPageWrapDark}` : ""}`}
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
