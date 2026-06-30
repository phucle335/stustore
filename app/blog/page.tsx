import { BlogList } from "@/components/blog/BlogList";
import "@/styles/pages/blog.css";
import { StoreShell } from "@/components/store/StoreShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog — Stusport",
  description: "Latest sneaker and streetwear news from Stusport",
};

export default function BlogPage() {
  return (
    <StoreShell activeNav="blog">
      <BlogList />
    </StoreShell>
  );
}
