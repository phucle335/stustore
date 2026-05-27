export const MOTTO_NAV = [
  { label: "Sneaker", href: "/sneakers" },
  { label: "Clothes", href: "/clothing" },
  { label: "Sunglasses", href: "/sunglasses" },
  { label: "Watches", href: "/watches" },
  { label: "Blog", href: "/blog" },
] as const;

export type MottoHeroSlide = {
  id: string;
  image: string;
  alt: string;
};

/** Banner hero — file: public/images/hero/slide-1.jpg … slide-5.jpg */
export const MOTTO_HERO_SLIDES: MottoHeroSlide[] = [
  {
    id: "hero-1",
    image: "/images/hero/slide-1.jpg",
    alt: "Kính mắt thời trang — A Vision of Style",
  },
  {
    id: "hero-2",
    image: "/images/hero/slide-2.jpg",
    alt: "Sneaker iconic — Iconic in Every Step",
  },
  {
    id: "hero-3",
    image: "/images/hero/slide-3.jpg",
    alt: "Eyewear thiết kế — Designed for Sunlight",
  },
  {
    id: "hero-4",
    image: "/images/hero/slide-4.jpg",
    alt: "Gentle Monster — Vision in Silence",
  },
  {
    id: "hero-5",
    image: "/images/hero/slide-5.jpg",
    alt: "Hot picks — Sneaker và phụ kiện thể thao",
  },
];

export const MOTTO_MARQUEE_ITEMS = [
  "Hàng chính hãng",
  "Miễn phí giao hàng",
  "Đổi trả đến 14 ngày",
] as const;

export const MOTTO_CASE_STUDIES = [
  {
    title: "Sneaker",
    subtitle: "Giày thể thao & streetwear",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
    href: "/sneakers",
  },
  {
    title: "Clothes",
    subtitle: "Quần áo thể thao",
    image:
      "https://images.unsplash.com/photo-1606105961732-6332674f4ee6?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    href: "/clothing",
  },
  {
    title: "Sunglasses",
    subtitle: "Kính mát thể thao",
    image:
      "https://images.unsplash.com/photo-1605813808456-26c16c0dfb77?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    href: "/sunglasses",
  },
  {
    title: "Watches",
    subtitle: "Đồng hồ thể thao",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80",
    href: "/watches",
  },
] as const;

export const MOTTO_INSIGHTS = [
  {
    title: "Cách chọn sneaker phù hợp phong cách streetwear",
    href: "/blog",
  },
  {
    title: "Xu hướng kính mát thể thao 2026",
    href: "/blog",
  },
  {
    title: "Chăm sóc giày da và vải đúng cách",
    href: "/blog",
  },
  {
    title: "Phối đồ training & lifestyle cùng Stusport",
    href: "/blog",
  },
  {
    title: "Đồng hồ thể thao — gợi ý chọn theo lifestyle",
    href: "/blog",
  },
  {
    title: "Hướng dẫn chọn size giày chuẩn khi mua online",
    href: "/blog",
  },
] as const;

