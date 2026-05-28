"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Confetti from "react-confetti";
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

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
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [payingTotal, setPayingTotal] = useState(0);
  const [payingAmount, setPayingAmount] = useState(0);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [expiresAt, setExpiresAt] = useState(0);
  const [nowTs, setNowTs] = useState(() => Math.floor(Date.now() / 1000));
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [viewport, setViewport] = useState({ width: 1280, height: 720 });
  const [cancelling, setCancelling] = useState(false);

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
  const remainingSeconds = useMemo(() => {
    if (!expiresAt) return 0;
    return Math.max(0, expiresAt - nowTs);
  }, [expiresAt, nowTs]);

  const countdownLabel = useMemo(() => {
    const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
    const seconds = String(remainingSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [remainingSeconds]);

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

  useEffect(() => {
    if (!qrModalOpen || !expiresAt || paymentSuccess) return;
    const timer = window.setInterval(() => {
      const current = Math.floor(Date.now() / 1000);
      setNowTs(current);
      if (current >= expiresAt) {
        window.clearInterval(timer);
        void cancelExpiredOrder();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [qrModalOpen, expiresAt, paymentSuccess, cancelExpiredOrder]);

  useEffect(() => {
    if (!supabaseClient || !payingOrderId) return;
    const channel = supabaseClient
      .channel(`checkout-order-${payingOrderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${payingOrderId}`,
        },
        (payload) => {
          const next = payload.new as { status?: string };
          if (next.status === "deposit_paid" || next.status === "payment_verified") {
            setPaymentSuccess(true);
            setQrModalOpen(false);
            setShowConfetti(true);
            setError(null);
            clearCart();
            setTimeout(() => setShowConfetti(false), 8000);
          }
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [payingOrderId, clearCart]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
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

  async function cancelExpiredOrder() {
    if (!payingOrderId || cancelling || paymentSuccess) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/cancel-order", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: payingOrderId }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Không thể hủy đơn quá hạn.");
      }
      setQrModalOpen(false);
      setError("Mã QR đã hết hạn sau 5 phút. Đơn hàng đã được hủy.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể hủy đơn quá hạn.",
      );
    } finally {
      setCancelling(false);
    }
  }

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

    if (body.data?.id) {
      setPayingOrderId(body.data.id);
      setPayingTotal(finalVnd);
      const paymentRes = await fetch("/api/create-payment-link", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: String(body.data.id),
          description: `COC DON HANG ${body.data.id}`,
        }),
      });
      const paymentBody = (await paymentRes.json()) as {
        checkoutUrl?: string | null;
        qrCode?: string | null;
        expiredAt?: number;
        data?: { amount?: number };
        error?: string;
        detail?: string;
      };

      if (!paymentRes.ok || !paymentBody.checkoutUrl) {
        const detail = paymentBody.detail ? ` (${paymentBody.detail})` : "";
        setError(
          `${paymentBody.error ?? "Không thể tạo link thanh toán PayOS."}${detail}`,
        );
        return;
      }

      setCheckoutUrl(paymentBody.checkoutUrl);
      setQrCode(paymentBody.qrCode ?? "");
      setExpiresAt(Number(paymentBody.expiredAt) || Math.floor(Date.now() / 1000) + 300);
      setPayingAmount(Number(paymentBody.data?.amount) || 0);
      setNowTs(Math.floor(Date.now() / 1000));
      setQrModalOpen(true);
    }
  }

  if (
    items.length === 0 &&
    !payingOrderId &&
    !qrModalOpen &&
    !paymentSuccess
  ) {
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
      {showConfetti ? (
        <Confetti
          width={viewport.width}
          height={viewport.height}
          numberOfPieces={500}
          recycle={false}
        />
      ) : null}
      <p className="customer-page-eyebrow">Stusport</p>
      <h1>Thanh toán</h1>
      <p className="checkout-muted">
        Kiểm tra giỏ hàng, bấm <strong>Thanh toán</strong> để nhập thông tin
        giao hàng và chọn phương thức thanh toán.
      </p>
      {paymentSuccess ? (
        <p className="checkout-payment-note">
          Thanh toán thành công! Đơn hàng đã được ghi nhận. Vui lòng kiểm tra
          Zalo/Email để nhận hướng dẫn tiếp theo.
        </p>
      ) : null}

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

      {qrModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-slate-950 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Quét mã QR để thanh toán
              </h3>
              <span className="rounded-full border border-orange-400/40 bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-200">
                {countdownLabel}
              </span>
            </div>

            <p className="mb-1 text-sm text-slate-300">
              Mã đơn: <strong>#{payingOrderId}</strong>
            </p>
            <p className="mb-3 text-sm text-slate-300">
              Số tiền cần thanh toán:{" "}
              <strong>{formatPriceVnd(payingAmount || payingTotal)}</strong>
            </p>

            {qrCode && qrCode.startsWith("data:image") ? (
              <img
                src={qrCode}
                alt="PayOS QR"
                className="mx-auto mb-3 h-64 w-64 rounded-xl border border-white/20 bg-white p-2"
              />
            ) : qrCode ? (
              <div className="mb-3 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-slate-100 break-all">
                {qrCode}
              </div>
            ) : null}

            {checkoutUrl ? (
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="mb-3 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900"
              >
                Mở cổng thanh toán PayOS
              </a>
            ) : null}

            <p className="text-xs text-slate-400">
              Nếu quá 05:00 mà chưa thanh toán, hệ thống sẽ tự đóng mã và hủy đơn.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="checkout-secondary-btn"
                onClick={() => setQrModalOpen(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="checkout-primary-btn"
                disabled={cancelling}
                onClick={() => void cancelExpiredOrder()}
              >
                {cancelling ? "Đang hủy..." : "Hủy đơn"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
