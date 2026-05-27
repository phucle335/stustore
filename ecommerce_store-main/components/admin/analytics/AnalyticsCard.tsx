import type { ReactNode } from "react";

type AnalyticsCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function AnalyticsCard({
  title,
  subtitle,
  children,
  className = "",
}: AnalyticsCardProps) {
  return (
    <section className={`admin-card ${className}`}>
      <div className="mb-4">
        <h3 className="admin-card-title">{title}</h3>
        {subtitle ? <p className="admin-card-sub">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
