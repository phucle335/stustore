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
import { StusportLogo } from "@/components/brand/StusportLogo";
import { useCart } from "./CartProvider";
import styles from "@/styles/components/store/CheckoutView.module.css";

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
  const [returnProductId, setReturnProductId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [bankTransfer, setBankTransfer] = useState<{
    bankName: string | null;
    accountNumber: string | null;
    accountName: string | null;
    amount: number | null;
    description: string | null;
    orderCode: number | null;
  } | null>(null);
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
  const qrImageSrc = useMemo(() => {
    if (!qrCode) return "";
    if (qrCode.startsWith("data:image") || qrCode.startsWith("http")) {
      return qrCode;
    }
    // PayOS can return raw VietQR payload text; convert it to a scannable image.
    return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=0&data=${encodeURIComponent(
      qrCode,
    )}`;
  }, [qrCode]);

  async function copyToClipboard(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // best-effort; ignore
    }
  }

  function markPaymentSuccess() {
    setPaymentSuccess(true);
    setQrModalOpen(false);
    setShowConfetti(true);
    setError(null);

    const orderId = payingOrderId;
    if (orderId) {
      router.replace(`/checkout/success?orderId=${encodeURIComponent(orderId)}`);
      return;
    }

    clearCart();
    setTimeout(() => setShowConfetti(false), 8000);
  }

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
            markPaymentSuccess();
          }
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [payingOrderId, clearCart]);

  useEffect(() => {
    if (!payingOrderId || paymentSuccess) return;

    const poller = window.setInterval(async () => {
      try {
        const res = await fetch("/api/account/orders", {
          credentials: "include",
        });
        const body = (await res.json()) as {
          data?: { id: string; status?: string }[];
        };
        const order = (body.data ?? []).find(
          (row) => String(row.id) === String(payingOrderId),
        );
        if (
          order?.status === "deposit_paid" ||
          order?.status === "payment_verified"
        ) {
          markPaymentSuccess();
        }
      } catch {
        // best-effort fallback polling; ignore transient errors
      }
    }, 3000);

    return () => window.clearInterval(poller);
  }, [payingOrderId, paymentSuccess]);

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
      const productId = returnProductId ?? items[0]?.productId ?? null;
      if (productId) {
        router.push(`/products/${productId}?order_cancelled=1&reason=timeout`);
      } else {
        router.push("/?order_cancelled=1&reason=timeout");
      }
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
      setReturnProductId(items[0]?.productId ?? null);
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
        bankTransfer?: {
          bankName?: string | null;
          accountNumber?: string | null;
          accountName?: string | null;
          amount?: number | null;
          description?: string | null;
          orderCode?: number | null;
        } | null;
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
      setBankTransfer(
        paymentBody.bankTransfer
          ? {
              bankName: paymentBody.bankTransfer.bankName ?? null,
              accountNumber: paymentBody.bankTransfer.accountNumber ?? null,
              accountName: paymentBody.bankTransfer.accountName ?? null,
              amount:
                paymentBody.bankTransfer.amount == null
                  ? null
                  : Number(paymentBody.bankTransfer.amount),
              description: paymentBody.bankTransfer.description ?? null,
              orderCode:
                paymentBody.bankTransfer.orderCode == null
                  ? null
                  : Number(paymentBody.bankTransfer.orderCode),
            }
          : null,
      );
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
      <div className={styles.checkoutThemeDark}>
      <div className={styles.checkoutCard}>
        <div className={styles.checkoutEyebrow}>
          <StusportLogo variant="mark" href="/" className="stusport-logo--compact" />
        </div>
        <h1>Thanh toán</h1>
        <p className={styles.checkoutMuted}>Giỏ hàng đang trống.</p>
        <Link href="/" className={styles.checkoutPrimaryBtn}>
          Về trang chủ
        </Link>
      </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutThemeDark}>
    <div className={styles.checkoutCard}>
      {showConfetti ? (
        <Confetti
          width={viewport.width}
          height={viewport.height}
          numberOfPieces={500}
          recycle={false}
        />
      ) : null}
      <div className={styles.checkoutEyebrow}>
        <StusportLogo variant="mark" href="/" className="stusport-logo--compact" />
      </div>
      <h1>Thanh toán</h1>
      <p className={styles.checkoutMuted}>
        Kiểm tra giỏ hàng, bấm <strong>Thanh toán</strong> để nhập thông tin
        giao hàng và chọn phương thức thanh toán.
      </p>
      {paymentSuccess ? (
        <p className={styles.checkoutPaymentNote}>
          Thanh toán thành công! Đơn hàng đã được ghi nhận. Vui lòng kiểm tra
          Zalo/Email để nhận hướng dẫn tiếp theo.
        </p>
      ) : null}

      <ul className={styles.checkoutItems}>
        {items.map((item) => (
          <li key={item.lineId} className={styles.checkoutItem}>
            <div className={styles.checkoutItemMedia}>
              <ProductImage
                src={item.image}
                alt={item.imageAlt}
                width={72}
                height={72}
                className={styles.checkoutItemImg}
              />
            </div>
            <div className={styles.checkoutItemBody}>
              <p className={styles.checkoutItemBrand}>{item.brand}</p>
              <p className={styles.checkoutItemName}>
                {item.name}
                {item.size ? ` — Size ${item.size}` : ""}
              </p>
              <p className={styles.checkoutItemQty}>Số lượng: {item.quantity}</p>
            </div>
            <div className={styles.checkoutItemPrice}>
              {formatPriceVnd(parsePriceVnd(item.price) * item.quantity)}
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.checkoutCoupon}>
        <label className={styles.checkoutCouponLabel}>Phiếu giảm giá</label>
        <div className={styles.checkoutCouponRow}>
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã"
            className={styles.checkoutCouponInput}
          />
          <button
            type="button"
            className={styles.checkoutCouponBtn}
            disabled={couponLoading}
            onClick={() => void applyCoupon()}
          >
            {couponLoading ? "…" : "Áp dụng"}
          </button>
        </div>
        {appliedCoupon ? (
          <p className={styles.checkoutCouponApplied}>
            Đã áp dụng {appliedCoupon.code} — giảm{" "}
            {formatPriceVnd(appliedCoupon.discount_amount)}
          </p>
        ) : null}
      </div>

      <div className={styles.checkoutTotal}>
        <span>Tạm tính</span>
        <span>{totalLabel}</span>
      </div>
      {appliedCoupon ? (
        <div className={`${styles.checkoutTotal} ${styles.checkoutTotalDiscount}`}>
          <span>Giảm giá</span>
          <span>-{formatPriceVnd(appliedCoupon.discount_amount)}</span>
        </div>
      ) : null}
      <div className={`${styles.checkoutTotal} ${styles.checkoutTotalFinal}`}>
        <span>Tổng thanh toán</span>
        <strong>{formatPriceVnd(finalVnd)}</strong>
      </div>

      {!showPayment ? (
        <button
          type="button"
          className={styles.checkoutPrimaryBtn}
          disabled={profileLoading}
          onClick={() => {
            setError(null);
            setShowPayment(true);
          }}
        >
          {profileLoading ? "Đang tải…" : "Thanh toán"}
        </button>
      ) : (
        <div className={styles.checkoutPaymentPanel}>
          <h2 className={styles.checkoutPaymentTitle}>Thông tin &amp; thanh toán</h2>

          {!profileLoading && profile ? (
            <div className={styles.checkoutProfileSummary}>
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

          <div className={styles.checkoutForm}>
            {needsName ? (
              <label className={styles.checkoutField}>
                <span>Họ tên người nhận *</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={styles.checkoutInput}
                  autoComplete="name"
                />
              </label>
            ) : null}

            {needsAddress ? (
              <label className={styles.checkoutField}>
                <span>Địa chỉ giao hàng chi tiết *</span>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`${styles.checkoutInput} ${styles.checkoutTextarea}`}
                  rows={3}
                  autoComplete="street-address"
                />
              </label>
            ) : null}

            <label className={styles.checkoutField}>
              <span>Số di động *</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={styles.checkoutInput}
                type="tel"
                autoComplete="tel"
                placeholder="09xxxxxxxx"
              />
            </label>

            <fieldset className={styles.checkoutPaymentMethods}>
              <legend>Phương thức thanh toán</legend>
              {isMixedFulfillment ? (
                <p className={styles.checkoutError}>
                  Giỏ hàng đang trộn 2 loại sản phẩm. Vui lòng tách đơn trước khi
                  thanh toán.
                </p>
              ) : isPreorderOrder ? (
                <label className={styles.checkoutPaymentOption}>
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
                  <label className={styles.checkoutPaymentOption}>
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPaymentMethod === "cod_deposit"}
                      onChange={() => setPaymentMethod("cod_deposit")}
                    />
                    <span>COD cọc 100.000đ</span>
                  </label>
                  <label className={styles.checkoutPaymentOption}>
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

            <p className={styles.checkoutPaymentHint}>{paymentHint}</p>
          </div>

          {error ? <p className={styles.checkoutError}>{error}</p> : null}

          <div className={styles.checkoutPaymentActions}>
            <button
              type="button"
              className={styles.checkoutSecondaryBtn}
              disabled={loading}
              onClick={() => setShowPayment(false)}
            >
              Quay lại
            </button>
            <button
              type="button"
              className={styles.checkoutPrimaryBtn}
              disabled={loading || isMixedFulfillment}
              onClick={() => void handleConfirmOrder()}
            >
              {loading ? "Đang xử lý…" : "Xác nhận đặt hàng"}
            </button>
          </div>
        </div>
      )}

      {error && !showPayment ? (
        <p className={styles.checkoutError}>{error}</p>
      ) : null}

      {qrModalOpen ? (
        <div
          className={styles.qrOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-qr-title"
        >
          <div className={styles.qrDialog}>
            <div className={styles.qrHeader}>
              <h3 id="checkout-qr-title" className={styles.qrTitle}>
                Quét mã QR để thanh toán
              </h3>
              <span className={styles.qrCountdown}>{countdownLabel}</span>
            </div>

            <div className={styles.qrGrid}>
              <section className={styles.qrPanel}>
                <p className={styles.qrPanelText}>
                  Quét mã bằng app ngân hàng hoặc ví điện tử
                </p>
                {qrImageSrc ? (
                  <img
                    src={qrImageSrc}
                    alt="PayOS QR"
                    className={styles.qrImage}
                  />
                ) : (
                  <p className={styles.qrFallback}>
                    Chưa tạo được ảnh QR. Bạn có thể mở cổng PayOS để thanh toán.
                  </p>
                )}
                {checkoutUrl ? (
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.qrPayosLink}
                  >
                    Mở cổng thanh toán PayOS
                  </a>
                ) : null}
              </section>

              <div className={styles.qrAside}>
                <section className={styles.qrPanel}>
                  <p className={styles.qrMetaLine}>
                    Mã đơn hàng: <strong>#{payingOrderId}</strong>
                  </p>
                  <p className={styles.qrMetaLine}>
                    Trạng thái: <strong>Chờ thanh toán</strong>
                  </p>
                  <p className={styles.qrMetaLine}>
                    Cần thanh toán:{" "}
                    <strong>{formatPriceVnd(payingAmount || payingTotal)}</strong>
                  </p>
                </section>

                {bankTransfer ? (
                  <section className={styles.qrPanel}>
                    <p className={styles.qrPanelTitle}>Thông tin chuyển khoản</p>
                    <div className={styles.qrBankList}>
                      <div className={styles.qrBankRow}>
                        <span className={styles.qrBankLabel}>Ngân hàng</span>
                        <div className={styles.qrBankValueWrap}>
                          <span className={styles.qrBankValue}>
                            {bankTransfer.bankName ?? "—"}
                          </span>
                          {bankTransfer.bankName ? (
                            <button
                              type="button"
                              className={styles.qrCopyBtn}
                              onClick={() => void copyToClipboard(bankTransfer.bankName!)}
                            >
                              Copy
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <div className={styles.qrBankRow}>
                        <span className={styles.qrBankLabel}>Số tài khoản</span>
                        <div className={styles.qrBankValueWrap}>
                          <span className={styles.qrBankValue}>
                            {bankTransfer.accountNumber ?? "—"}
                          </span>
                          {bankTransfer.accountNumber ? (
                            <button
                              type="button"
                              className={styles.qrCopyBtn}
                              onClick={() =>
                                void copyToClipboard(bankTransfer.accountNumber!)
                              }
                            >
                              Copy
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <div className={styles.qrBankRow}>
                        <span className={styles.qrBankLabel}>Chủ tài khoản</span>
                        <div className={styles.qrBankValueWrap}>
                          <span className={styles.qrBankValue}>
                            {bankTransfer.accountName ?? "—"}
                          </span>
                          {bankTransfer.accountName ? (
                            <button
                              type="button"
                              className={styles.qrCopyBtn}
                              onClick={() =>
                                void copyToClipboard(bankTransfer.accountName!)
                              }
                            >
                              Copy
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <div className={styles.qrBankRow}>
                        <span className={styles.qrBankLabel}>Số tiền</span>
                        <div className={styles.qrBankValueWrap}>
                          <span className={styles.qrBankValue}>
                            {Number.isFinite(Number(bankTransfer.amount))
                              ? formatPriceVnd(Number(bankTransfer.amount))
                              : formatPriceVnd(payingAmount || payingTotal)}
                          </span>
                          <button
                            type="button"
                            className={styles.qrCopyBtn}
                            onClick={() =>
                              void copyToClipboard(
                                String(
                                  (bankTransfer.amount ?? payingAmount) || payingTotal,
                                ),
                              )
                            }
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      <div className={styles.qrBankRow}>
                        <span className={styles.qrBankLabel}>Nội dung</span>
                        <div className={styles.qrBankValueWrap}>
                          <span
                            className={`${styles.qrBankValue} ${styles.qrBankValueNarrow}`}
                          >
                            {bankTransfer.description ?? `COC DON HANG ${payingOrderId}`}
                          </span>
                          <button
                            type="button"
                            className={styles.qrCopyBtn}
                            onClick={() =>
                              void copyToClipboard(
                                bankTransfer.description ?? `COC DON HANG ${payingOrderId}`,
                              )
                            }
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                ) : null}

                <section className={styles.qrPanel}>
                  <p className={styles.qrNotice}>
                    Nếu quá 05:00 mà chưa thanh toán, hệ thống sẽ tự đóng mã và hủy
                    đơn.
                  </p>
                  {qrCode && !qrImageSrc ? (
                    <p className={styles.qrRawPayload}>{qrCode}</p>
                  ) : null}
                </section>
              </div>
            </div>

            <div
              className={`${styles.checkoutPaymentActions} ${styles.checkoutPaymentActionsQr}`}
            >
              <button
                type="button"
                className={styles.checkoutSecondaryBtn}
                onClick={() => setQrModalOpen(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className={styles.checkoutPrimaryBtn}
                disabled={cancelling}
                onClick={() => void cancelExpiredOrder()}
              >
                {cancelling ? "Đang hủy…" : "Hủy đơn"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
    </div>
  );
}
