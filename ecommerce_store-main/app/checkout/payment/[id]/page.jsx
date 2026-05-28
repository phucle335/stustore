"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Confetti from "react-confetti";

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
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [order, setOrder] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [viewport, setViewport] = useState({ width: 1280, height: 720 });
  const [nowTs, setNowTs] = useState(() => Math.floor(Date.now() / 1000));

  const depositAmount = useMemo(() => {
    if (!order) return 0;
    const amount = Number(order.deposit_amount);
    if (Number.isFinite(amount) && amount > 0) return amount;
    return Math.round((Number(order.total_price) || 0) * 0.5);
  }, [order]);

  const remainingSeconds = useMemo(() => {
    if (!expiresAt) return 0;
    return Math.max(0, expiresAt - nowTs);
  }, [expiresAt, nowTs]);

  const formattedCountdown = useMemo(() => {
    const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
    const seconds = String(remainingSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [remainingSeconds]);

  const isQrImage =
    qrCode.startsWith("data:image") || qrCode.startsWith("http");

  const cancelExpiredOrder = useCallback(async () => {
    if (!id || cancelling || success) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/cancel-order", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error || "Không thể hủy đơn quá hạn.");
      }
      setOrder((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
      setError(
        "Mã QR đã hết hạn sau 5 phút. Đơn hàng đã được hủy, vui lòng đặt lại.",
      );
    } catch (e) {
      setError(e?.message || "Không thể hủy đơn quá hạn.");
    } finally {
      setCancelling(false);
      setModalOpen(false);
    }
  }, [id, cancelling, success]);

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
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: String(orderData.id),
            description: `Coc 50% don hang ${orderData.id}`,
          }),
        });

        const body = await res.json();

        if (!res.ok || !body?.checkoutUrl) {
          const detail =
            typeof body?.detail === "string" && body.detail.trim()
              ? ` (${body.detail})`
              : "";
          throw new Error(
            `${body?.error || "Không tạo được link thanh toán."}${detail}`,
          );
        }

        if (!isMounted) return;
        setCheckoutUrl(body.checkoutUrl);
        setQrCode(typeof body.qrCode === "string" ? body.qrCode : "");
        setExpiresAt(Number(body.expiredAt) || Math.floor(Date.now() / 1000) + 300);
        setModalOpen(true);
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
    if (!modalOpen || !expiresAt || success) return;
    const timer = window.setInterval(() => {
      const current = Math.floor(Date.now() / 1000);
      setNowTs(current);
      if (current >= expiresAt) {
        window.clearInterval(timer);
        void cancelExpiredOrder();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [modalOpen, expiresAt, success, cancelExpiredOrder]);

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
          if (next) setOrder(next);
          if (next?.status === "deposit_paid") {
            setSuccess(true);
            setModalOpen(false);
            setShowConfetti(true);
            setError("");
            setTimeout(() => setShowConfetti(false), 8000);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const setSize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    setSize();
    window.addEventListener("resize", setSize);
    return () => window.removeEventListener("resize", setSize);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {showConfetti ? (
        <Confetti
          width={viewport.width}
          height={viewport.height}
          numberOfPieces={500}
          recycle={false}
        />
      ) : null}
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">STUSPORT</p>
          <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Thanh toán tiền cọc</h1>
          <p className="mt-2 text-sm text-slate-300">
            Hệ thống sẽ tự động xác nhận đơn hàng sau khi bạn quét mã thành công,
            vui lòng không tắt trang này.
          </p>
          {success ? (
            <p className="mt-3 rounded-xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200">
              Thanh toán thành công! STUSPORT đã ghi nhận đơn hàng, vui lòng kiểm
              tra Zalo/Email để nhận thông tin tiếp theo.
            </p>
          ) : null}
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
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-300/40 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
                >
                  Mở QR thanh toán tại chỗ
                </button>
              </div>
            ) : (
              !error && <p className="mt-4 text-sm text-emerald-100">Chưa có link thanh toán.</p>
            )}
          </section>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-slate-950 p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Quét mã QR để thanh toán</h3>
              <span className="rounded-full border border-orange-400/40 bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-200">
                {formattedCountdown}
              </span>
            </div>

            {isQrImage ? (
              <img
                src={qrCode}
                alt="PayOS QR"
                className="mx-auto mb-4 h-64 w-64 rounded-xl border border-white/10 bg-white p-2"
              />
            ) : qrCode ? (
              <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="mb-2 text-xs text-slate-300">
                  Mã QR text (copy để xử lý nếu app ngân hàng hỗ trợ):
                </p>
                <p className="break-all text-xs text-slate-100">{qrCode}</p>
              </div>
            ) : null}

            <iframe
              title="PayOS checkout"
              src={checkoutUrl}
              className="h-[360px] w-full rounded-xl border border-white/20 bg-white"
            />

            <p className="mt-3 text-xs text-slate-300">
              Nếu quá 05:00 mà chưa thanh toán, hệ thống sẽ tự đóng mã và hủy đơn.
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-200"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => void cancelExpiredOrder()}
                disabled={cancelling}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {cancelling ? "Đang hủy..." : "Hủy đơn"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
