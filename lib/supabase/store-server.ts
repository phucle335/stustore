import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let storeClient: SupabaseClient | undefined;

/**
 * Supabase anon client — reads products per RLS "Anyone can read products".
 * Used in Server Components / Route Handlers storefront.
 */
export function createStoreSupabaseClient(): SupabaseClient {
  if (storeClient) return storeClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }

  storeClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return storeClient;
}