export const MOTTO_TESTIMONIALS = [
  {
    name: "Minh Anh",
    company: "Khách hàng Sneaker",
    quote:
      "Giày chính hãng, đóng gói cẩn thận. Giao hàng nhanh và tư vấn size rất chu đáo.",
  },
  {
    name: "Hoàng Long",
    company: "Khách hàng Clothes",
    quote:
      "Đồ đẹp, form chuẩn. Mình hay mua đồ training ở đây vì chất lượng ổn định.",
  },
  {
    name: "Thu Hà",
    company: "Khách hàng Bags",
    quote:
      "Túi đẹp, chất lượng tốt. Giao hàng nhanh và đóng gói cẩn thận như mô tả.",
  },
  {
    name: "Quốc Bảo",
    company: "Khách hàng Watches",
    quote:
      "Đồng hồ đẹp, đúng mô tả. Stusport là địa chỉ mình tin tưởng cho phụ kiện thể thao.",
  },
  {
    name: "Lan Chi",
    company: "Khách hàng mới",
    quote:
      "Trải nghiệm mua sắm mượt, đổi size nhanh. Sẽ ủng hộ tiếp các drop mới.",
  },
  {
    name: "Đức Phát",
    company: "Khách VIP",
    quote:
      "Từ sneaker đến kính mát đều có đủ thương hiệu lớn. Dịch vụ hậu mãi rất tốt.",
  },
  {
    name: "Ngọc Trâm",
    company: "Khách hàng Sunglasses",
    quote:
      "Kính đẹp, chống UV tốt. Nhân viên tư vấn nhiệt tình qua chat.",
  },
  {
    name: "Văn Hùng",
    company: "Khách hàng Sneaker",
    quote:
      "Mình săn được đôi Jordan limited giá tốt. Packaging và chứng từ rõ ràng.",
  },
  {
    name: "Phương Linh",
    company: "Khách hàng Blog",
    quote:
      "Blog Stusport gợi ý phối đồ hay, giúp mình chọn outfit nhanh hơn rất nhiều.",
  },
  {
    name: "Tiến Đạt",
    company: "Khách quen",
    quote:
      "Mua nhiều lần vẫn hài lòng. Free ship đơn lớn và chính sách đổi trả minh bạch.",
  },
] as const;

export const MOTTO_TRUSTED_LOGOS = [
  "Nike",
  "Adidas",
  "Jordan",
  "Puma",
  "Gucci",
  "Ray-Ban",
] as const;

/** Logo thương hiệu — marquee trang chủ (phần Thương hiệu) */
export const PARTNER_BRAND_LOGO_URLS = [
  "https://assets.storims.com/storims_cdn/storims/uploads/117c7de16d9ba3dce8fda35c53d59993.png",
  "https://cdn.storims.com/api/v2/image/resize?path=https://storage.googleapis.com/storims_cdn/storims/uploads/d7a3438d43978c766a6cad2c62f9bab1.png",
  "https://assets.storims.com/storims_cdn/storims/uploads/0b099d876a9f1eb316999e416a2dd33e.png",
  "https://cdn.storims.com/api/v2/image/resize?path=https://storage.googleapis.com/storims_cdn/storims/uploads/c15d7c7861d5f434b2657f83bd32d2dc.png",
  "https://cdn.storims.com/api/v2/image/resize?path=https://storage.googleapis.com/storims_cdn/storims/uploads/1be23e1b83e76f7a21264d9565c8fc9a.png",
  "https://storage.googleapis.com/storims_cdn/storims/uploads/5fd08b87b8d60a26c9cc441a696452da.png",
  "https://storage.googleapis.com/storims_cdn/storims/uploads/4a8061e417f3cb19385c8f02861d1d47.png",
  "https://assets.storims.com/storims_cdn/storims/uploads/fe67cc11620f8241b85e6c9e5b653d65.png",
  "https://storage.googleapis.com/storims_cdn/storims/uploads/3263c82b69fa7e5003879fd33fc74ef8.png",
  "https://storage.googleapis.com/storims_cdn/storims/uploads/bd5761541f81d9e488543350d91c792a.png",
  "https://storage.googleapis.com/storims_cdn/storims/uploads/8bbd2e18b700189eb795a946b1c81379.png",
  "https://storage.googleapis.com/storims_cdn/storims/uploads/8194c87ad4fed24011a34adf3654d29e.png",
  "https://storage.googleapis.com/storims_cdn/storims/uploads/8431508fe4028618746281cfb64a873c.png",
  "https://storage.googleapis.com/storims_cdn/storims/uploads/be4435a73b7a9838d394f662f3e182ad.png",
  "https://storage.googleapis.com/storims_cdn/storims/uploads/a6573e29f63de5a0a49e99c2056ea7c9.png",
  "https://assets.storims.com/storims_cdn/storims/uploads/38b9d788b90a16c61e0abf621f8663a0.png",
  "https://assets.storims.com/storims_cdn/storims/uploads/6bd70630b34745af22cfbe5b90a5d66c.png",
  "https://assets.storims.com/storims_cdn/storims/uploads/bab0ef44a4de3c5dbb3527c990b8b7eb.png",
] as const;
