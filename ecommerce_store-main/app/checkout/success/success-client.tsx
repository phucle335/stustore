/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Confetti from "react-confetti";
import { formatPriceVnd } from "@/lib/store/cart";
import { useCart } from "@/components/store/CartProvider";

type OrderRow = {
  id: string;
  status?: string | null;
  total_price?: number | null;
  deposit_amount?: number | null;
  remaining_amount?: number | null;
  order_items?: unknown;
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
    return Array.isArray(raw) ? raw : [];
  }, [order]);

  return (
    <div className="static-page-wrap customer-page-wrap customer-page-wrap--dark">
      <Confetti
        width={viewport.width}
        height={viewport.height}
        recycle={false}
        numberOfPieces={550}
      />
      <div className="static-page customer-page customer-page--narrow">
        <p className="customer-page-eyebrow">Stusport</p>
        <h1 className="customer-page-title">Thanh toán thành công</h1>
        <p className="customer-page-subtitle">
          Đơn hàng đã được ghi nhận. Vui lòng kiểm tra Zalo/Email để nhận hướng
          dẫn tiếp theo.
        </p>

        <div className="checkout-payment-panel" style={{ marginTop: 18 }}>
          <p className="checkout-payment-title">Thông tin đơn hàng</p>
          <div className="checkout-profile-summary">
            <p>
              <span>Mã đơn:</span> <strong>#{orderId || "—"}</strong>
            </p>
            <p>
              <span>Đã thanh toán (cọc):</span>{" "}
              <strong>{formatPriceVnd(deposit)}</strong>
            </p>
            <p>
              <span>Còn lại:</span> <strong>{formatPriceVnd(remaining)}</strong>
            </p>
            <p>
              <span>Tổng đơn:</span> <strong>{formatPriceVnd(total)}</strong>
            </p>
          </div>
        </div>

        {orderItems.length > 0 ? (
          <div className="checkout-payment-panel" style={{ marginTop: 14 }}>
            <p className="checkout-payment-title">Sản phẩm đã mua</p>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 520,
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        fontSize: 12,
                        padding: "10px 8px",
                        color: "rgba(255,255,255,0.75)",
                        borderBottom: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      Sản phẩm
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        fontSize: 12,
                        padding: "10px 8px",
                        color: "rgba(255,255,255,0.75)",
                        borderBottom: "1px solid rgba(255,255,255,0.12)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Số lượng
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        fontSize: 12,
                        padding: "10px 8px",
                        color: "rgba(255,255,255,0.75)",
                        borderBottom: "1px solid rgba(255,255,255,0.12)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Đơn giá
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.slice(0, 30).map((it: any, idx) => {
                    const name = typeof it?.name === "string" ? it.name : "Sản phẩm";
                    const size =
                      typeof it?.size === "string" && it.size.trim()
                        ? ` — Size ${it.size}`
                        : "";
                    const qty = Math.max(0, Number(it?.quantity) || 0);
                    const unit = Math.max(0, Number(it?.unit_price) || 0);
                    if (!name || qty <= 0) return null;
                    return (
                      <tr key={`${idx}-${name}`}>
                        <td
                          style={{
                            padding: "10px 8px",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            color: "#fff",
                            fontSize: 14,
                          }}
                        >
                          {name}
                          {size}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            textAlign: "right",
                            color: "rgba(255,255,255,0.92)",
                            whiteSpace: "nowrap",
                            fontSize: 14,
                          }}
                        >
                          {qty}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            textAlign: "right",
                            color: "rgba(255,255,255,0.92)",
                            whiteSpace: "nowrap",
                            fontSize: 14,
                          }}
                        >
                          {unit ? formatPriceVnd(unit) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div className="checkout-payment-actions" style={{ marginTop: 18 }}>
          <Link href="/tai-khoan" className="checkout-primary-btn">
            Xem lịch sử đơn hàng
          </Link>
          <Link href="/" className="checkout-secondary-btn">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}

