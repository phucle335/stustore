import { notFound } from "next/navigation";
import { BlogCategoryView } from "@/components/blog/BlogCategoryView";
import { getBlogPostsMerged } from "@/lib/blog/blog-cms";
import {
  BLOG_CATEGORIES,
  getBlogCategoryById,
  getPostsForCategory,
  parseBlogCategoryId,
} from "@/lib/store/blog-categories";
import { StoreShell } from "@/components/store/StoreShell";

type BlogCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams(): { id: string }[] {
  return BLOG_CATEGORIES.map((cat) => ({ id: cat.id }));
}

export async function generateMetadata({ params }: BlogCategoryPageProps) {
  const { id } = await params;
  const category = getBlogCategoryById(id);
  if (!category) {
    return { title: "Không tìm thấy — Stusport" };
  }
  return { title: `${category.label} — Blog Stusport` };
}

export default async function BlogCategoryPage({ params }: BlogCategoryPageProps) {
  const { id } = await params;
  const categoryId = parseBlogCategoryId(id);
  if (!categoryId) notFound();

  const category = getBlogCategoryById(categoryId);
  if (!category) notFound();

  const posts = await getBlogPostsMerged();
  const categoryPosts = getPostsForCategory(posts, categoryId);
  if (categoryPosts.length === 0) notFound();

  return (
    <StoreShell activeNav="blog">
      <BlogCategoryView category={category} posts={categoryPosts} />
    </StoreShell>
  );
}
