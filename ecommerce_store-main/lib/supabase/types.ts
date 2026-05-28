export type UserRole = "user" | "admin";

export type OrderStatus =
  | "pending"
  | "pending_payment"
  | "deposit_paid"
  | "payment_verified"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type ProductSizeStock = {
  size?: string | null;
  quantity: number;
};

export type SupportRequestStatus = "open" | "resolved";

export type UserGender = "male" | "female" | "other" | "";

export type DbUser = {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  address?: string | null;
  birthday?: string | null;
  gender?: string | null;
  newsletter_opt_in?: boolean;
  personalized_recommendations?: boolean;
  personalized_ads?: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type MemberProfileInput = {
  full_name?: string;
  phone?: string | null;
  address?: string;
  birthday?: string | null;
  gender?: string | null;
  newsletter_opt_in?: boolean;
  personalized_recommendations?: boolean;
  personalized_ads?: boolean;
};

export type StoreProductCategory =
  | "sneakers"
  | "sunglasses"
  | "clothing"
  | "bags"
  | "watches";

export type ProductImageFields = {
  image_url_1: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
  image_url_4: string | null;
  image_url_5: string | null;
};

export type ProductFulfillmentType = "in_stock" | "pre_order";

export type DbProduct = {
  id: string;
  name: string;
  brand_tag: string;
  category?: StoreProductCategory;
  fulfillment_type?: ProductFulfillmentType | null;
  price: number;
  sale_percent?: number | null;
  description: string | null;
  sizes: ProductSizeStock[];
  created_at: string;
  updated_at: string;
} & ProductImageFields & {
    /** Cột cũ — chỉ đọc nếu DB vẫn có mảng images */
    images?: string[];
  };

export type OrderPaymentMethod =
  | "cod"
  | "bank_transfer"
  | "preorder_deposit"
  | "cod_deposit"
  | "bank_transfer_full";

export type DbOrder = {
  id: string;
  user_id: string | null;
  total_price: number;
  subtotal?: number | null;
  discount_amount?: number | null;
  coupon_code?: string | null;
  payment_method?: OrderPaymentMethod | string | null;
  is_preorder?: boolean | null;
  deposit_amount?: number | null;
  remaining_amount?: number | null;
  shipping_full_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  order_items?: unknown;
  order_meta?: Record<string, unknown> | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};

export type DbSupportRequest = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: SupportRequestStatus;
  handled_by: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminAuditLog = {
  id: string;
  admin_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  diff: Record<string, unknown>;
  created_at: string;
};

export type NotificationType =
  | "admin_action"
  | "support_request"
  | "order_event";

export type DbNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  created_at: string;
  read_at?: string | null;
};

export type CouponDiscountType = "percent" | "fixed";

export type DbCoupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: CouponDiscountType;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateCouponInput = {
  code: string;
  description?: string | null;
  discount_type: CouponDiscountType;
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number | null;
  is_active?: boolean;
  expires_at?: string | null;
};

export type UpdateCouponInput = Partial<CreateCouponInput>;

export type DbFavorite = {
  user_id: string;
  product_id: string;
  created_at: string;
};

export type CreateProductInput = {
  name: string;
  brand_tag: string;
  category: StoreProductCategory;
  fulfillment_type?: ProductFulfillmentType | null;
  price: number;
  sale_percent?: number | null;
  description?: string | null;
  sizes?: ProductSizeStock[];
} & ProductImageFields;

export type UpdateProductInput = Partial<CreateProductInput>;

export type CreateOrderInput = {
  user_id?: string | null;
  total_price: number;
  subtotal?: number | null;
  discount_amount?: number | null;
  coupon_code?: string | null;
  payment_method?: string | null;
  deposit_amount?: number | null;
  remaining_amount?: number | null;
  shipping_full_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  order_items?: unknown;
  order_meta?: Record<string, unknown> | null;
  status?: OrderStatus;
};

export type UpdateOrderInput = {
  user_id?: string | null;
  total_price?: number;
  subtotal?: number | null;
  discount_amount?: number | null;
  coupon_code?: string | null;
  payment_method?: string | null;
  deposit_amount?: number | null;
  remaining_amount?: number | null;
  shipping_full_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  order_items?: unknown;
  order_meta?: Record<string, unknown> | null;
  status?: OrderStatus;
};

export type UpdateUserInput = {
  email?: string;
  role?: UserRole;
};
