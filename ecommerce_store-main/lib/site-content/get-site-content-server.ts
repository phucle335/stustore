import { createStoreSupabaseClient } from "@/lib/supabase/store-server";
import {
  getDefaultSiteContent,
  mergeSiteContent,
  type SiteContent,
} from "@/lib/site-content/site-content";

export async function getSiteContentServer(): Promise<SiteContent> {
  try {
    const supabase = createStoreSupabaseClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_content")
      .maybeSingle();

    if (error) return getDefaultSiteContent();
    return mergeSiteContent(data?.value as Partial<SiteContent>);
  } catch {
    return getDefaultSiteContent();
  }
}

