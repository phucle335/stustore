export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    title: "Cách chọn sneaker phù hợp phong cách streetwear",
    excerpt:
      "Gợi ý phối đồ và chọn size chuẩn cho những đôi sneaker hot nhất mùa này.",
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
    date: "12 Tháng 3, 2026",
  },
  {
    id: "blog-2",
    title: "Xu hướng kính mát thể thao 2026",
    excerpt:
      "Khám phá các thiết kế sunglasses được yêu thích tại Stusport.",
    image:
      "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80",
    date: "5 Tháng 3, 2026",
  },
  {
    id: "blog-3",
    title: "Chăm sóc giày da và vải đúng cách",
    excerpt:
      "Bí quyết giữ form giày và màu sắc bền đẹp sau nhiều lần sử dụng.",
    image:
      "https://images.unsplash.com/photo-1460353589841-61cb21bbe436?w=800&q=80",
    date: "28 Tháng 2, 2026",
  },
  {
    id: "blog-4",
    title: "5 outfit với áo hoodie basic cho nam",
    excerpt:
      "Từ casual đến smart streetwear — phối hoodie với quần và giày thế nào cho hợp.",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
    date: "20 Tháng 2, 2026",
  },
  {
    id: "blog-5",
    title: "Dép slide: chọn đôi nào cho mùa hè?",
    excerpt:
      "So sánh Yeezy Slide, Crocs và Birkenstock — thoải mái, dễ vệ sinh và dễ phối.",
    image:
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80",
    date: "14 Tháng 2, 2026",
  },
  {
    id: "blog-6",
    title: "Túi backpack: size và chất liệu cần biết",
    excerpt:
      "Hướng dẫn chọn balo đi học, đi làm và đi gym — dung tích, đệm lưng và chống nước.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    date: "8 Tháng 2, 2026",
  },
];

export function getBlogPostById(id: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.id === id);
}

export function getBlogPostHref(id: string): string {
  return `/blog/${id}`;
}
