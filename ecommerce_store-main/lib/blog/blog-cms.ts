import type { BlogPost } from "@/lib/store/blog-content";
import { BLOG_POSTS } from "@/lib/store/blog-content";
import { createStoreSupabaseClient } from "@/lib/supabase/store-server";

type DbBlogPost = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string | null;
  body: string;
};

function pickDbFields(row: DbBlogPost): BlogPost {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    image: row.image,
    date: row.date ?? "",
    body: row.body,
  };
}

export async function getBlogPostsMerged(): Promise<BlogPost[]> {
  const supabase = createStoreSupabaseClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,excerpt,image,date,body");

  // Nếu chưa chạy SQL / bảng chưa tồn tại, fallback toàn bộ static.
  if (error || !data) return BLOG_POSTS;

  const byId = Object.fromEntries(
    (data as DbBlogPost[]).map((row) => [row.id, row]),
  ) as Record<string, DbBlogPost>;

  return BLOG_POSTS.map((post) => {
    const dbRow = byId[post.id];
    return dbRow ? pickDbFields(dbRow) : post;
  });
}

export async function getBlogPostByIdMerged(id: string): Promise<BlogPost | undefined> {
  const foundDefault = BLOG_POSTS.find((p) => p.id === id);
  if (!foundDefault) return undefined;

  const supabase = createStoreSupabaseClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,excerpt,image,date,body")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return foundDefault;
  return pickDbFields(data as DbBlogPost);
}

