import "@/styles/pages/admin-login.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Reset Password | Stusport",
};

export default function AdminResetPasswordPage() {
  return (
    <AdminAuthShell>
      <Suspense fallback={<div className="admin-auth-skeleton" aria-hidden />}>
        <ResetPasswordForm audience="admin" />
      </Suspense>
    </AdminAuthShell>
  );
}
