import { BlogList } from "@/components/blog/BlogList";
import { StoreShell } from "@/components/store/StoreShell";

export const metadata = {
  title: "Blog — Stusport",
  description: "Tin tức, xu hướng sneaker và streetwear từ Stusport",
};

export default function BlogPage() {
  return (
    <StoreShell activeNav="blog">
      <BlogList />
    </StoreShell>
  );
}
