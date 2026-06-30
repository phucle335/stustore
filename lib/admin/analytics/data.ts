import { countryLabel } from "@/lib/analytics/country-labels";
import {
  deviceLabel,
  shortSessionId,
} from "@/lib/analytics/parse-request";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import {
  TRAFFIC_SOURCE_COLORS,
  type AnalyticsDashboard,
  type BreakdownItem,
  type InteractionRow,
  type LiveVisitorRow,
  type OrderProfitRow,
  type TopProductRow,
} from "@/lib/admin/analytics/types";

const PRESENCE_WINDOW_MS = 2 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function emptyDashboard(note: string): AnalyticsDashboard {
  return {
    configured: false,
    liveVisitors: 0,
    liveVisitorsList: [],
    liveDeviceBreakdown: [],
    liveCountryBreakdown: [],
    sessionsOverTime: [],
    trafficSources: [],
    engagement: {
      avgPagesPerSession: "—",
      avgSessionDuration: "—",
      bounceRate: "—",
    },
    topPages: [],
    topProducts: [],
    buttonClicks: [],
    recentInteractions: [],
    orderProfit: {
      rows: [],
      totalProfit: 0,
      totalRevenue: 0,
      totalOrders: 0,
      totalItems: 0,
    },
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
  if (!raw || raw.trim() === "") return "Direct";
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    if (host.includes("google")) return "Google";
    if (host.includes("facebook") || host.includes("fb.")) return "Facebook";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("tiktok")) return "TikTok";
    if (host.includes("zalo")) return "Zalo";
    return host;
  } catch {
    return "Other";
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
    msg.includes("schema cache") ||
    msg.includes("column")
  );
}

