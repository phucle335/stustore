"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { resolveDisplayName } from "@/lib/auth/display-name";
import {
  LAST_ACTIVITY_STORAGE_KEY,
  SESSION_INACTIVITY_MS,
} from "@/lib/auth/session-config";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CustomerUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  display_name: string;
};

type CustomerAuthContextValue = {
  user: CustomerUser | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  touchActivity: () => void;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(
  null,
);

function readLastActivity(): number {
  if (typeof window === "undefined") return Date.now();
  const raw = window.localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function writeLastActivity(at = Date.now()) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(at));
}

function isInactiveBeyondLimit(): boolean {
  return Date.now() - readLastActivity() > SESSION_INACTIVITY_MS;
}

export function CustomerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const body = (await res.json()) as {
      user?: {
        id: string;
        email: string | null;
        full_name: string | null;
        display_name: string;
      } | null;
    };

    if (body.user) {
      setUser({
        id: body.user.id,
        email: body.user.email,
        full_name: body.user.full_name,
        display_name: body.user.display_name,
      });
      writeLastActivity();
      return;
    }

    setUser(null);
  }, []);

  const signOut = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
    }
  }, []);

  const touchActivity = useCallback(() => {
    writeLastActivity();
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    let mounted = true;

    let supabase: SupabaseClient;
    try {
      supabase = getSupabaseClient();
    } catch {
      setLoading(false);
      return;
    }

    async function bootstrap() {
      try {
        if (isInactiveBeyondLimit()) {
          await supabase.auth.signOut();
          if (mounted) setUser(null);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (mounted) setUser(null);
          return;
        }

        writeLastActivity();
        await fetchProfile();
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "INITIAL_SESSION"
      ) {
        writeLastActivity();
        const metaName =
          typeof session.user.user_metadata?.full_name === "string"
            ? session.user.user_metadata.full_name
            : null;
        setUser({
          id: session.user.id,
          email: session.user.email ?? null,
          full_name: metaName,
          display_name: resolveDisplayName(
            metaName,
            session.user.email ?? null,
          ),
        });
        await fetchProfile();
      }
    });

    const onActivity = () => writeLastActivity();

    const events: (keyof WindowEventMap)[] = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    events.forEach((name) =>
      window.addEventListener(name, onActivity, { passive: true }),
    );

    const idleTimer = window.setInterval(async () => {
      if (!mounted || !isInactiveBeyondLimit()) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) await signOut();
    }, 60_000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      events.forEach((name) => window.removeEventListener(name, onActivity));
      window.clearInterval(idleTimer);
    };
  }, [fetchProfile, signOut]);

  const value = useMemo(
    () => ({
      user,
      loading,
      refreshProfile,
      signOut,
      touchActivity,
    }),
    [user, loading, refreshProfile, signOut, touchActivity],
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return ctx;
}
