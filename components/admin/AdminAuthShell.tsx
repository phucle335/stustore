import type { ReactNode } from "react";

type AdminAuthShellProps = {
  children: ReactNode;
};

export function AdminAuthShell({ children }: AdminAuthShellProps) {
  return (
    <div className="admin-auth-page">
      <div className="admin-auth-page__inner">{children}</div>
    </div>
  );
}
