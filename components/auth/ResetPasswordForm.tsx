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
      setError("Missing Supabase configuration.");
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
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (err) {
      setLoading(false);
      setError(
        err instanceof Error ? err.message : "Missing Supabase configuration.",
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
          "Password changed, but the account does not have admin privileges.",
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
          <p className="admin-auth-card__subtitle">Verifying link…</p>
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
          <h1 className="admin-auth-card__title">Invalid Link</h1>
          <p className="admin-auth-card__subtitle">
            The password reset link has expired or already been used. Please request
            a new one.
          </p>
          <p className="admin-auth-back">
            <Link href={getForgotPasswordPath(audience)}>
              Send New Reset Link
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
        <h1 className="admin-auth-card__title">Reset Password</h1>
        <p className="admin-auth-card__subtitle">
          Enter your new password for the admin account.
        </p>

        <label className="admin-auth-field">
          New Password
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
          Confirm Password
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
          {loading ? "Saving…" : "Save New Password"}
        </button>

        <p className="admin-auth-back">
          <Link href={getLoginPath(audience)}>← Back to Login</Link>
        </p>
      </form>
    );
  }

  if (checking) {
    return (
      <div className={styles.customerAuthForm}>
        <p className={styles.customerAuthSubtitle}>Verifying link…</p>
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
        <h1 className={styles.customerAuthTitle}>Invalid Link</h1>
        <p className={styles.customerAuthSubtitle}>
          The password reset link has expired or already been used. Please request a new
          one.
        </p>
        <p className={styles.customerAuthSwitch}>
          <Link href={getForgotPasswordPath(audience)}>
            Send New Reset Link
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
      <h1 className={styles.customerAuthTitle}>Reset Password</h1>
      <p className={styles.customerAuthSubtitle}>
        Enter your new password for your account.
      </p>

      <label className={styles.customerAuthLabel}>
        New Password
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
        Confirm Password
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
        {loading ? "Saving…" : "Save New Password"}
      </button>

      <p className={styles.customerAuthSwitch}>
        <Link href={getLoginPath(audience)}>← Back to Login</Link>
      </p>
    </form>
  );
}
