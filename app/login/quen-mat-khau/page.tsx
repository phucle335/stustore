import "@/styles/pages/admin-login.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Forgot Password | Stusport",
};

export default function AdminForgotPasswordPage() {
  return (
    <AdminAuthShell>
      <Suspense fallback={<div className="admin-auth-skeleton" aria-hidden />}>
        <ForgotPasswordForm audience="admin" />
      </Suspense>
    </AdminAuthShell>
  );
}
