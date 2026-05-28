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
  pages: {
    support: {
      backgroundImage: string;
    };
    terms: {
      backgroundImage: string;
    };
    account: {
      backgroundImage: string;
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
    pages: {
      support: { backgroundImage: "" },
      terms: { backgroundImage: "" },
      account: { backgroundImage: "" },
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
  const pagesPartial = partial.pages;

  const motto: SiteContent["motto"] = {
    mottoHeroSlides: base.motto.mottoHeroSlides,
    homeRotatingWords: base.motto.homeRotatingWords,
    mottoMarqueeItems: base.motto.mottoMarqueeItems,
    mottoInsights: base.motto.mottoInsights,
  };

  if (mottoPartial && isObject(mottoPartial)) {
    motto.mottoHeroSlides =
      safeArray(mottoPartial.mottoHeroSlides).length > 0
        ? (mottoPartial.mottoHeroSlides as MottoHeroSlide[])
        : base.motto.mottoHeroSlides;
    motto.homeRotatingWords =
      safeArray(mottoPartial.homeRotatingWords).length > 0
        ? (mottoPartial.homeRotatingWords as string[])
        : base.motto.homeRotatingWords;
    motto.mottoMarqueeItems =
      safeArray(mottoPartial.mottoMarqueeItems).length > 0
        ? (mottoPartial.mottoMarqueeItems as string[])
        : base.motto.mottoMarqueeItems;
  }

  const insightsPartial =
    mottoPartial && isObject(mottoPartial) ? mottoPartial.mottoInsights : null;
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

  const pages: SiteContent["pages"] = {
    support: {
      backgroundImage:
        pagesPartial &&
        isObject(pagesPartial) &&
        isObject(pagesPartial.support) &&
        typeof pagesPartial.support.backgroundImage === "string"
          ? pagesPartial.support.backgroundImage
          : base.pages.support.backgroundImage,
    },
    terms: {
      backgroundImage:
        pagesPartial &&
        isObject(pagesPartial) &&
        isObject(pagesPartial.terms) &&
        typeof pagesPartial.terms.backgroundImage === "string"
          ? pagesPartial.terms.backgroundImage
          : base.pages.terms.backgroundImage,
    },
    account: {
      backgroundImage:
        pagesPartial &&
        isObject(pagesPartial) &&
        isObject(pagesPartial.account) &&
        typeof pagesPartial.account.backgroundImage === "string"
          ? pagesPartial.account.backgroundImage
          : base.pages.account.backgroundImage,
    },
  };

  return { motto, pages };
}