function countBreakdown(
  rows: { key: string; label: string }[],
): BreakdownItem[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.label, (map.get(row.label) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

async function loadProductNames(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  ids: string[],
): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const map = new Map<string, string>();
  if (unique.length === 0) return map;

  const { data } = await supabase
    .from("products")
    .select("id, name")
    .in("id", unique.slice(0, 100));

  for (const row of data ?? []) {
    if (row.id && row.name) map.set(String(row.id), String(row.name));
  }
  return map;
}

export async function fetchAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  let supabase;
  try {
    supabase = createAdminSupabaseClient();
  } catch {
    return emptyDashboard(
      "Missing SUPABASE_SERVICE_ROLE_KEY — cannot read analytics.",
    );
  }

  const since = new Date(Date.now() - 14 * DAY_MS).toISOString();
  const presenceCutoff = new Date(Date.now() - PRESENCE_WINDOW_MS).toISOString();

  try {
    const [presenceRes, viewsRes, eventsRes, ordersRes] = await Promise.all([
      supabase
        .from("analytics_presence")
        .select(
          "session_id, path, device_type, country_code, last_seen_at, first_seen_at",
        )
        .gte("last_seen_at", presenceCutoff)
        .order("last_seen_at", { ascending: false })
        .limit(80),
      supabase
        .from("analytics_page_views")
        .select(
          "session_id, path, title, referrer, product_id, device_type, country_code, created_at",
        )
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(8000),
      supabase
        .from("analytics_events")
        .select(
          "session_id, event_name, label, path, product_id, device_type, country_code, created_at",
        )
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(3000),
      supabase
        .from("orders")
        .select("id, total_price, status, order_items, created_at")
        .neq("status", "cancelled")
        .gte("created_at", since)
        .order("created_at", { ascending: false }),
    ]);

    if (presenceRes.error && isMissingTableError(presenceRes.error)) {
      return emptyDashboard(
        "Run supabase/analytics.sql and analytics-v2.sql in Supabase.",
      );
    }
    if (viewsRes.error && isMissingTableError(viewsRes.error)) {
      return emptyDashboard(
        "Run supabase/analytics-v2.sql to enable device, country, and product tracking.",
      );
    }
    if (viewsRes.error) throw viewsRes.error;

    const presenceRows = presenceRes.data ?? [];
    const views = viewsRes.data ?? [];
    const events = eventsRes.data ?? [];
    const orders = ordersRes.data ?? [];
    const liveVisitors = presenceRows.length;

    const liveVisitorsList: LiveVisitorRow[] = presenceRows.map((row) => ({
      sessionShort: shortSessionId(row.session_id),
      path: row.path || "/",
      device: deviceLabel(row.device_type),
      country: countryLabel(row.country_code),
      lastSeen: row.last_seen_at,
    }));

    const liveDeviceBreakdown = countBreakdown(
      presenceRows.map((r) => ({
        key: r.session_id,
        label: deviceLabel(r.device_type),
      })),
    );
    const liveCountryBreakdown = countBreakdown(
      presenceRows.map((r) => ({
        key: r.session_id,
        label: countryLabel(r.country_code),
      })),
    );

    const sessionsByDay = new Map<string, Set<string>>();
    const referrerCounts = new Map<string, number>();
    const pathCounts = new Map<string, { title: string; views: number }>();
    const viewsBySession = new Map<
      string,
      { count: number; first: number; last: number }
    >();
    const productViews = new Map<string, number>();
    const productClicks = new Map<string, number>();

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

      if (row.product_id) {
        productViews.set(
          row.product_id,
          (productViews.get(row.product_id) ?? 0) + 1,
        );
      }

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

    const clickMap = new Map<string, number>();
    const recentRaw: {
      at: string;
      kind: "click" | "product_view";
      sessionId: string;
      label: string;
      path: string;
      productId: string | null;
      device: string;
      country: string;
    }[] = [];

    for (const ev of events) {
      const kind =
        ev.event_name === "product_view"
          ? ("product_view" as const)
          : ev.event_name === "click"
            ? ("click" as const)
            : null;
      if (!kind) continue;

      if (kind === "click") {
        const label = ev.label || "Other";
        clickMap.set(label, (clickMap.get(label) ?? 0) + 1);
        if (ev.product_id) {
          productClicks.set(
            ev.product_id,
            (productClicks.get(ev.product_id) ?? 0) + 1,
          );
        }
      }

      if (kind === "product_view" && ev.product_id) {
        productViews.set(
          ev.product_id,
          (productViews.get(ev.product_id) ?? 0) + 1,
        );
      }

      recentRaw.push({
        at: ev.created_at,
        kind,
        sessionId: ev.session_id,
        label: ev.label || (kind === "product_view" ? "Product View" : "Click"),
        path: ev.path || "/",
        productId: ev.product_id ?? null,
        device: deviceLabel(ev.device_type),
        country: countryLabel(ev.country_code),
      });
    }

    recentRaw.sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    );

    const productIds = [
      ...new Set([
        ...productViews.keys(),
        ...productClicks.keys(),
        ...recentRaw.map((r) => r.productId).filter(Boolean) as string[],
      ]),
    ];
    const productNames = await loadProductNames(supabase, productIds);

    const topProducts: TopProductRow[] = productIds
      .map((productId) => ({
        productId,
        name: productNames.get(productId) ?? productId,
        views: productViews.get(productId) ?? 0,
        clicks: productClicks.get(productId) ?? 0,
      }))
      .filter((p) => p.views > 0 || p.clicks > 0)
      .sort((a, b) => b.views + b.clicks - (a.views + a.clicks))
      .slice(0, 12);

    const recentInteractions: InteractionRow[] = recentRaw
      .slice(0, 40)
      .map((row) => ({
        at: row.at,
        kind: row.kind,
        sessionShort: shortSessionId(row.sessionId),
        label: row.label,
        path: row.path,
        productId: row.productId,
        productName: row.productId
          ? (productNames.get(row.productId) ?? null)
          : null,
        device: row.device,
        country: row.country,
      }));

    const sessionsOverTime = Array.from(sessionsByDay.entries()).map(
      ([label, set]) => ({ label, sessions: set.size }),
    );

    const refTotal =
      Array.from(referrerCounts.values()).reduce((a, b) => a + b, 0) || 1;
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

    const buttonClicks = Array.from(clickMap.entries())
      .map(([label, clicks]) => ({ label, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 12);

    // Calculate order profit
    const productIdSet = new Set<string>();
    for (const order of orders) {
      const items = Array.isArray(order.order_items) ? order.order_items : [];
      for (const item of items) {
        if (item && typeof item === "object" && "product_id" in item) {
          productIdSet.add(String((item as Record<string, unknown>).product_id));
        }
      }
    }
    const productPriceMap = new Map<string, { origin_price: number | null; price: number }>();
    if (productIdSet.size > 0) {
      const { data: productRows } = await supabase
        .from("products")
        .select("id, price, origin_price")
        .in("id", [...productIdSet]);
      for (const p of productRows ?? []) {
        productPriceMap.set(p.id, { origin_price: p.origin_price ?? null, price: p.price });
      }
    }

    const orderProfitRows: OrderProfitRow[] = [];
    let totalProfit = 0;
    let totalRevenue = 0;
    let totalItems = 0;
    for (const order of orders) {
      const items = Array.isArray(order.order_items) ? order.order_items : [];
      for (const item of items) {
        if (!item || typeof item !== "object") continue;
        const raw = item as Record<string, unknown>;
        const productId = raw.product_id ? String(raw.product_id) : null;
        const name = raw.name ? String(raw.name) : null;
        const unitPrice = Number(raw.unit_price) ?? 0;
        const quantity = Number(raw.quantity) ?? 1;
        const productInfo = productId ? productPriceMap.get(productId) : null;
        const originPrice = productInfo?.origin_price ?? null;
        const sellingPrice = unitPrice > 0 ? unitPrice : (productInfo?.price ?? 0);
        const profitPerItem = originPrice != null ? Math.max(0, sellingPrice - originPrice) : 0;
        const itemTotalProfit = profitPerItem * quantity;
        totalProfit += itemTotalProfit;
        totalRevenue += sellingPrice * quantity;
        totalItems += quantity;
        orderProfitRows.push({
          orderId: String(order.id),
          productId,
          productName: name,
          sellingPrice,
          originPrice,
          profit: profitPerItem,
          quantity,
          totalProfit: itemTotalProfit,
        });
      }
    }

    return {
      configured: true,
      liveVisitors,
      liveVisitorsList,
      liveDeviceBreakdown,
      liveCountryBreakdown,
      sessionsOverTime,
      trafficSources,
      engagement: {
        avgPagesPerSession: (totalViews / sessionCount).toFixed(1),
        avgSessionDuration: formatDuration(totalDurationSec / sessionCount),
        bounceRate: `${((bounces / sessionCount) * 100).toFixed(1)}%`,
      },
      topPages,
      topProducts,
      buttonClicks,
      recentInteractions,
      orderProfit: {
        rows: orderProfitRows,
        totalProfit,
        totalRevenue,
        totalOrders: orders.length,
        totalItems,
      },
      vercel: {
        enabled: true,
        dashboardUrl: buildVercelAnalyticsUrl(),
        note: "Country is derived from IP at Vercel deploy (x-vercel-ip-country header). Local often shows Undefined.",
      },
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    if (isMissingTableError(error)) {
      return emptyDashboard(
        "Run supabase/analytics.sql and analytics-v2.sql in Supabase.",
      );
    }
    return emptyDashboard("Could not load analytics data.");
  }
}
