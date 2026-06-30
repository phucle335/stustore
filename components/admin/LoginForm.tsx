"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { StusportLogo } from "@/components/brand/StusportLogo";
import { getForgotPasswordPath } from "@/lib/auth/password-reset";
import { getSupabaseClient } from "@/lib/supabase/client";

const NOT_ADMIN_MESSAGE =
  "This account does not have admin permissions. Use an admin email or run SQL to assign the admin role in Supabase.";

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
      return "Password reset link is invalid or has expired.";
    }
    return null;
  });
  const [info, setInfo] = useState<string | null>(
    resetSuccess ? "Password reset successful. Sign in with your new password." : null,
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
          : "Missing Supabase configuration. Check NEXT_PUBLIC_SUPABASE_URL and ANON_KEY in .env.",
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
      setError("Login failed — could not retrieve session information.");
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
          "Could not sync profile. Run supabase/admin-schema.sql in the Supabase SQL Editor.",
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
      <h1 className="admin-auth-card__title">Admin Login</h1>
      <p className="admin-auth-card__subtitle">
        Only accounts with admin permissions can access the Stusport dashboard.
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
        Password
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
        <Link href={getForgotPasswordPath("admin")}>Forgot password?</Link>
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
              <Link href={getForgotPasswordPath("admin")}>Resend email</Link>
            </>
          ) : null}
        </p>
      ) : null}

      <button type="submit" disabled={loading} className="admin-auth-submit">
        {loading ? "Signing in…" : "Go to Dashboard"}
      </button>

      <p className="admin-auth-back">
        <Link href="/">← Back to store</Link>
      </p>
    </form>
  );
}
