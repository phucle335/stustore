"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

function formatVnd(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

export default function CheckoutPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [order, setOrder] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const depositAmount = useMemo(() => {
    if (!order) return 0;
    const amount = Number(order.deposit_amount);
    if (Number.isFinite(amount) && amount > 0) return amount;
    return Math.round((Number(order.total_price) || 0) * 0.5);
  }, [order]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        setLoading(true);
        setError("");

        if (!supabase) {
          throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        }

        if (!id) {
          throw new Error("Thiếu mã đơn hàng.");
        }

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("id,total_price,deposit_amount,status")
          .eq("id", id)
          .single();

        if (orderError || !orderData) {
          throw new Error(orderError?.message || "Không tìm thấy đơn hàng.");
        }

        if (!isMounted) return;
        setOrder(orderData);

        const res = await fetch("/api/create-payment-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: String(orderData.id),
            description: `Coc 50% don hang ${orderData.id}`,
          }),
        });

        const body = await res.json();

        if (!res.ok || !body?.checkoutUrl) {
          throw new Error(body?.error || "Không tạo được link thanh toán.");
        }

        if (!isMounted) return;
        setCheckoutUrl(body.checkoutUrl);
      } catch (e) {
        if (!isMounted) return;
        setError(e?.message || "Đã xảy ra lỗi khi tải thanh toán.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!supabase || !id) return;

    const channel = supabase
      .channel(`order-payment-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const next = payload?.new;
          if (next?.status === "deposit_paid") {
            router.push("/checkout/success");
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, router]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">STUSPORT</p>
          <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Thanh toán tiền cọc</h1>
          <p className="mt-2 text-sm text-slate-300">
            Hệ thống sẽ tự động xác nhận đơn hàng sau khi bạn quét mã thành công,
            vui lòng không tắt trang này.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white p-5 text-slate-900">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Thông tin đơn hàng
            </h2>

            {loading ? (
              <p className="mt-4 text-sm text-slate-500">Đang tải dữ liệu…</p>
            ) : error ? (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            ) : (
              <div className="mt-4 space-y-3 text-sm">
                <p>
                  Mã đơn: <strong>#{order?.id}</strong>
                </p>
                <p>
                  Tổng đơn: <strong>{formatVnd(order?.total_price)}</strong>
                </p>
                <p>
                  Tiền cọc cần thanh toán: <strong>{formatVnd(depositAmount)}</strong>
                </p>
                <p className="text-xs text-slate-500">
                  Vui lòng hoàn tất thanh toán qua PayOS để hệ thống tự động cập nhật trạng thái.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-200">
              VietQR động
            </h2>

            {loading ? (
              <p className="mt-4 text-sm text-emerald-100">Đang khởi tạo mã thanh toán…</p>
            ) : checkoutUrl ? (
              <div className="mt-4 space-y-4">
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Mở trang thanh toán PayOS
                </a>

                <iframe
                  title="PayOS checkout"
                  src={checkoutUrl}
                  className="h-[420px] w-full rounded-xl border border-white/20 bg-white"
                />
              </div>
            ) : (
              !error && <p className="mt-4 text-sm text-emerald-100">Chưa có link thanh toán.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
