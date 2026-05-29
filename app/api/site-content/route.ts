import { NextResponse } from "next/server";
import { createStoreSupabaseClient } from "@/lib/supabase/store-server";
import type { SiteContent } from "@/lib/site-content/site-content";
import {
  getDefaultSiteContent,
  mergeSiteContent,
} from "@/lib/site-content/site-content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createStoreSupabaseClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_content")
      .maybeSingle();

    if (error) {
      // Nếu bảng chưa tồn tại hoặc query lỗi, fallback để không crash trang.
      return NextResponse.json({ data: getDefaultSiteContent() }, { status: 200 });
    }

    const merged = mergeSiteContent(data?.value as Partial<SiteContent>);
    return NextResponse.json({ data: merged }, { status: 200 });
  } catch {
    return NextResponse.json({ data: getDefaultSiteContent() }, { status: 200 });
  }
}

