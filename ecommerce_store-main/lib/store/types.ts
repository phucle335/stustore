export type NavId =
  | "home"
  | "sneakers"
  | "sunglasses"
  | "sandals"
  | "clothing"
  | "bags"
  | "perfume"
  | "watches"
  | "blog";

export type ProductCategory = Exclude<NavId, "home" | "blog">;

export type Product = {
  id: string;
  images: string[];
  imageAlt: string;
  brand: string;
  name: string;
  price: string;
  oldPrice?: string;
  /** Total units in stock (sum of sizeStock when sizes exist). */
  stock: number;
  sizes?: string[];
  /** Available quantity per size label. */
  sizeStock?: Record<string, number>;
};
