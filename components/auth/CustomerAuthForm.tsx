"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getForgotPasswordPath, mapAuthErrorMessage } from "@/lib/auth/password-reset";
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
  const resetSuccess = searchParams.get("reset") === "success";
  const resetLinkInvalid = searchParams.get("error") === "reset_link_invalid";

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
      setError("Please enter your full name.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setLoading(false);
      setError("Password must be at least 6 characters.");
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
          : "Missing Supabase configuration in .env.local.",
      );
      return;
    }

    const trimmedName = fullName.trim();

    if (isRegister) {
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          full_name: trimmedName,
        }),
      });
      const signupBody = (await signupRes.json()) as { error?: string };

      if (!signupRes.ok) {
        setLoading(false);
        setError(signupBody.error ?? "Registration failed.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        setLoading(false);
        setError(mapAuthErrorMessage(signInError.message));
        return;
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setLoading(false);
        setError(mapAuthErrorMessage(signInError.message));
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
      setError(syncBody.error ?? "Could not sync user profile.");
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
        {isRegister ? "Create Account" : "Sign In"}
      </h1>
      <p className={styles.customerAuthSubtitle}>
        {isRegister
          ? "Create an account to place orders."
          : "Sign in to continue."}
      </p>

      {isRegister ? (
        <label className={styles.customerAuthLabel}>
          Full Name
          <input
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={styles.customerAuthInput}
            placeholder="John Doe"
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
        Password
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

      {!isRegister ? (
        <p className={styles.customerAuthForgot}>
          <Link
            href={`${getForgotPasswordPath("customer")}?redirect=${encodeURIComponent(redirect)}`}
          >
            Forgot password?
          </Link>
        </p>
      ) : null}

      {isRegister ? (
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
      ) : null}

      {resetSuccess ? (
        <p className={styles.customerAuthInfo}>
          Password reset successful. Sign in with your new password.
        </p>
      ) : null}
      {resetLinkInvalid ? (
        <p className={styles.customerAuthError}>
          Invalid or expired password reset link.{" "}
          <Link href={getForgotPasswordPath("customer")}>Send new email</Link>.
        </p>
      ) : null}
      {error ? <p className={styles.customerAuthError}>{error}</p> : null}
      {info ? <p className={styles.customerAuthInfo}>{info}</p> : null}

      <button type="submit" disabled={loading} className={styles.customerAuthSubmit}>
        {loading
          ? "Processing…"
          : isRegister
            ? "Create Account"
            : "Sign In"}
      </button>

      <p className={styles.customerAuthSwitch}>
        {isRegister ? (
          <>
            Already have an account?{" "}
            <Link href={`/dang-nhap?redirect=${encodeURIComponent(redirect)}`}>
              Sign In
            </Link>
          </>
        ) : (
          <>
            No account yet?{" "}
            <Link href={`/dang-ky?redirect=${encodeURIComponent(redirect)}`}>
              Create one
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
