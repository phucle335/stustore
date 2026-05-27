import type { ReactNode } from "react";

type CustomerPageWrapProps = {
  children: ReactNode;
  /** Form đăng nhập / thanh toán — cột hẹp */
  narrow?: boolean;
};

export function CustomerPageWrap({
  children,
  narrow = false,
}: CustomerPageWrapProps) {
  return (
    <div className="static-page-wrap customer-page-wrap">
      <div
        className={`static-page customer-page${narrow ? " customer-page--narrow" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
