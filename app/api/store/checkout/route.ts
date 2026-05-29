import { NextResponse } from "next/server";
import { loadMemberProfile } from "@/lib/account/load-member-profile";
import { requireAuthUser } from "@/lib/account/require-user";
import * as couponData from "@/lib/admin/data/coupons";
import type { CheckoutPaymentMethod } from "@/lib/store/checkout";
import { validateCouponForOrder } from "@/lib/store/apply-coupon";
import { canQueryProductIdInDatabase } from "@/lib/store/product-id";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

type CheckoutBody = {
  total_price?: number;
  subtotal?: number;
  coupon_code?: string;
  payment_method?: CheckoutPaymentMethod;
  is_preorder?: boolean;
  shipping?: {
    full_name?: string;
    phone?: string;
    address?: string;
  };
  items?: {
    product_id: string;
    name: string;
    brand?: string;
    size?: string;
    quantity: number;
    unit_price?: number;
    image?: string;
    fulfillment_type?: string;
  }[];
};

type ProductFulfillmentType = "in_stock" | "pre_order";

const PAYMENT_METHODS: CheckoutPaymentMethod[] = [
  "cod",
  "bank_transfer",
  "preorder_deposit",
  "cod_deposit",
  "bank_transfer_full",
];

function normalizeFulfillmentType(value: unknown): ProductFulfillmentType {
  return value === "pre_order" ? "pre_order" : "in_stock";
}

