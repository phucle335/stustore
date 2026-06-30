import { createStoreSupabaseClient } from "@/lib/supabase/store-server";
import { mapDbProductToDetail } from "@/lib/store/map-product";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "sneakers";

  const supabase = createStoreSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .eq("product_status", "selling")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data) {
    return NextResponse.json({ products: [] }, { status: 200 });
  }

  const products = data
    .map((row) => {
      try {
        return mapDbProductToDetail(row as Record<string, unknown>);
      } catch {
        return null;
      }
    })
    .filter((product) => product !== null);

  return NextResponse.json({ products });
}
