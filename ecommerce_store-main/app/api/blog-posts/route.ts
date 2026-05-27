import { NextResponse } from "next/server";
import { getBlogPostsMerged } from "@/lib/blog/blog-cms";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await getBlogPostsMerged();
  return NextResponse.json({ data: posts }, { status: 200 });
}

