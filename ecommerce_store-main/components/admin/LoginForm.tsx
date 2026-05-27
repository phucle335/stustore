"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

const NOT_ADMIN_MESSAGE =
  "Tài khoản này không có quyền admin. Dùng email admin hoặc chạy SQL gán role admin trong Supabase.";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/admin";
  const queryError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    queryError === "not_admin" ? NOT_ADMIN_MESSAGE : null,
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (err) {
      setLoading(false);
      setError(
        err instanceof Error
          ? err.message
          : "Thiếu cấu hình Supabase. Điền NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY trong ecommerce_store-main/.env.local rồi khởi động lại npm run dev.",
      );
      return;
    }

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    const userId = signInData.user?.id;
    if (!userId) {
      setLoading(false);
      setError("Đăng nhập thất bại — không lấy được thông tin phiên.");
      return;
    }

    const syncRes = await fetch("/api/auth/sync-profile", {
      method: "POST",
      credentials: "include",
    });
    const syncBody = (await syncRes.json()) as { role?: string; error?: string };

    if (!syncRes.ok) {
      await supabase.auth.signOut();
      setLoading(false);
      setError(
        syncBody.error ??
          "Không đồng bộ được hồ sơ. Chạy supabase/admin-schema.sql trong Supabase SQL Editor.",
      );
      return;
    }

    if (syncBody.role !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      setError(NOT_ADMIN_MESSAGE);
      return;
    }

    // Full navigation so middleware nhận cookie session ngay lập tức
    window.location.assign(redirect);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
        Stusport Admin
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-white">Đăng nhập</h1>
      <p className="mt-1 text-sm text-slate-400">
        Chỉ tài khoản có quyền admin mới truy cập được dashboard.
      </p>

      <label className="mt-6 block text-sm font-medium text-slate-300">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-emerald-500/0 transition focus:ring-2"
          placeholder="admin@example.com"
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-slate-300">
        Mật khẩu
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:ring-2 focus:ring-emerald-500/40"
          placeholder="••••••••"
        />
      </label>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
      >
        {loading ? "Đang đăng nhập…" : "Vào Dashboard"}
      </button>
    </form>
  );
}