export async function POST(request: Request) {
  const auth = await requireAuthUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const user = auth.user;
  const metaName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;

  const profileResult = await loadMemberProfile(user.id, user.email!, metaName);
  if (!profileResult.ok) {
    return NextResponse.json({ error: profileResult.error }, { status: 500 });
  }

  const profile = profileResult.data;

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const paymentMethod = body.payment_method;

  if (!paymentMethod || !PAYMENT_METHODS.includes(paymentMethod)) {
    return NextResponse.json(
      { error: "Vui lòng chọn phương thức thanh toán." },
      { status: 400 },
    );
  }

  const shippingName =
    (body.shipping?.full_name?.trim() || profile.full_name?.trim() || "").trim();
  const shippingAddress =
    (body.shipping?.address?.trim() || profile.address?.trim() || "").trim();
  const shippingPhone =
    (body.shipping?.phone?.trim() || profile.phone?.trim() || "").trim();

  if (!profile.full_name?.trim() && !shippingName) {
    return NextResponse.json(
      { error: "Vui lòng nhập họ tên người nhận." },
      { status: 400 },
    );
  }

  if (!profile.address?.trim() && !shippingAddress) {
    return NextResponse.json(
      { error: "Vui lòng nhập địa chỉ giao hàng chi tiết." },
      { status: 400 },
    );
  }

  if (!shippingPhone) {
    return NextResponse.json(
      { error: "Vui lòng nhập số di động." },
      { status: 400 },
    );
  }

  const subtotal = Number(body.subtotal ?? body.total_price);
  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return NextResponse.json(
      { error: "Tổng đơn hàng không hợp lệ." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: "Giỏ hàng trống hoặc thiếu dữ liệu sản phẩm." },
      { status: 400 },
    );
  }

  let discountAmount = 0;
  let couponCode: string | null = null;
  let finalTotal = subtotal;

  if (body.coupon_code?.trim()) {
    const couponResult = await couponData.getCouponByCode(body.coupon_code);
    if (!couponResult.ok) {
      return NextResponse.json({ error: couponResult.error }, { status: 400 });
    }

    const validated = validateCouponForOrder(couponResult.data, subtotal);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    discountAmount = validated.discountAmount;
    finalTotal = validated.finalTotal;
    couponCode = validated.coupon.code;

    const inc = await couponData.incrementCouponUsage(couponCode);
    if (!inc.ok) {
      return NextResponse.json({ error: inc.error }, { status: 500 });
    }
  }

  const orderItems = body.items.map((row) => ({
    product_id: row.product_id,
    name: row.name,
    brand: row.brand ?? "",
    ...(row.size ? { size: row.size } : {}),
    quantity: row.quantity,
    unit_price: Number(row.unit_price) || 0,
    image: row.image ?? "",
    fulfillment_type: normalizeFulfillmentType(row.fulfillment_type),
  }));

  const supabase = await createAuthServerClient();

  const clientFulfillmentByProductId = new Map<string, ProductFulfillmentType>();
  const dbProductIds: string[] = [];

  for (const row of body.items) {
    const productId = row.product_id.trim();
    clientFulfillmentByProductId.set(
      productId,
      normalizeFulfillmentType(row.fulfillment_type),
    );
    if (canQueryProductIdInDatabase(productId)) {
      dbProductIds.push(productId);
    }
  }

  const fulfillmentSet = new Set<ProductFulfillmentType>();

  for (const [productId, fulfillmentType] of clientFulfillmentByProductId) {
    if (!canQueryProductIdInDatabase(productId)) {
      fulfillmentSet.add(fulfillmentType);
    }
  }

  const uniqueDbProductIds = Array.from(new Set(dbProductIds));
  if (uniqueDbProductIds.length > 0) {
    const fulfillmentRes = await supabase
      .from("products")
      .select("id, fulfillment_type")
      .in("id", uniqueDbProductIds);

    if (fulfillmentRes.error) {
      const isSchemaMissing = /column|schema cache|does not exist/i.test(
        fulfillmentRes.error.message,
      );
      if (!isSchemaMissing) {
        return NextResponse.json(
          {
            error: `Không kiểm tra được loại giao hàng: ${fulfillmentRes.error.message}`,
          },
          { status: 500 },
        );
      }
    }

    const fulfillmentByDbId = new Map<string, ProductFulfillmentType>();
    for (const row of fulfillmentRes.data ?? []) {
      fulfillmentByDbId.set(
        String(row.id),
        normalizeFulfillmentType(row.fulfillment_type),
      );
    }

    for (const productId of uniqueDbProductIds) {
      fulfillmentSet.add(
        fulfillmentByDbId.get(productId) ??
          clientFulfillmentByProductId.get(productId) ??
          "in_stock",
      );
    }
  }

  if (fulfillmentSet.size > 1) {
    return NextResponse.json(
      {
        error:
          "Đơn hàng có cả sản phẩm pre-order và hàng có sẵn. Vui lòng tách thành 2 đơn.",
      },
      { status: 400 },
    );
  }

  const derivedFulfillment: ProductFulfillmentType =
    fulfillmentSet.size === 1
      ? Array.from(fulfillmentSet)[0]
      : Boolean(body.is_preorder)
        ? "pre_order"
        : "in_stock";
  const isPreorder = derivedFulfillment === "pre_order";

  if (isPreorder && paymentMethod !== "preorder_deposit") {
    return NextResponse.json(
      { error: "Đơn pre-order chỉ thanh toán cọc 50% chuyển khoản." },
      { status: 400 },
    );
  }

  if (!isPreorder && paymentMethod === "preorder_deposit") {
    return NextResponse.json(
      { error: "Phương thức cọc pre-order chỉ dùng cho đơn pre-order." },
      { status: 400 },
    );
  }

  if (
    !isPreorder &&
    !["cod_deposit", "bank_transfer_full"].includes(paymentMethod)
  ) {
    return NextResponse.json(
      {
        error:
          "Đơn hàng có sẵn chỉ hỗ trợ COD cọc 100.000đ hoặc chuyển khoản toàn bộ.",
      },
      { status: 400 },
    );
  }

  const profileUpdate: Record<string, string> = {};
  if (!profile.full_name?.trim() && shippingName) {
    profileUpdate.full_name = shippingName;
  }
  if (!profile.address?.trim() && shippingAddress) {
    profileUpdate.address = shippingAddress;
  }
  if (shippingPhone && shippingPhone !== (profile.phone?.trim() ?? "")) {
    profileUpdate.phone = shippingPhone;
  }

  if (Object.keys(profileUpdate).length > 0) {
    await supabase.from("users").update(profileUpdate).eq("id", user.id);
  }

  const depositAmount = isPreorder
    ? Math.round(finalTotal * 0.5)
    : paymentMethod === "cod_deposit"
      ? Math.min(100000, finalTotal)
      : finalTotal;
  const remainingAmount = Math.max(0, finalTotal - depositAmount);

  const insertRow: Record<string, unknown> = {
    user_id: user.id,
    subtotal,
    discount_amount: discountAmount,
    coupon_code: couponCode,
    total_price: finalTotal,
    status: "pending_payment",
    payment_method: paymentMethod,
    is_preorder: isPreorder,
    deposit_amount: depositAmount,
    remaining_amount: remainingAmount,
    shipping_full_name: shippingName || profile.full_name,
    shipping_phone: shippingPhone,
    shipping_address: shippingAddress || profile.address,
    order_items: orderItems,
  };

  const inserted = await supabase
    .from("orders")
    .insert(insertRow)
    .select(
      "id, total_price, subtotal, discount_amount, coupon_code, status, created_at",
    )
    .single();

  let orderId: string | undefined = inserted.data?.id;
  let orderTotal = inserted.data
    ? Number(inserted.data.total_price)
    : finalTotal;
  let orderCreatedAt = inserted.data?.created_at;
  let insertError = inserted.error;

  if (insertError && /column|schema cache/i.test(insertError.message)) {
    const legacy = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        subtotal,
        discount_amount: discountAmount,
        coupon_code: couponCode,
        total_price: finalTotal,
        status: "pending",
      })
      .select("id, total_price, created_at")
      .single();
    orderId = legacy.data?.id;
    orderTotal = legacy.data ? Number(legacy.data.total_price) : finalTotal;
    orderCreatedAt = legacy.data?.created_at;
    insertError = legacy.error;
  }

  if (insertError || !orderId) {
    const msg = insertError?.message ?? "Không tạo được đơn hàng.";
    const needsRepair =
      /user_id|schema cache|column/i.test(msg) &&
      /user_id|could not find/i.test(msg);

    return NextResponse.json(
      {
        error: needsRepair
          ? `${msg} — Chạy supabase/repair-orders-table.sql trong Supabase SQL Editor, sau đó Reload schema (Settings → API).`
          : msg,
      },
      { status: 500 },
    );
  }

  // Notification for admin dashboard (order_event)
  try {
    await supabase.from("notifications").insert({
      type: "order_event",
      title: "Có đơn hàng mới",
      body: `Mã đơn: ${orderId}`,
      entity_type: "order",
      entity_id: String(orderId),
    });
  } catch (e) {
    // best-effort; notification không chặn checkout
    console.warn("[checkout][notification]", e);
  }

  return NextResponse.json({
    data: {
      id: orderId,
      total_price: orderTotal,
      subtotal,
      discount_amount: discountAmount,
      coupon_code: couponCode,
      status: "pending_payment",
      payment_method: paymentMethod,
      is_preorder: isPreorder,
      deposit_due: depositAmount,
      remaining_amount: remainingAmount,
      created_at: orderCreatedAt,
    },
  });
}
