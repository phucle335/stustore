import { BLOG_POSTS, getBlogPostHref, type BlogPost } from "./blog-content";

export type HomeCategoryTile = {
  id: string;
  label: string;
  href: string;
  image: string;
  size: "large" | "small";
};

export type HomeBlogPost = BlogPost & { href: string };

export type HeroSlide = {
  id: string;
  image: string;
  alt: string;
  caption: string;
};

export const HERO_ROTATING_WORDS = [
  "DOMINATION",
  "AMBITION",
  "LIFE STYLE",
  "SIGNATURE",
] as const;

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    image: "/images/hero/slide-1.jpg",
    alt: "Sneaker thể thao đường phố",
    caption: "A VISION OF STYLE",
  },
  {
    id: "slide-2",
    image: "/images/hero/slide-2.jpg",
    alt: "Chạy bộ và training",
    caption: "PUSH YOUR LIMITS",
  },
  {
    id: "slide-3",
    image: "/images/hero/slide-3.jpg",
    alt: "Phòng gym và sức mạnh",
    caption: "BUILT FOR PERFORMANCE",
  },
  {
    id: "slide-4",
    image: "/images/hero/slide-4.jpg",
    alt: "Lifestyle thể thao",
    caption: "MOVE WITH CONFIDENCE",
  },
  {
    id: "slide-5",
    image: "/images/hero/slide-5.jpg",
    alt: "Đội nhóm và thể thao",
    caption: "GAME ON",
  },
];

export const BRAND_LOGOS = [
  "NIKE",
  "ADIDAS",
  "JORDAN",
  "NEW BALANCE",
  "PUMA",
  "GUCCI",
  "PRADA",
  "DIOR",
  "RAY-BAN",
  "ROLEX",
  "CHANEL",
  "OMEGA",
] as const;

/** Sneaker + Clothes (large), Sunglasses + Watches (small) */
export const HOME_CATEGORY_TILES: HomeCategoryTile[] = [
  {
    id: "sneakers",
    label: "Sneaker",
    href: "/sneakers",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
    size: "large",
  },
  {
    id: "clothing",
    label: "Clothes",
    href: "/clothing",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80",
    size: "large",
  },
  {
    id: "sunglasses",
    label: "Sunglasses",
    href: "/sunglasses",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
    size: "small",
  },
  {
    id: "watches",
    label: "Watches",
    href: "/watches",
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
    size: "small",
  },
];

export const HOME_BLOG_POSTS: HomeBlogPost[] = BLOG_POSTS.slice(0, 3).map(
  (post) => ({
    ...post,
    href: getBlogPostHref(post.id),
  }),
);
