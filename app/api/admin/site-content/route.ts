import { NextResponse } from "next/server";
import { withAdminApi, parseJsonBody } from "@/lib/admin/api";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type { SiteContent } from "@/lib/site-content/site-content";
import {
  getDefaultSiteContent,
  mergeSiteContent,
} from "@/lib/site-content/site-content";

type UpdatePayload = {
  // Cho phép truyền partial để admin chỉ sửa một phần.
  value: Partial<SiteContent> | null;
};

export const dynamic = "force-dynamic";

export async function GET() {
  // Admin có thể đọc lại, nhưng hiện không cần — trả 405.
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PATCH(request: Request) {
  return withAdminApi(async () => {
    const body = await parseJsonBody<UpdatePayload>(request);
    if (!body) return { ok: false, error: "Invalid JSON body" };

    const supabase = createAdminSupabaseClient();

    const defaultContent = getDefaultSiteContent();
    const nextValue = body.value ?? defaultContent;

    // Merge để tránh admin vô tình gửi thiếu key.
    const merged = mergeSiteContent(nextValue);
    const payload = {
      key: "site_content",
      value: merged,
    };

    const { error } = await supabase
      .from("site_settings")
      .upsert(payload, { onConflict: "key" });

    if (error) return { ok: false, error: error.message };

    return { ok: true, data: { value: merged } };
  });
}

