"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Confetti from "react-confetti";
import { StusportLogo } from "@/components/brand/StusportLogo";
import { formatPriceVnd } from "@/lib/store/cart";
import { useCart } from "@/components/store/CartProvider";
import checkoutStyles from "@/styles/components/store/CheckoutView.module.css";
import customerStyles from "@/styles/components/store/Customer.module.css";
import successStyles from "@/styles/components/store/CheckoutSuccess.module.css";

type OrderRow = {
  id: string;
  status?: string | null;
  total_price?: number | null;
  deposit_amount?: number | null;
  remaining_amount?: number | null;
  order_items?: unknown;
};

type OrderItemRow = {
  name?: string;
  size?: string;
  quantity?: number;
  unit_price?: number;
};

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const { clearCart } = useCart();

  const [order, setOrder] = useState<OrderRow | null>(null);
  const [viewport, setViewport] = useState({ width: 1280, height: 720 });

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (!orderId) return;

    const run = async () => {
      try {
        await fetch(`/api/orders/${encodeURIComponent(orderId)}/confirm-payment`, {
          method: "POST",
          credentials: "include",
        });
      } catch {
        // best-effort
      }

      try {
        const res = await fetch("/api/account/orders", { credentials: "include" });
        const body = (await res.json()) as { data?: OrderRow[] };
        const found = (body.data ?? []).find((row) => String(row.id) === orderId);
        if (found) setOrder(found);
      } catch {
        // ignore
      }
    };

    void run();
  }, [orderId]);

  const deposit = useMemo(() => Number(order?.deposit_amount) || 0, [order]);
  const remaining = useMemo(
    () => Number(order?.remaining_amount) || 0,
    [order],
  );
  const total = useMemo(() => Number(order?.total_price) || 0, [order]);

  const orderItems = useMemo(() => {
    const raw = order?.order_items;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((it) => it as OrderItemRow)
      .filter((it) => {
        const name = typeof it?.name === "string" ? it.name.trim() : "";
        const qty = Math.max(0, Number(it?.quantity) || 0);
        return name.length > 0 && qty > 0;
      });
  }, [order]);

  return (
    <div className={`${checkoutStyles.checkoutThemeDark} ${successStyles.root}`}>
      <div className={successStyles.confettiLayer} aria-hidden>
        <Confetti
          width={viewport.width}
          height={viewport.height}
          recycle={false}
          numberOfPieces={480}
        />
      </div>

      <div className={successStyles.content}>
        <div className={customerStyles.customerPageEyebrow}>
          <StusportLogo
            variant="mark"
            tone="on-dark"
            href="/"
            className="stusport-logo--compact"
          />
        </div>

        <div className={successStyles.successBadge}>
          <span className={successStyles.successBadgeIcon} aria-hidden>
            ✓
          </span>
          Deposit payment successful
        </div>

        <h1 className={customerStyles.customerPageTitle}>Payment Successful</h1>
        <p className={customerStyles.customerPageSubtitle}>
          Your order has been received. Please check Zalo/Email for next steps.
        </p>

        <section className={successStyles.panel} aria-labelledby="success-order-summary">
          <h2 id="success-order-summary" className={successStyles.panelTitle}>
            Order Details
          </h2>
          <dl className={successStyles.summaryGrid}>
            <div className={successStyles.summaryItem}>
              <dt>Order ID</dt>
              <dd>#{orderId || "—"}</dd>
            </div>
            <div
              className={`${successStyles.summaryItem} ${successStyles.summaryItemHighlight}`}
            >
              <dt>Paid (Deposit)</dt>
              <dd>{formatPriceVnd(deposit)}</dd>
            </div>
            <div className={successStyles.summaryItem}>
              <dt>Remaining</dt>
              <dd>{formatPriceVnd(remaining)}</dd>
            </div>
            <div className={successStyles.summaryItem}>
              <dt>Order Total</dt>
              <dd>{formatPriceVnd(total)}</dd>
            </div>
          </dl>
        </section>

        {orderItems.length > 0 ? (
          <section
            className={successStyles.panel}
            aria-labelledby="success-order-items"
          >
            <h2 id="success-order-items" className={successStyles.panelTitle}>
              Purchased Products
            </h2>
            <ul className={successStyles.productList}>
              {orderItems.slice(0, 30).map((it, idx) => {
                const name = String(it.name);
                const size =
                  typeof it.size === "string" && it.size.trim()
                    ? ` · Size ${it.size.trim()}`
                    : "";
                const qty = Math.max(0, Number(it.quantity) || 0);
                const unit = Math.max(0, Number(it.unit_price) || 0);
                return (
                  <li
                    key={`${idx}-${name}`}
                    className={successStyles.productCard}
                  >
                    <p className={successStyles.productName}>
                      {name}
                      {size ? (
                        <span className={successStyles.productSize}>{size}</span>
                      ) : null}
                    </p>
                    <span className={successStyles.productQty}>×{qty}</span>
                    <p className={successStyles.productPrice}>
                      Unit price:{" "}
                      <strong>{unit ? formatPriceVnd(unit) : "—"}</strong>
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <div
          className={`${checkoutStyles.checkoutPaymentActions} ${successStyles.actions}`}
        >
          <Link href="/tai-khoan" className={checkoutStyles.checkoutPrimaryBtn}>
            View Order History
          </Link>
          <Link href="/" className={checkoutStyles.checkoutSecondaryBtn}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
