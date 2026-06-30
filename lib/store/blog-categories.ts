import type { BlogPost } from "@/lib/store/blog-content";

export type BlogCategoryId =
  | "tips"
  | "sneakers"
  | "clothing"
  | "accessories"
  | "watches";

export type BlogCategory = {
  id: BlogCategoryId;
  label: string;
};

export const BLOG_CATEGORIES: BlogCategory[] = [
  { id: "tips", label: "Tips & Tricks" },
  { id: "sneakers", label: "Sneakers" },
  { id: "clothing", label: "Clothing" },
  { id: "accessories", label: "Accessories" },
  { id: "watches", label: "Watches" },
];

/** Max posts per section on the main blog page */
export const BLOG_SECTION_PREVIEW_MAX = 4;

export function getBlogCategoryHref(categoryId: BlogCategoryId): string {
  return `/blog/danh-muc/${categoryId}`;
}

export function getBlogCategoryById(id: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((cat) => cat.id === id);
}

export function parseBlogCategoryId(value: unknown): BlogCategoryId | undefined {
  if (typeof value !== "string") return undefined;
  return BLOG_CATEGORIES.some((cat) => cat.id === value)
    ? (value as BlogCategoryId)
    : undefined;
}

const CATEGORY_BY_POST_ID: Partial<Record<string, BlogCategoryId>> = {
  "blog-1": "sneakers",
  "blog-2": "accessories",
  "blog-3": "tips",
  "blog-4": "clothing",
  "blog-5": "tips",
  "blog-6": "accessories",
};

export function getPostCategory(post: BlogPost): BlogCategoryId {
  if (post.category) return post.category;
  return CATEGORY_BY_POST_ID[post.id] ?? "tips";
}

export function groupPostsByCategory(
  posts: BlogPost[],
): { category: BlogCategory; posts: BlogPost[] }[] {
  const buckets = new Map<BlogCategoryId, BlogPost[]>();
  for (const cat of BLOG_CATEGORIES) {
    buckets.set(cat.id, []);
  }

  for (const post of posts) {
    const catId = getPostCategory(post);
    buckets.get(catId)?.push(post);
  }

  return BLOG_CATEGORIES.map((category) => ({
    category,
    posts: buckets.get(category.id) ?? [],
  })).filter((section) => section.posts.length > 0);
}

export function getPostsForCategory(
  posts: BlogPost[],
  categoryId: BlogCategoryId,
): BlogPost[] {
  return posts.filter((post) => getPostCategory(post) === categoryId);
}
