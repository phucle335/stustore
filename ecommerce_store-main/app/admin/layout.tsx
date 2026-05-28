import type { Metadata } from "next";
import "./admin-dashboard.css";

export const metadata: Metadata = {
  title: "Admin Dashboard | Stusport",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-page-root">{children}</div>;
}
