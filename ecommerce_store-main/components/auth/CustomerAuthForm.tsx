"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

type CustomerAuthFormProps = {
  mode: AuthMode;
};

export function CustomerAuthForm({ mode }: CustomerAuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    if (isRegister && !fullName.trim()) {
      setLoading(false);
      setError("Vui lòng nhập họ tên.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setLoading(false);
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (password.length < 6) {
      setLoading(false);
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (err) {
      setLoading(false);
      setError(
        err instanceof Error
          ? err.message
          : "Thiếu cấu hình Supabase trong .env.local.",
      );
      return;
    }

    const trimmedName = fullName.trim();

    if (isRegister) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: trimmedName },
        },
      });

      if (signUpError) {
        setLoading(false);
        setError(signUpError.message);
        return;
      }

      if (!data.session) {
        setLoading(false);
        setInfo(
          "Đăng ký thành công. Kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.",
        );
        return;
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setLoading(false);
        setError(signInError.message);
        return;
      }
    }

    const syncRes = await fetch("/api/auth/sync-profile", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isRegister ? { full_name: trimmedName } : {},
      ),
    });
    const syncBody = (await syncRes.json()) as { error?: string };

    if (!syncRes.ok) {
      setLoading(false);
      setError(syncBody.error ?? "Không đồng bộ được hồ sơ người dùng.");
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "stusport-last-activity",
        String(Date.now()),
      );
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="customer-auth-form">
      <p className="customer-auth-eyebrow">Stusport</p>
      <h1 className="customer-auth-title">
        {isRegister ? "Đăng ký tài khoản" : "Đăng nhập"}
      </h1>
      <p className="customer-auth-subtitle">
        {isRegister
          ? "Tạo tài khoản để thanh toán đơn hàng."
          : "Đăng nhập để tiếp tục thanh toán."}
      </p>

      {isRegister ? (
        <label className="customer-auth-label">
          Họ và tên
          <input
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="customer-auth-input"
            placeholder="Nguyễn Văn A"
          />
        </label>
      ) : null}

      <label className="customer-auth-label">
        Email
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="customer-auth-input"
          placeholder="ban@email.com"
        />
      </label>

      <label className="customer-auth-label">
        Mật khẩu
        <input
          type="password"
          required
          autoComplete={isRegister ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="customer-auth-input"
          placeholder="••••••••"
          minLength={6}
        />
      </label>

      {isRegister ? (
        <label className="customer-auth-label">
          Xác nhận mật khẩu
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="customer-auth-input"
            placeholder="••••••••"
            minLength={6}
          />
        </label>
      ) : null}

      {error ? <p className="customer-auth-error">{error}</p> : null}
      {info ? <p className="customer-auth-info">{info}</p> : null}

      <button type="submit" disabled={loading} className="customer-auth-submit">
        {loading
          ? "Đang xử lý…"
          : isRegister
            ? "Đăng ký"
            : "Đăng nhập"}
      </button>

      <p className="customer-auth-switch">
        {isRegister ? (
          <>
            Đã có tài khoản?{" "}
            <Link href={`/dang-nhap?redirect=${encodeURIComponent(redirect)}`}>
              Đăng nhập
            </Link>
          </>
        ) : (
          <>
            Chưa có tài khoản?{" "}
            <Link href={`/dang-ky?redirect=${encodeURIComponent(redirect)}`}>
              Đăng ký ngay
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
