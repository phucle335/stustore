"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProductImage } from "@/components/store/ProductImage";
import {
  formatPriceVnd,
  getCartTotalVnd,
  parsePriceVnd,
} from "@/lib/store/cart";
import {
  cartItemsToOrderItems,
  preorderDepositAmount,
  type CheckoutPaymentMethod,
} from "@/lib/store/checkout";
import { useCart } from "./CartProvider";

type MemberProfile = {
  full_name: string | null;
  phone: string | null;
  address: string | null;
  display_name?: string;
};

type CheckoutSuccess = {
  id: string;
};

export function CheckoutView() {
  const router = useRouter();
  const { items, totalLabel, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_amount: number;
    final_total: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("cod_deposit");

  const subtotalVnd = getCartTotalVnd(items);
  const finalVnd = appliedCoupon?.final_total ?? subtotalVnd;
  const depositVnd = preorderDepositAmount(finalVnd);
  const hasPreorderItems = items.some(
    (item) => item.fulfillmentType === "pre_order",
  );
  const hasInStockItems = items.some(
    (item) => item.fulfillmentType === "in_stock",
  );
  const isMixedFulfillment = hasPreorderItems && hasInStockItems;
  const isPreorderOrder = hasPreorderItems && !hasInStockItems;
  const isInStockOrder = hasInStockItems && !hasPreorderItems;

  const needsName = !profile?.full_name?.trim();
  const needsAddress = !profile?.address?.trim();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/account/profile", { credentials: "include" });
      const body = (await res.json()) as { data?: MemberProfile };
      if (!cancelled && body.data) {
        setProfile(body.data);
        setFullName(body.data.full_name?.trim() ?? "");
        setAddress(body.data.address?.trim() ?? "");
        setPhone(body.data.phone?.trim() ?? "");
      }
      if (!cancelled) setProfileLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPaymentMethod = useMemo<CheckoutPaymentMethod>(() => {
    if (isPreorderOrder) {
      return "preorder_deposit";
    }
    if (
      isInStockOrder &&
      !["cod_deposit", "bank_transfer_full"].includes(paymentMethod)
    ) {
      return "cod_deposit";
    }
    return paymentMethod;
  }, [isPreorderOrder, isInStockOrder, paymentMethod]);

  const paymentHint = useMemo(() => {
    if (isMixedFulfillment) {
      return "Giỏ hàng đang trộn sản phẩm pre-order và hàng có sẵn. Vui lòng tách thành 2 đơn để thanh toán.";
    }
    if (isPreorderOrder) {
      return `Số tiền cọc 50%: ${formatPriceVnd(depositVnd)}. Hệ thống xác nhận đơn sau khi nhận cọc.`;
    }
    if (selectedPaymentMethod === "cod_deposit") {
      return "Đơn hàng có sẵn: cọc trước 100.000đ, phần còn lại thanh toán COD khi nhận hàng.";
    }
    return "Chuyển khoản toàn bộ đơn hàng. Hệ thống xác nhận sau khi nhận tiền.";
  }, [depositVnd, isMixedFulfillment, isPreorderOrder, selectedPaymentMethod]);

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setError(null);

    const res = await fetch("/api/store/coupons/validate", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal: subtotalVnd }),
    });
    const body = (await res.json()) as {
      data?: {
        code: string;
        discount_amount: number;
        final_total: number;
      };
      error?: string;
    };

    setCouponLoading(false);

    if (!res.ok) {
      setAppliedCoupon(null);
      setError(body.error ?? "Mã không hợp lệ.");
      return;
    }

    if (body.data) setAppliedCoupon(body.data);
  }

  async function handleConfirmOrder() {
    if (items.length === 0) return;

    if (needsName && !fullName.trim()) {
      setError("Vui lòng nhập họ tên người nhận.");
      return;
    }
    if (needsAddress && !address.trim()) {
      setError("Vui lòng nhập địa chỉ giao hàng chi tiết.");
      return;
    }
    if (!phone.trim()) {
      setError("Vui lòng nhập số di động.");
      return;
    }

    if (isMixedFulfillment) {
      setError(
        "Giỏ hàng có cả pre-order và hàng có sẵn. Vui lòng tách giỏ hàng thành 2 đơn.",
      );
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/store/checkout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subtotal: subtotalVnd,
        total_price: finalVnd,
        coupon_code: appliedCoupon?.code ?? undefined,
        payment_method: selectedPaymentMethod,
        is_preorder: isPreorderOrder,
        shipping: {
          ...(needsName ? { full_name: fullName.trim() } : {}),
          ...(needsAddress ? { address: address.trim() } : {}),
          phone: phone.trim(),
        },
        items: cartItemsToOrderItems(items),
      }),
    });

    const body = (await res.json()) as {
      data?: CheckoutSuccess;
      error?: string;
    };

    setLoading(false);

    if (!res.ok) {
      if (res.status === 401) {
        router.push(
          `/dang-nhap?redirect=${encodeURIComponent("/checkout")}`,
        );
        return;
      }
      setError(body.error ?? "Không tạo được đơn hàng.");
      return;
    }

    clearCart();
    if (body.data?.id) {
      router.push(`/checkout/payment/${body.data.id}`);
      return;
    }
  }

  if (items.length === 0) {
    return (
      <div className="checkout-card">
        <p className="customer-page-eyebrow">Stusport</p>
        <h1>Thanh toán</h1>
        <p className="checkout-muted">Giỏ hàng đang trống.</p>
        <Link href="/" className="checkout-primary-btn">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-card">
      <p className="customer-page-eyebrow">Stusport</p>
      <h1>Thanh toán</h1>
      <p className="checkout-muted">
        Kiểm tra giỏ hàng, bấm <strong>Thanh toán</strong> để nhập thông tin
        giao hàng và chọn phương thức thanh toán.
      </p>

      <ul className="checkout-items">
        {items.map((item) => (
          <li key={item.lineId} className="checkout-item">
            <div className="checkout-item-media">
              <ProductImage
                src={item.image}
                alt={item.imageAlt}
                width={72}
                height={72}
                className="checkout-item-img"
              />
            </div>
            <div className="checkout-item-body">
              <p className="checkout-item-brand">{item.brand}</p>
              <p className="checkout-item-name">
                {item.name}
                {item.size ? ` — Size ${item.size}` : ""}
              </p>
              <p className="checkout-item-qty">Số lượng: {item.quantity}</p>
            </div>
            <div className="checkout-item-price">
              {formatPriceVnd(parsePriceVnd(item.price) * item.quantity)}
            </div>
          </li>
        ))}
      </ul>

      <div className="checkout-coupon">
        <label className="checkout-coupon-label">Phiếu giảm giá</label>
        <div className="checkout-coupon-row">
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã"
            className="checkout-coupon-input"
          />
          <button
            type="button"
            className="checkout-coupon-btn"
            disabled={couponLoading}
            onClick={() => void applyCoupon()}
          >
            {couponLoading ? "…" : "Áp dụng"}
          </button>
        </div>
        {appliedCoupon ? (
          <p className="checkout-coupon-applied">
            Đã áp dụng {appliedCoupon.code} — giảm{" "}
            {formatPriceVnd(appliedCoupon.discount_amount)}
          </p>
        ) : null}
      </div>

      <div className="checkout-total">
        <span>Tạm tính</span>
        <span>{totalLabel}</span>
      </div>
      {appliedCoupon ? (
        <div className="checkout-total checkout-total--discount">
          <span>Giảm giá</span>
          <span>-{formatPriceVnd(appliedCoupon.discount_amount)}</span>
        </div>
      ) : null}
      <div className="checkout-total checkout-total--final">
        <span>Tổng thanh toán</span>
        <strong>{formatPriceVnd(finalVnd)}</strong>
      </div>

      {!showPayment ? (
        <button
          type="button"
          className="checkout-primary-btn"
          disabled={profileLoading}
          onClick={() => {
            setError(null);
            setShowPayment(true);
          }}
        >
          {profileLoading ? "Đang tải…" : "Thanh toán"}
        </button>
      ) : (
        <div className="checkout-payment-panel">
          <h2 className="checkout-payment-title">Thông tin &amp; thanh toán</h2>

          {!profileLoading && profile ? (
            <div className="checkout-profile-summary">
              {profile.full_name?.trim() ? (
                <p>
                  <span>Người nhận</span>
                  <strong>{profile.full_name}</strong>
                </p>
              ) : null}
              {profile.address?.trim() ? (
                <p>
                  <span>Địa chỉ</span>
                  <strong>{profile.address}</strong>
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="checkout-form">
            {needsName ? (
              <label className="checkout-field">
                <span>Họ tên người nhận *</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="checkout-input"
                  autoComplete="name"
                />
              </label>
            ) : null}

            {needsAddress ? (
              <label className="checkout-field">
                <span>Địa chỉ giao hàng chi tiết *</span>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="checkout-input checkout-textarea"
                  rows={3}
                  autoComplete="street-address"
                />
              </label>
            ) : null}

            <label className="checkout-field">
              <span>Số di động *</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="checkout-input"
                type="tel"
                autoComplete="tel"
                placeholder="09xxxxxxxx"
              />
            </label>

            <fieldset className="checkout-payment-methods">
              <legend>Phương thức thanh toán</legend>
              {isMixedFulfillment ? (
                <p className="checkout-error">
                  Giỏ hàng đang trộn 2 loại sản phẩm. Vui lòng tách đơn trước khi
                  thanh toán.
                </p>
              ) : isPreorderOrder ? (
                <label className="checkout-payment-option">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPaymentMethod === "preorder_deposit"}
                    onChange={() => setPaymentMethod("preorder_deposit")}
                  />
                  <span>
                    Đơn pre-order cọc 50% chuyển khoản ({formatPriceVnd(depositVnd)})
                  </span>
                </label>
              ) : (
                <>
                  <label className="checkout-payment-option">
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPaymentMethod === "cod_deposit"}
                      onChange={() => setPaymentMethod("cod_deposit")}
                    />
                    <span>COD cọc 100.000đ</span>
                  </label>
                  <label className="checkout-payment-option">
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPaymentMethod === "bank_transfer_full"}
                      onChange={() => setPaymentMethod("bank_transfer_full")}
                    />
                    <span>Chuyển khoản toàn bộ đơn hàng</span>
                  </label>
                </>
              )}
            </fieldset>

            <p className="checkout-payment-hint">{paymentHint}</p>
          </div>

          {error ? <p className="checkout-error">{error}</p> : null}

          <div className="checkout-payment-actions">
            <button
              type="button"
              className="checkout-secondary-btn"
              disabled={loading}
              onClick={() => setShowPayment(false)}
            >
              Quay lại
            </button>
            <button
              type="button"
              className="checkout-primary-btn"
              disabled={loading || isMixedFulfillment}
              onClick={() => void handleConfirmOrder()}
            >
              {loading ? "Đang xử lý…" : "Xác nhận đặt hàng"}
            </button>
          </div>
        </div>
      )}

      {error && !showPayment ? (
        <p className="checkout-error">{error}</p>
      ) : null}
    </div>
  );
}
