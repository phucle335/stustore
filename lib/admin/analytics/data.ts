import { createAdminSupabaseClient } from "@/lib/supabase/server";
import {
  TRAFFIC_SOURCE_COLORS,
  type AnalyticsDashboard,
} from "@/lib/admin/analytics/types";

const PRESENCE_WINDOW_MS = 2 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function emptyDashboard(note: string): AnalyticsDashboard {
  return {
    configured: false,
    liveVisitors: 0,
    sessionsOverTime: [],
    trafficSources: [],
    engagement: {
      avgPagesPerSession: "—",
      avgSessionDuration: "—",
      bounceRate: "—",
    },
    topPages: [],
    buttonClicks: [],
    vercel: {
      enabled: Boolean(process.env.NEXT_PUBLIC_VERCEL_URL),
      dashboardUrl: buildVercelAnalyticsUrl(),
      note,
    },
    lastUpdated: new Date().toISOString(),
  };
}

function buildVercelAnalyticsUrl(): string | null {
  const slug = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_URL;
  if (!slug) return null;
  const team = process.env.VERCEL_TEAM_SLUG;
  if (team) {
    return `https://vercel.com/${team}/${slug}/analytics`;
  }
  return "https://vercel.com/dashboard/analytics";
}

function referrerLabel(raw: string | null | undefined): string {
  if (!raw || raw.trim() === "") return "Trực tiếp (Direct)";
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    if (host.includes("google")) return "Google";
    if (host.includes("facebook") || host.includes("fb.")) return "Facebook";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("tiktok")) return "TikTok";
    if (host.includes("zalo")) return "Zalo";
    return host;
  } catch {
    return "Khác";
  }
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m <= 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function isMissingTableError(error: unknown): boolean {
  const msg =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: string }).message)
      : String(error);
  return (
    msg.includes("does not exist") ||
    msg.includes("analytics_page_views") ||
    msg.includes("schema cache")
  );
}

export async function fetchAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  let supabase;
  try {
    supabase = createAdminSupabaseClient();
  } catch {
    return emptyDashboard(
      "Thiếu SUPABASE_SERVICE_ROLE_KEY — chưa thể đọc analytics.",
    );
  }

  const since = new Date(Date.now() - 14 * DAY_MS).toISOString();
  const presenceCutoff = new Date(Date.now() - PRESENCE_WINDOW_MS).toISOString();

  try {
    const [
      presenceRes,
      viewsRes,
      eventsRes,
    ] = await Promise.all([
      supabase
        .from("analytics_presence")
        .select("session_id, last_seen_at")
        .gte("last_seen_at", presenceCutoff),
      supabase
        .from("analytics_page_views")
        .select("session_id, path, title, referrer, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(8000),
      supabase
        .from("analytics_events")
        .select("event_name, label, created_at")
        .eq("event_name", "click")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(2000),
    ]);

    if (presenceRes.error && isMissingTableError(presenceRes.error)) {
      return emptyDashboard(
        "Chạy file supabase/analytics.sql trong Supabase để bật theo dõi.",
      );
    }
    if (viewsRes.error) throw viewsRes.error;

    const views = viewsRes.data ?? [];
    const liveVisitors = (presenceRes.data ?? []).length;

    const sessionsByDay = new Map<string, Set<string>>();
    const referrerCounts = new Map<string, number>();
    const pathCounts = new Map<string, { title: string; views: number }>();
    const viewsBySession = new Map<string, { count: number; first: number; last: number }>();

    for (const row of views) {
      const created = new Date(row.created_at).getTime();
      const dayKey = new Date(row.created_at).toLocaleDateString("vi-VN", {
        weekday: "short",
      });
      if (!sessionsByDay.has(dayKey)) sessionsByDay.set(dayKey, new Set());
      sessionsByDay.get(dayKey)!.add(row.session_id);

      const ref = referrerLabel(row.referrer);
      referrerCounts.set(ref, (referrerCounts.get(ref) ?? 0) + 1);

      const pathKey = row.path || "/";
      const prev = pathCounts.get(pathKey);
      pathCounts.set(pathKey, {
        title: row.title || pathKey,
        views: (prev?.views ?? 0) + 1,
      });

      const sess = viewsBySession.get(row.session_id) ?? {
        count: 0,
        first: created,
        last: created,
      };
      sess.count += 1;
      sess.first = Math.min(sess.first, created);
      sess.last = Math.max(sess.last, created);
      viewsBySession.set(row.session_id, sess);
    }

    const sessionsOverTime = Array.from(sessionsByDay.entries()).map(
      ([label, set]) => ({ label, sessions: set.size }),
    );

    const refTotal = Array.from(referrerCounts.values()).reduce((a, b) => a + b, 0) || 1;
    const trafficSources = Array.from(referrerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], i) => ({
        name,
        value: Math.round((value / refTotal) * 100),
        fill: TRAFFIC_SOURCE_COLORS[i % TRAFFIC_SOURCE_COLORS.length],
      }));

    const sessionStats = Array.from(viewsBySession.values());
    const sessionCount = sessionStats.length || 1;
    const totalViews = sessionStats.reduce((s, x) => s + x.count, 0);
    const bounces = sessionStats.filter((x) => x.count <= 1).length;
    const totalDurationSec = sessionStats.reduce(
      (s, x) => s + Math.max(0, (x.last - x.first) / 1000),
      0,
    );

    const topPages = Array.from(pathCounts.entries())
      .map(([path, meta]) => ({ path, title: meta.title, views: meta.views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    const clickMap = new Map<string, number>();
    for (const ev of eventsRes.data ?? []) {
      const label = ev.label || "Khác";
      clickMap.set(label, (clickMap.get(label) ?? 0) + 1);
    }
    const buttonClicks = Array.from(clickMap.entries())
      .map(([label, clicks]) => ({ label, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 8);

    return {
      configured: true,
      liveVisitors,
      sessionsOverTime,
      trafficSources,
      engagement: {
        avgPagesPerSession: (totalViews / sessionCount).toFixed(1),
        avgSessionDuration: formatDuration(totalDurationSec / sessionCount),
        bounceRate: `${((bounces / sessionCount) * 100).toFixed(1)}%`,
      },
      topPages,
      buttonClicks,
      vercel: {
        enabled: true,
        dashboardUrl: buildVercelAnalyticsUrl(),
        note: "Bật Web Analytics trên Vercel Dashboard → Project → Analytics để xem thêm chi tiết.",
      },
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    if (isMissingTableError(error)) {
      return emptyDashboard(
        "Chạy file supabase/analytics.sql trong Supabase để bật theo dõi.",
      );
    }
    return emptyDashboard("Không tải được dữ liệu analytics.");
  }
}
