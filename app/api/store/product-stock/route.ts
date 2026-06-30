import { NextResponse } from "next/server";
import { getProductStockMap } from "@/lib/store/products-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stock = await getProductStockMap();
    return NextResponse.json(stock);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load stock";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
