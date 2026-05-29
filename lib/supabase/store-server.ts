import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let storeClient: SupabaseClient | undefined;

/**
 * Supabase anon client — đọc products theo RLS "Anyone can read products".
 * Dùng trong Server Components / Route Handlers storefront.
 */
export function createStoreSupabaseClient(): SupabaseClient {
  if (storeClient) return storeClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local",
    );
  }

  storeClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return storeClient;
}
