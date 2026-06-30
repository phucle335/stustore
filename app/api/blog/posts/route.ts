import { NextResponse } from "next/server";
import { getBlogPostsMerged } from "@/lib/blog/blog-cms";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({ posts: [] });
  }

  const ids = idsParam.split(",").filter(Boolean);

  try {
    const allPosts = await getBlogPostsMerged();
    const filtered = allPosts.filter((post) => ids.includes(post.id));

    const sorted = ids
      .map((id) => filtered.find((post) => post.id === id))
      .filter(Boolean);

    return NextResponse.json({ posts: sorted });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json({ posts: [], error: "Failed to fetch posts" }, { status: 500 });
  }
}
