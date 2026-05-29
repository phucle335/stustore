import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

type CollectBody = {
  type?: "pageview" | "heartbeat" | "click";
  sessionId?: string;
  path?: string;
  title?: string;
  referrer?: string;
  label?: string;
};

export async function POST(request: Request) {
  let body: CollectBody;
  try {
    body = (await request.json()) as CollectBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const sessionId = body.sessionId?.trim();
  if (!sessionId || sessionId.length > 120) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = (body.path || "/").slice(0, 500);
  const title = body.title?.slice(0, 300) ?? null;
  const referrer =
    body.referrer?.slice(0, 500) ||
    request.headers.get("referer")?.slice(0, 500) ||
    null;
  const userAgent = request.headers.get("user-agent")?.slice(0, 400) ?? null;
  const now = new Date().toISOString();

  try {
    const supabase = createAdminSupabaseClient();

    const { data: existing } = await supabase
      .from("analytics_presence")
      .select("session_id")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("analytics_presence")
        .update({
          path,
          referrer,
          user_agent: userAgent,
          last_seen_at: now,
        })
        .eq("session_id", sessionId);
    } else {
      await supabase.from("analytics_presence").insert({
        session_id: sessionId,
        path,
        referrer,
        user_agent: userAgent,
        first_seen_at: now,
        last_seen_at: now,
      });
    }

    if (body.type === "pageview") {
      await supabase.from("analytics_page_views").insert({
        session_id: sessionId,
        path,
        title,
        referrer,
        created_at: now,
      });
    }

    if (body.type === "click" && body.label) {
      await supabase.from("analytics_events").insert({
        session_id: sessionId,
        event_name: "click",
        label: body.label.slice(0, 200),
        path,
        created_at: now,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
