import { NextResponse } from "next/server";
import { withAdminApi, parseJsonBody } from "@/lib/admin/api";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/store/blog-content";

export const dynamic = "force-dynamic";

type Params = { id: string };

type UpdatePayload = {
  title: string;
  excerpt: string;
  image: string;
  date?: string | null;
  body: string;
};

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT(
  request: Request,
  context: { params: Promise<Params> },
) {
  return withAdminApi(async () => {
    const { id } = await context.params;
    const body = await parseJsonBody<UpdatePayload>(request);
    if (!body) return { ok: false, error: "Invalid JSON body" };

    const postId = id.trim();
    if (!postId) return { ok: false, error: "Missing id" };

    const title = body.title?.trim();
    const excerpt = body.excerpt?.trim();
    const image = body.image?.trim();
    const content = body.body ?? "";
    const date = body.date ?? null;

    if (!title || !excerpt || !image || !content.trim()) {
      return { ok: false, error: "Thiếu title/excerpt/image/body." };
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .upsert(
        {
          id: postId,
          title,
          excerpt,
          image,
          date,
          body: content,
        },
        { onConflict: "id" },
      )
      .select("id,title,excerpt,image,date,body")
      .single();

    if (error) return { ok: false, error: error.message };

    const post = {
      id: data.id,
      title: data.title,
      excerpt: data.excerpt,
      image: data.image,
      date: data.date ?? "",
      body: data.body,
    } as BlogPost;

    return { ok: true, data: post };
  });
}

