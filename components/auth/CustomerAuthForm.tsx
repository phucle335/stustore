"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { StusportLogo } from "@/components/brand/StusportLogo";
import styles from "@/styles/components/store/Customer.module.css";

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
    <form onSubmit={handleSubmit} className={styles.customerAuthForm}>
      <div className={styles.customerAuthEyebrow}>
        <StusportLogo
          variant="mark"
          tone="on-light"
          href="/"
          className="stusport-logo--compact"
        />
      </div>
      <h1 className={styles.customerAuthTitle}>
        {isRegister ? "Đăng ký tài khoản" : "Đăng nhập"}
      </h1>
      <p className={styles.customerAuthSubtitle}>
        {isRegister
          ? "Tạo tài khoản để thanh toán đơn hàng."
          : "Đăng nhập để tiếp tục thanh toán."}
      </p>

      {isRegister ? (
        <label className={styles.customerAuthLabel}>
          Họ và tên
          <input
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={styles.customerAuthInput}
            placeholder="Nguyễn Văn A"
          />
        </label>
      ) : null}

      <label className={styles.customerAuthLabel}>
        Email
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.customerAuthInput}
          placeholder="ban@email.com"
        />
      </label>

      <label className={styles.customerAuthLabel}>
        Mật khẩu
        <input
          type="password"
          required
          autoComplete={isRegister ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.customerAuthInput}
          placeholder="••••••••"
          minLength={6}
        />
      </label>

      {isRegister ? (
        <label className={styles.customerAuthLabel}>
          Xác nhận mật khẩu
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.customerAuthInput}
            placeholder="••••••••"
            minLength={6}
          />
        </label>
      ) : null}

      {error ? <p className={styles.customerAuthError}>{error}</p> : null}
      {info ? <p className={styles.customerAuthInfo}>{info}</p> : null}

      <button type="submit" disabled={loading} className={styles.customerAuthSubmit}>
        {loading
          ? "Đang xử lý…"
          : isRegister
            ? "Đăng ký"
            : "Đăng nhập"}
      </button>

      <p className={styles.customerAuthSwitch}>
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
