import "@/styles/pages/admin-login.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login | Stusport",
};

export default function LoginPage() {
  return (
    <AdminAuthShell>
      <Suspense fallback={<div className="admin-auth-skeleton" aria-hidden />}>
        <LoginForm />
      </Suspense>
    </AdminAuthShell>
  );
}
