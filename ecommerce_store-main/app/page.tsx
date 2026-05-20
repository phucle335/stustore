import { HomeBlog } from "@/components/home/HomeBlog";
import { HomeBrandShowcase } from "@/components/home/HomeBrandShowcase";
import { HomeBrandStrip } from "@/components/home/HomeBrandStrip";
import { HomeCategoryGallery } from "@/components/home/HomeCategoryGallery";
import { HomeFeatured } from "@/components/home/HomeFeatured";
import { HomeHero } from "@/components/home/HomeHero";
import { StoreShell } from "@/components/store/StoreShell";

export default function HomePage() {
  return (
    <StoreShell activeNav="home">
      <HomeHero />
      <HomeBrandStrip />
      <HomeFeatured />
      <HomeCategoryGallery />
      <HomeBlog />
      <HomeBrandShowcase />
    </StoreShell>
  );
}
