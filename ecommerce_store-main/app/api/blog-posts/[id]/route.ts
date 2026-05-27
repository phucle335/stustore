import { NextResponse } from "next/server";
import { getBlogPostByIdMerged } from "@/lib/blog/blog-cms";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const post = await getBlogPostByIdMerged(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: post }, { status: 200 });
}

