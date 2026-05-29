import { NextResponse } from "next/server";
import { createStoreSupabaseClient } from "@/lib/supabase/store-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Test nhanh quyền đọc products (anon + RLS “Anyone can read products”)
  let productsTest: { ok: boolean; count?: number; error?: string } = {
    ok: false,
  };

  try {
    if (hasUrl && hasAnonKey) {
      const supabase = createStoreSupabaseClient();
      const { count, error } = await supabase
        .from("products")
        .select("id", { count: "exact" })
        .limit(1);

      if (error) {
        productsTest = { ok: false, error: error.message };
      } else {
        productsTest = { ok: true, count: count ?? undefined };
      }
    } else {
      productsTest = { ok: false, error: "Missing supabase env vars" };
    }
  } catch (e) {
    productsTest = {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }

  return NextResponse.json(
    {
      env: {
        hasUrl,
        hasAnonKey,
        hasServiceRoleKey,
      },
      productsTest,
    },
    { status: 200 },
  );
}

