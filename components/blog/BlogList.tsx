import { BlogListView } from "@/components/blog/BlogListView";
import { getBlogPostsMerged } from "@/lib/blog/blog-cms";

export async function BlogList() {
  const posts = await getBlogPostsMerged();
  return <BlogListView posts={posts} />;
}
