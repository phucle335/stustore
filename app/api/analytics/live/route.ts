import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const PRESENCE_WINDOW_MS = 2 * 60 * 1000;

export async function GET() {
  const since = new Date(Date.now() - PRESENCE_WINDOW_MS).toISOString();

  try {
    const supabase = createAdminSupabaseClient();
    const { count, error } = await supabase
      .from("analytics_presence")
      .select("*", { count: "exact", head: true })
      .gte("last_seen_at", since);

    if (error) throw error;

    return NextResponse.json(
      { visitors: count ?? 0 },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json({ visitors: 0 }, { status: 503 });
  }
}
