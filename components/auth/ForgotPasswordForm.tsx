"use client";

import Link from "next/link";
import { useState } from "react";
import { StusportLogo } from "@/components/brand/StusportLogo";
import {
  buildPasswordResetRedirectTo,
  getLoginPath,
  mapAuthErrorMessage,
  type PasswordResetAudience,
} from "@/lib/auth/password-reset";
import { getSupabaseClient } from "@/lib/supabase/client";
import styles from "@/styles/components/store/Customer.module.css";

type ForgotPasswordFormProps = {
  audience: PasswordResetAudience;
};

export function ForgotPasswordForm({ audience }: ForgotPasswordFormProps) {
  const isAdmin = audience === "admin";
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      setLoading(false);
      setError("Please enter a valid email.");
      return;
    }

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

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      trimmed,
      { redirectTo: buildPasswordResetRedirectTo(audience) },
    );

    setLoading(false);

    if (resetError) {
      setError(mapAuthErrorMessage(resetError.message));
      return;
    }

    setInfo(
      "If the email exists in our system, you will receive a password reset link in a few minutes. Check your spam folder too.",
    );
  }

  if (isAdmin) {
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
        <h1 className="admin-auth-card__title">Forgot Password</h1>
        <p className="admin-auth-card__subtitle">
          Enter your admin email to receive a password reset link.
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

        {error ? (
          <p className="admin-auth-alert admin-auth-alert--error">{error}</p>
        ) : null}
        {info ? (
          <p className="admin-auth-alert admin-auth-alert--info">{info}</p>
        ) : null}

        <button type="submit" disabled={loading} className="admin-auth-submit">
          {loading ? "Sending…" : "Send Password Reset Link"}
        </button>

        <p className="admin-auth-back">
          <Link href={getLoginPath(audience)}>← Back to Login</Link>
        </p>
      </form>
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
      <h1 className={styles.customerAuthTitle}>Forgot Password</h1>
      <p className={styles.customerAuthSubtitle}>
        Enter your registered email to receive a password reset link.
      </p>

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

      {error ? <p className={styles.customerAuthError}>{error}</p> : null}
      {info ? <p className={styles.customerAuthInfo}>{info}</p> : null}

      <button type="submit" disabled={loading} className={styles.customerAuthSubmit}>
        {loading ? "Sending…" : "Send Password Reset Link"}
      </button>

      <p className={styles.customerAuthSwitch}>
        <Link href={getLoginPath(audience)}>← Back to Login</Link>
      </p>
    </form>
  );
}
