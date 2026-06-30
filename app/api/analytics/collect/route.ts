import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import {
  getCountryCodeFromRequest,
  parseDeviceType,
  parseProductIdFromPath,
} from "@/lib/analytics/parse-request";

type CollectBody = {
  type?: "pageview" | "heartbeat" | "click" | "product_view";
  sessionId?: string;
  path?: string;
  title?: string;
  referrer?: string;
  label?: string;
  productId?: string;
  deviceHint?: string;
};

async function parseBody(request: Request): Promise<CollectBody | null> {
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      return (await request.json()) as CollectBody;
    }
    const text = await request.text();
    if (!text) return null;
    return JSON.parse(text) as CollectBody;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await parseBody(request);
  if (!body) {
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
  const deviceType = parseDeviceType(userAgent, body.deviceHint);
  const countryCode = getCountryCodeFromRequest(request);
  const productId =
    body.productId?.slice(0, 80) ||
    parseProductIdFromPath(path) ||
    null;
  const now = new Date().toISOString();

  const presencePatch = {
    path,
    referrer,
    user_agent: userAgent,
    device_type: deviceType,
    country_code: countryCode,
    last_seen_at: now,
  };

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
        .update(presencePatch)
        .eq("session_id", sessionId);
    } else {
      await supabase.from("analytics_presence").insert({
        session_id: sessionId,
        ...presencePatch,
        first_seen_at: now,
      });
    }

    if (body.type === "pageview") {
      await supabase.from("analytics_page_views").insert({
        session_id: sessionId,
        path,
        title,
        referrer,
        product_id: productId,
        device_type: deviceType,
        country_code: countryCode,
        created_at: now,
      });

      if (productId) {
        await supabase.from("analytics_events").insert({
          session_id: sessionId,
          event_name: "product_view",
          label: title || `Product ${productId}`,
          path,
          product_id: productId,
          device_type: deviceType,
          country_code: countryCode,
          created_at: now,
        });
      }
    }

    if (body.type === "product_view" && productId) {
      await supabase.from("analytics_events").insert({
        session_id: sessionId,
        event_name: "product_view",
        label: body.label?.slice(0, 200) || title || `Product ${productId}`,
        path,
        product_id: productId,
        device_type: deviceType,
        country_code: countryCode,
        created_at: now,
      });
    }

    if (body.type === "click" && body.label) {
      await supabase.from("analytics_events").insert({
        session_id: sessionId,
        event_name: "click",
        label: body.label.slice(0, 200),
        path,
        product_id: productId,
        device_type: deviceType,
        country_code: countryCode,
        created_at: now,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
