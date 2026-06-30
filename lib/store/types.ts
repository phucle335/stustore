export type NavId =
  | "home"
  | "sneakers"
  | "sunglasses"
  | "clothing"
  | "bags"
  | "watches"
  | "blog"
  | "stuclub";

export type ProductCategory = Exclude<NavId, "home" | "blog">;

export type ProductFulfillmentType = "in_stock" | "pre_order";

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
  fulfillmentType: ProductFulfillmentType;
  sizes?: string[];
  /** Available quantity per size label. */
  sizeStock?: Record<string, number>;
};

export type ProductDetail = Product & {
  category: ProductCategory;
  description: string;
  /** Admin product code — for lookup, URL /products/[code] */
  productCode?: string | null;
};
