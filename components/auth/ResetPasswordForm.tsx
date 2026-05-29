"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StusportLogo } from "@/components/brand/StusportLogo";
import {
  getForgotPasswordPath,
  getLoginPath,
  mapAuthErrorMessage,
  type PasswordResetAudience,
} from "@/lib/auth/password-reset";
import { getSupabaseClient } from "@/lib/supabase/client";
import styles from "@/styles/components/store/Customer.module.css";

type ResetPasswordFormProps = {
  audience: PasswordResetAudience;
};

export function ResetPasswordForm({ audience }: ResetPasswordFormProps) {
  const router = useRouter();
  const isAdmin = audience === "admin";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch {
      setChecking(false);
      setError("Thiếu cấu hình Supabase.");
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionReady(true);
        setChecking(false);
      }
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
      setChecking(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (err) {
      setLoading(false);
      setError(
        err instanceof Error ? err.message : "Thiếu cấu hình Supabase.",
      );
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setLoading(false);
      setError(mapAuthErrorMessage(updateError.message));
      return;
    }

    if (isAdmin) {
      const syncRes = await fetch("/api/auth/sync-profile", {
        method: "POST",
        credentials: "include",
      });
      const syncBody = (await syncRes.json()) as { role?: string };
      if (!syncRes.ok || syncBody.role !== "admin") {
        await supabase.auth.signOut();
        setLoading(false);
        setError(
          "Mật khẩu đã đổi nhưng tài khoản không có quyền admin.",
        );
        return;
      }
    }

    await supabase.auth.signOut();
    setLoading(false);

    const loginPath = getLoginPath(audience);
    router.push(`${loginPath}?reset=success`);
    router.refresh();
  }

  if (isAdmin) {
    if (checking) {
      return (
        <div className="admin-auth-card">
          <p className="admin-auth-card__subtitle">Đang xác thực link…</p>
        </div>
      );
    }

    if (!sessionReady) {
      return (
        <div className="admin-auth-card">
          <div className="admin-auth-card__logo">
            <StusportLogo
              variant="mark"
              tone="on-dark"
              href="/"
              className="stusport-logo--compact"
            />
          </div>
          <h1 className="admin-auth-card__title">Link không hợp lệ</h1>
          <p className="admin-auth-card__subtitle">
            Link đặt lại mật khẩu đã hết hạn hoặc đã được dùng. Yêu cầu gửi
            lại email mới.
          </p>
          <p className="admin-auth-back">
            <Link href={getForgotPasswordPath(audience)}>
              Gửi lại link đặt lại mật khẩu
            </Link>
          </p>
        </div>
      );
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
        <h1 className="admin-auth-card__title">Đặt lại mật khẩu</h1>
        <p className="admin-auth-card__subtitle">
          Nhập mật khẩu mới cho tài khoản admin.
        </p>

        <label className="admin-auth-field">
          Mật khẩu mới
          <input
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-auth-input"
            placeholder="••••••••"
            minLength={6}
          />
        </label>

        <label className="admin-auth-field">
          Xác nhận mật khẩu
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="admin-auth-input"
            placeholder="••••••••"
            minLength={6}
          />
        </label>

        {error ? (
          <p className="admin-auth-alert admin-auth-alert--error">{error}</p>
        ) : null}

        <button type="submit" disabled={loading} className="admin-auth-submit">
          {loading ? "Đang lưu…" : "Lưu mật khẩu mới"}
        </button>

        <p className="admin-auth-back">
          <Link href={getLoginPath(audience)}>← Quay lại đăng nhập</Link>
        </p>
      </form>
    );
  }

  if (checking) {
    return (
      <div className={styles.customerAuthForm}>
        <p className={styles.customerAuthSubtitle}>Đang xác thực link…</p>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className={styles.customerAuthForm}>
        <div className={styles.customerAuthEyebrow}>
          <StusportLogo
            variant="mark"
            tone="on-light"
            href="/"
            className="stusport-logo--compact"
          />
        </div>
        <h1 className={styles.customerAuthTitle}>Link không hợp lệ</h1>
        <p className={styles.customerAuthSubtitle}>
          Link đặt lại mật khẩu đã hết hạn hoặc đã được dùng. Yêu cầu gửi lại
          email mới.
        </p>
        <p className={styles.customerAuthSwitch}>
          <Link href={getForgotPasswordPath(audience)}>
            Gửi lại link đặt lại mật khẩu
          </Link>
        </p>
      </div>
    );
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
      <h1 className={styles.customerAuthTitle}>Đặt lại mật khẩu</h1>
      <p className={styles.customerAuthSubtitle}>
        Nhập mật khẩu mới cho tài khoản của bạn.
      </p>

      <label className={styles.customerAuthLabel}>
        Mật khẩu mới
        <input
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.customerAuthInput}
          placeholder="••••••••"
          minLength={6}
        />
      </label>

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

      {error ? <p className={styles.customerAuthError}>{error}</p> : null}

      <button type="submit" disabled={loading} className={styles.customerAuthSubmit}>
        {loading ? "Đang lưu…" : "Lưu mật khẩu mới"}
      </button>

      <p className={styles.customerAuthSwitch}>
        <Link href={getLoginPath(audience)}>← Quay lại đăng nhập</Link>
      </p>
    </form>
  );
}
