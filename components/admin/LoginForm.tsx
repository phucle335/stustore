"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { StusportLogo } from "@/components/brand/StusportLogo";
import { getForgotPasswordPath } from "@/lib/auth/password-reset";
import { getSupabaseClient } from "@/lib/supabase/client";

const NOT_ADMIN_MESSAGE =
  "Tài khoản này không có quyền admin. Dùng email admin hoặc chạy SQL gán role admin trong Supabase.";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/admin";
  const queryError = searchParams.get("error");
  const resetSuccess = searchParams.get("reset") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(() => {
    if (queryError === "not_admin") return NOT_ADMIN_MESSAGE;
    if (queryError === "reset_link_invalid") {
      return "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.";
    }
    return null;
  });
  const [info, setInfo] = useState<string | null>(
    resetSuccess ? "Đặt lại mật khẩu thành công. Đăng nhập bằng mật khẩu mới." : null,
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
          : "Thiếu cấu hình Supabase. Kiểm tra NEXT_PUBLIC_SUPABASE_URL và ANON_KEY trong .env.",
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

    window.location.assign(redirect);
  }

  return (
    <form onSubmit={handleSubmit} className="admin-auth-card">
      <div className="admin-auth-card__logo">
        <StusportLogo
          variant="mark"
          tone="on-dark"
          href="/"
          className="stusport-logo--compact"
        />
      </div>
      <h1 className="admin-auth-card__title">Đăng nhập Admin</h1>
      <p className="admin-auth-card__subtitle">
        Chỉ tài khoản có quyền admin mới truy cập được dashboard Stusport.
      </p>

      <label className="admin-auth-field">
        Email
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="admin-auth-input"
          placeholder="admin@stusport.vn"
        />
      </label>

      <label className="admin-auth-field">
        Mật khẩu
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="admin-auth-input"
          placeholder="••••••••"
        />
      </label>

      <p className="admin-auth-forgot">
        <Link href={getForgotPasswordPath("admin")}>Quên mật khẩu?</Link>
      </p>

      {info ? (
        <p className="admin-auth-alert admin-auth-alert--info">{info}</p>
      ) : null}

      {error ? (
        <p className="admin-auth-alert admin-auth-alert--error">
          {error}
          {queryError === "reset_link_invalid" ? (
            <>
              {" "}
              <Link href={getForgotPasswordPath("admin")}>Gửi lại email</Link>
            </>
          ) : null}
        </p>
      ) : null}

      <button type="submit" disabled={loading} className="admin-auth-submit">
        {loading ? "Đang đăng nhập…" : "Vào Dashboard"}
      </button>

      <p className="admin-auth-back">
        <Link href="/">← Về cửa hàng</Link>
      </p>
    </form>
  );
}
