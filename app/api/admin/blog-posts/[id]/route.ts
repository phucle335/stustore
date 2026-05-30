import { NextResponse } from "next/server";
import { withAdminApi, parseJsonBody } from "@/lib/admin/api";
import type { BlogCategoryId } from "@/lib/store/blog-categories";
import { parseBlogCategoryId } from "@/lib/store/blog-categories";
import type { BlogPost } from "@/lib/store/blog-content";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";

type Params = { id: string };

type UpdatePayload = {
  title: string;
  excerpt: string;
  image: string;
  date?: string | null;
  body: string;
  category?: string | null;
};

function isMissingCategoryColumn(message: string): boolean {
  return (
    message.includes("category") &&
    (message.includes("column") ||
      message.includes("schema cache") ||
      message.includes("does not exist"))
  );
}

function toBlogPost(row: Record<string, unknown>, category?: BlogCategoryId): BlogPost {
  return {
    id: String(row.id),
    title: String(row.title),
    excerpt: String(row.excerpt),
    image: String(row.image),
    date: row.date == null ? "" : String(row.date),
    body: String(row.body),
    category: parseBlogCategoryId(row.category) ?? category,
  };
}

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
    const category = parseBlogCategoryId(body.category) ?? "tips";

    if (!title || !excerpt || !image || !content.trim()) {
      return { ok: false, error: "Thiếu title/excerpt/image/body." };
    }

    const supabase = createAdminSupabaseClient();
    const payload = {
      id: postId,
      title,
      excerpt,
      image,
      date,
      body: content,
      category,
    };

    let { data, error } = await supabase
      .from("blog_posts")
      .upsert(payload, { onConflict: "id" })
      .select("id,title,excerpt,image,date,body,category")
      .single();

    let savedCategory = category;

    if (error && isMissingCategoryColumn(error.message)) {
      const { category: _ignored, ...legacyPayload } = payload;
      const retry = await supabase
        .from("blog_posts")
        .upsert(legacyPayload, { onConflict: "id" })
        .select("id,title,excerpt,image,date,body")
        .single();
      data = retry.data as typeof data;
      error = retry.error;
    }

    if (error) return { ok: false, error: error.message };

    const post = toBlogPost(data as Record<string, unknown>, savedCategory);
    return { ok: true, data: post };
  });
}

