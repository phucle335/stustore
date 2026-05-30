import type { BlogCategoryId } from "@/lib/store/blog-categories";
import { parseBlogCategoryId } from "@/lib/store/blog-categories";
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

function pickDbFields(row: DbBlogPost, fallbackCategory?: BlogCategoryId): BlogPost {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    image: row.image,
    date: row.date ?? "",
    body: row.body,
    category: parseBlogCategoryId(row.category) ?? fallbackCategory,
  };
}

const BLOG_POST_SELECT = "id,title,excerpt,image,date,body,category";
const BLOG_POST_SELECT_LEGACY = "id,title,excerpt,image,date,body";

async function queryAllBlogPosts(): Promise<DbBlogPost[] | null> {
  const supabase = createStoreSupabaseClient();
  const initial = await supabase.from("blog_posts").select(BLOG_POST_SELECT);
  if (!initial.error) return (initial.data ?? []) as DbBlogPost[];

  if (isMissingCategoryColumn(initial.error.message)) {
    const legacy = await supabase.from("blog_posts").select(BLOG_POST_SELECT_LEGACY);
    if (legacy.error) return null;
    return (legacy.data ?? []) as DbBlogPost[];
  }

  return null;
}

export async function getBlogPostsMerged(): Promise<BlogPost[]> {
  const data = await queryAllBlogPosts();
  if (!data) return BLOG_POSTS;

  const byId = Object.fromEntries(data.map((row) => [row.id, row])) as Record<
    string,
    DbBlogPost
  >;
  const staticIds = new Set(BLOG_POSTS.map((post) => post.id));

  const mergedStatic = BLOG_POSTS.map((post) => {
    const dbRow = byId[post.id];
    if (dbRow) {
      return pickDbFields(dbRow, post.category);
    }
    return post;
  });

  const dbOnly = data
    .filter((row) => !staticIds.has(row.id))
    .map((row) => pickDbFields(row));

  return [...dbOnly, ...mergedStatic];
}

export async function getBlogPostByIdMerged(id: string): Promise<BlogPost | undefined> {
  const supabase = createStoreSupabaseClient();
  let { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_POST_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error && isMissingCategoryColumn(error.message)) {
    const legacy = await supabase
      .from("blog_posts")
      .select(BLOG_POST_SELECT_LEGACY)
      .eq("id", id)
      .maybeSingle();
    data = legacy.data as typeof data;
    error = legacy.error;
  }

  const foundDefault = BLOG_POSTS.find((post) => post.id === id);

  if (!error && data) {
    return pickDbFields(data as DbBlogPost, foundDefault?.category);
  }

  return foundDefault;
}
