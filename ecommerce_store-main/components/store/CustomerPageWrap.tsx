import type { ReactNode } from "react";

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
      className={`static-page-wrap customer-page-wrap${theme === "dark" ? " customer-page-wrap--dark" : ""}`}
    >
      <div
        className={`static-page customer-page${narrow ? " customer-page--narrow" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
