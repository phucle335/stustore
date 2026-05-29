import "@/styles/pages/admin-login.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đăng nhập Admin | Stusport",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Suspense
        fallback={
          <div className="h-64 w-full max-w-md animate-pulse rounded-2xl bg-slate-900" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
