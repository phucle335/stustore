import type { MottoHeroSlide } from "@/lib/motto/content";
import {
  MOTTO_HERO_SLIDES,
  MOTTO_INSIGHTS,
  MOTTO_MARQUEE_ITEMS,
} from "@/lib/motto/content";
import { HERO_ROTATING_WORDS } from "@/lib/store/home-content";

export type SiteContent = {
  motto: {
    mottoHeroSlides: MottoHeroSlide[];
    homeRotatingWords: string[];
    mottoMarqueeItems: string[];
    mottoInsights: {
      introText: string;
      cards: { title: string; href: string }[];
      banner: null | {
        enabled: boolean;
        imageUrl: string;
        title: string;
        href: string;
      };
    };
  };
};

export function getDefaultSiteContent(): SiteContent {
  return {
    motto: {
      mottoHeroSlides: [...MOTTO_HERO_SLIDES],
      homeRotatingWords: [...HERO_ROTATING_WORDS],
      mottoMarqueeItems: [...MOTTO_MARQUEE_ITEMS],
      mottoInsights: {
        introText:
          "Gợi ý phối đồ, xu hướng sneaker và mẹo chăm sóc đồ thể thao từ Stusport.",
        cards: MOTTO_INSIGHTS.map((i) => ({ title: i.title, href: i.href })),
        banner: null,
      },
    },
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Merge partial content (from DB) into defaults.
 * DB có thể chưa có key, hoặc admin mới cập nhật một phần.
 */
export function mergeSiteContent(
  partial: Partial<SiteContent> | null | undefined,
): SiteContent {
  const base = getDefaultSiteContent();
  if (!partial || !isObject(partial)) return base;

  const mottoPartial = partial.motto;
  if (!mottoPartial || !isObject(mottoPartial)) return base;

  const motto: SiteContent["motto"] = {
    mottoHeroSlides:
      safeArray(mottoPartial.mottoHeroSlides).length > 0
        ? (mottoPartial.mottoHeroSlides as MottoHeroSlide[])
        : base.motto.mottoHeroSlides,
    homeRotatingWords:
      safeArray(mottoPartial.homeRotatingWords).length > 0
        ? (mottoPartial.homeRotatingWords as string[])
        : base.motto.homeRotatingWords,
    mottoMarqueeItems:
      safeArray(mottoPartial.mottoMarqueeItems).length > 0
        ? (mottoPartial.mottoMarqueeItems as string[])
        : base.motto.mottoMarqueeItems,
    mottoInsights: base.motto.mottoInsights,
  };

  const insightsPartial = mottoPartial.mottoInsights;
  if (insightsPartial && isObject(insightsPartial)) {
    motto.mottoInsights = {
      introText:
        typeof insightsPartial.introText === "string"
          ? insightsPartial.introText
          : base.motto.mottoInsights.introText,
      cards:
        safeArray(insightsPartial.cards).length > 0
          ? (insightsPartial.cards as { title: string; href: string }[])
          : base.motto.mottoInsights.cards,
      banner: (() => {
        // Nếu admin không gửi `banner` thì giữ giá trị mặc định hiện tại.
        // Nếu gửi `null` => tắt banner.
        const bannerPartial = (insightsPartial as unknown as {
          banner?: SiteContent["motto"]["mottoInsights"]["banner"];
        }).banner;

        if (bannerPartial === undefined) return base.motto.mottoInsights.banner;
        return bannerPartial;
      })(),
    };
  }

  return { motto };
}

