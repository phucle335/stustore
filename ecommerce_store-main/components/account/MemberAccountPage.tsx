"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatPriceVnd } from "@/lib/store/cart";
import type { ProductDetail } from "@/lib/store/types";
import { useCustomerAuth } from "@/components/store/CustomerAuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { DbOrder } from "@/lib/supabase/types";
import {
  emptyMemberProfile,
  type MemberProfile,
} from "@/lib/account/member-profile.shared";

type SectionId =
  | "orders"
  | "coupons"
  | "favorites"
  | "profile"
  | "password"
  | "preferences";

const nav: { id: SectionId; label: string }[] = [
  { id: "orders", label: "Lịch sử mua hàng" },
  { id: "coupons", label: "Phiếu giảm giá" },
  { id: "favorites", label: "Yêu thích" },
  { id: "profile", label: "Chỉnh sửa hồ sơ" },
  { id: "password", label: "Đổi mật khẩu" },
  { id: "preferences", label: "Cài đặt tuỳ chọn" },
];

const statusLabel: Record<string, string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

type MemberAccountPageProps = {
  productsById?: Record<string, ProductDetail>;
};

export function MemberAccountPage({
  productsById = {},
}: MemberAccountPageProps) {
  const { user, refreshProfile } = useCustomerAuth();
  const [section, setSection] = useState<SectionId>("orders");
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [profileWarning, setProfileWarning] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [couponSubtotal, setCouponSubtotal] = useState("500000");
  const [couponResult, setCouponResult] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const loadData = useCallback(async () => {
    setProfileLoading(true);
    setOrdersLoading(true);
    setProfileWarning(null);

    const [profileRes, ordersRes, favRes] = await Promise.all([
      fetch("/api/account/profile", { credentials: "include" }),
      fetch("/api/account/orders", { credentials: "include" }),
      fetch("/api/account/favorites", { credentials: "include" }),
    ]);

    const profileBody = (await profileRes.json()) as {
      data?: MemberProfile;
      error?: string;
      warning?: string;
    };
    const ordersBody = (await ordersRes.json()) as {
      data?: DbOrder[];
      error?: string;
    };
    const favBody = (await favRes.json()) as {
      data?: string[];
      error?: string;
    };

    if (profileBody.data) {
      setProfile(profileBody.data);
    } else {
      setProfile(
        emptyMemberProfile(
          user?.email ?? "",
          user?.full_name ?? user?.display_name,
        ),
      );
      if (!profileRes.ok) {
        setError(profileBody.error ?? "Không tải được hồ sơ.");
      }
    }

    if (profileBody.warning) {
      setProfileWarning(profileBody.warning);
    }

    if (ordersBody.data) setOrders(ordersBody.data);
    if (favBody.data) setFavorites(favBody.data);

    setProfileLoading(false);
    setOrdersLoading(false);
  }, [user?.display_name, user?.email, user?.full_name]);

  useEffect(() => {
    if (!user) return;
    void loadData();
  }, [loadData, user]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    const current = profile ?? displayProfile;
    setError(null);
    setMessage(null);

    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(current),
    });
    const body = (await res.json()) as {
      data?: MemberProfile;
      error?: string;
    };
    if (!res.ok) {
      setError(body.error ?? "Không lưu được hồ sơ.");
      return;
    }
    if (body.data) setProfile(body.data);
    setMessage("Đã cập nhật hồ sơ.");
    await refreshProfile();
  }

  async function savePreferences(event: React.FormEvent) {
    event.preventDefault();
    const current = profile ?? displayProfile;
    setError(null);
    setMessage(null);

    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newsletter_opt_in: current.newsletter_opt_in,
        personalized_recommendations: current.personalized_recommendations,
        personalized_ads: current.personalized_ads,
      }),
    });
    const body = (await res.json()) as {
      data?: MemberProfile;
      error?: string;
    };
    if (!res.ok) {
      setError(body.error ?? "Không lưu được cài đặt.");
      return;
    }
    if (body.data) setProfile(body.data);
    setMessage("Đã lưu cài đặt.");
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (passwordForm.newPassword.length < 6) {
      setError("Mật khẩu mới tối thiểu 6 ký tự.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    const supabase = getSupabaseClient();
    const { error: pwError } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    });

    if (pwError) {
      setError(pwError.message);
      return;
    }

    setMessage("Đã đổi mật khẩu.");
    setPasswordForm({ newPassword: "", confirmPassword: "" });
  }

  async function validateCoupon() {
    setCouponResult(null);
    setError(null);
    const subtotal = Number(couponSubtotal);
    if (!couponCode.trim() || !Number.isFinite(subtotal) || subtotal <= 0) {
      setError("Nhập mã và tổng đơn thử (đ) hợp lệ.");
      return;
    }

    const res = await fetch("/api/store/coupons/validate", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal }),
    });
    const body = (await res.json()) as {
      data?: { discount_amount: number; final_total: number; code: string };
      error?: string;
    };

    if (!res.ok) {
      setError(body.error ?? "Mã không hợp lệ.");
      return;
    }

    setCouponResult(
      `Mã ${body.data?.code}: giảm ${formatPriceVnd(body.data?.discount_amount ?? 0)}, còn ${formatPriceVnd(body.data?.final_total ?? 0)}.`,
    );
  }

  async function removeFavorite(productId: string) {
    await fetch(
      `/api/account/favorites?product_id=${encodeURIComponent(productId)}`,
      { method: "DELETE", credentials: "include" },
    );
    setFavorites((prev) => prev.filter((id) => id !== productId));
  }

  const displayProfile =
    profile ??
    emptyMemberProfile(
      user?.email ?? "",
      user?.full_name ?? user?.display_name,
    );

  const sectionLoading =
    (section === "profile" || section === "preferences" || section === "password") &&
    profileLoading;

  return (
    <div className="member-page">
      <div className="member-header">
        <p className="customer-page-eyebrow">Stusport</p>
        <h1>Tư cách thành viên</h1>
        <p>Xin chào, {user?.display_name ?? "thành viên"}</p>
      </div>

      <div className="member-layout">
        <nav className="member-nav">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              className={section === item.id ? "is-active" : undefined}
              onClick={() => {
                setSection(item.id);
                setMessage(null);
                setError(null);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="member-panel">
          {profileWarning ? (
            <p className="member-warning">{profileWarning}</p>
          ) : null}
          {message ? <p className="member-success">{message}</p> : null}
          {error ? <p className="member-error">{error}</p> : null}

          {sectionLoading ? (
            <p className="member-muted">Đang tải…</p>
          ) : null}

          {section === "orders" && !ordersLoading ? (
            <div>
              <h2>Lịch sử mua hàng</h2>
              <p className="member-section-intro">
                Xem các đơn hàng bạn đã đặt trên Stusport.
              </p>
              {orders.length === 0 ? (
                <p className="member-muted">Chưa có đơn hàng.</p>
              ) : (
                <ul className="member-order-list">
                  {orders.map((order, index) => {
                    const orderId =
                      typeof order.id === "string"
                        ? order.id
                        : String(order.id ?? "");
                    const shortOrderId = orderId
                      ? orderId.slice(0, 8)
                      : "--------";

                    const rawItems = order.order_items as unknown;
                    const orderItems = Array.isArray(rawItems)
                      ? rawItems
                      : [];

                    return (
                    <li
                      key={`${orderId || order.created_at}-${index}`}
                      className="member-order-item"
                    >
                      <div>
                        <strong>#{shortOrderId}</strong>
                        <span className="member-order-status">
                          {statusLabel[order.status] ?? order.status}
                        </span>
                      </div>
                      <p className="member-muted">
                        {new Date(order.created_at).toLocaleString("vi-VN")}
                      </p>
                      {order.coupon_code ? (
                        <p className="member-muted">Mã: {order.coupon_code}</p>
                      ) : null}
                      <p className="member-order-total">
                        {formatPriceVnd(Number(order.total_price))}
                        {order.discount_amount
                          ? ` (đã giảm ${formatPriceVnd(Number(order.discount_amount))})`
                          : ""}
                      </p>
                      <p className="member-muted">
                        Đã cọc: {formatPriceVnd(Number(order.deposit_amount ?? 0))}
                        {Number(order.remaining_amount ?? 0) > 0
                          ? ` · Còn lại: ${formatPriceVnd(Number(order.remaining_amount ?? 0))}`
                          : ""}
                      </p>

                      {orderItems.length > 0 ? (
                        <ul className="member-order-items">
                          {orderItems.slice(0, 5).map((it: any, idx) => {
                            const name = typeof it?.name === "string" ? it.name : "";
                            const size =
                              typeof it?.size === "string" && it.size.trim()
                                ? ` — Size ${it.size}`
                                : "";
                            const qty = Number(it?.quantity) || 0;
                            if (!name || qty <= 0) return null;

                            return (
                              <li key={`${orderId}-${idx}`} className="member-order-item-line">
                                {name}
                                {size} × {qty}
                              </li>
                            );
                          })}
                          {orderItems.length > 5 ? (
                            <li className="member-order-items-more member-muted">
                              +{orderItems.length - 5} sản phẩm khác
                            </li>
                          ) : null}
                        </ul>
                      ) : (
                        <p className="member-muted" style={{ marginTop: 10 }}>
                          Chưa có mô tả sản phẩm trong đơn.
                        </p>
                      )}
                    </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : null}

          {section === "orders" && ordersLoading ? (
            <p className="member-muted">Đang tải đơn hàng…</p>
          ) : null}

          {section === "coupons" ? (
            <div>
              <h2>Phiếu giảm giá</h2>
              <p className="member-muted">
                Nhập mã khi thanh toán hoặc kiểm tra mã tại đây.
              </p>
              <div className="member-coupon-box">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Mã phiếu (VD: STU10)"
                  className="member-input"
                />
                <input
                  type="number"
                  value={couponSubtotal}
                  onChange={(e) => setCouponSubtotal(e.target.value)}
                  placeholder="Tổng đơn thử (đ)"
                  className="member-input"
                />
                <button
                  type="button"
                  className="member-btn"
                  onClick={() => void validateCoupon()}
                >
                  Kiểm tra mã
                </button>
              </div>
              {couponResult ? (
                <p className="member-success">{couponResult}</p>
              ) : null}
            </div>
          ) : null}

          {section === "favorites" ? (
            <div>
              <h2>Yêu thích</h2>
              {favorites.length === 0 ? (
                <p className="member-muted">Chưa có sản phẩm yêu thích.</p>
              ) : (
                <ul className="member-fav-grid">
                  {favorites.map((productId) => {
                    const product = productsById[productId];
                    if (!product) return null;
                    return (
                      <li key={productId} className="member-fav-card">
                        <Link href={`/products/${productId}`}>
                          <Image
                            src={product.images[0] ?? "/images/placeholder.png"}
                            alt={product.name}
                            width={120}
                            height={120}
                          />
                          <p>{product.name}</p>
                          <p className="member-fav-price">{product.price}</p>
                        </Link>
                        <button
                          type="button"
                          className="member-link-btn"
                          onClick={() => void removeFavorite(productId)}
                        >
                          Bỏ yêu thích
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : null}

          {section === "profile" && !sectionLoading ? (
            <form onSubmit={saveProfile}>
              <h2>Chỉnh sửa hồ sơ</h2>
              <p className="member-section-intro">
                Cập nhật thông tin giao hàng. <strong>Địa chỉ là bắt buộc</strong>{" "}
                trước khi thanh toán; họ tên, số điện thoại, ngày sinh và giới
                tính là tuỳ chọn.
              </p>
              <p className="member-muted">Email: {displayProfile.email}</p>
              <label className="member-field">
                Họ và tên
                <input
                  className="member-input"
                  value={displayProfile.full_name ?? ""}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...(p ?? displayProfile),
                      full_name: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="member-field">
                Địa chỉ giao hàng *
                <textarea
                  required
                  className="member-input member-textarea"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  value={displayProfile.address}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...(p ?? displayProfile),
                      address: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="member-field">
                Số điện thoại
                <input
                  className="member-input"
                  type="tel"
                  placeholder="09xxxxxxxx"
                  value={displayProfile.phone ?? ""}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...(p ?? displayProfile),
                      phone: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="member-field">
                Ngày sinh (tuỳ chọn)
                <input
                  type="date"
                  className="member-input"
                  value={displayProfile.birthday ?? ""}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...(p ?? displayProfile),
                      birthday: e.target.value || null,
                    }))
                  }
                />
              </label>
              <label className="member-field">
                Giới tính (tuỳ chọn)
                <select
                  className="member-input"
                  value={displayProfile.gender}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...(p ?? displayProfile),
                      gender: e.target.value,
                    }))
                  }
                >
                  <option value="">Không chọn</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </label>
              <button type="submit" className="member-btn">
                Lưu hồ sơ
              </button>
            </form>
          ) : null}

          {section === "password" && !sectionLoading ? (
            <form onSubmit={changePassword}>
              <h2>Đổi mật khẩu</h2>
              <label className="member-field">
                Mật khẩu mới
                <input
                  type="password"
                  required
                  minLength={6}
                  className="member-input"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({
                      ...f,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="member-field">
                Xác nhận mật khẩu
                <input
                  type="password"
                  required
                  minLength={6}
                  className="member-input"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({
                      ...f,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </label>
              <button type="submit" className="member-btn">
                Cập nhật mật khẩu
              </button>
            </form>
          ) : null}

          {section === "preferences" && !sectionLoading ? (
            <form onSubmit={savePreferences}>
              <h2>Cài đặt tuỳ chọn</h2>
              <p className="member-section-intro">
                Chọn những gì bạn muốn nhận từ Stusport. Bạn có thể bật/tắt bất
                cứ lúc nào.
              </p>
              <div className="member-pref-list">
                <label className="member-check">
                  <input
                    type="checkbox"
                    checked={displayProfile.newsletter_opt_in}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...(p ?? displayProfile),
                        newsletter_opt_in: e.target.checked,
                      }))
                    }
                  />
                  <span>
                    <strong>Bản tin Stusport</strong> — Nhận email về sản phẩm
                    mới, ưu đãi và tin tức từ Stusport.
                  </span>
                </label>
                <label className="member-check">
                  <input
                    type="checkbox"
                    checked={displayProfile.personalized_recommendations}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...(p ?? displayProfile),
                        personalized_recommendations: e.target.checked,
                      }))
                    }
                  />
                  <span>
                    <strong>Đề xuất cá nhân hoá</strong> — Muốn thấy gợi ý sản
                    phẩm phù hợp khi duyệt website Stusport.
                  </span>
                </label>
                <label className="member-check">
                  <input
                    type="checkbox"
                    checked={displayProfile.personalized_ads}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...(p ?? displayProfile),
                        personalized_ads: e.target.checked,
                      }))
                    }
                  />
                  <span>
                    <strong>Quảng cáo cá nhân hoá</strong> — Muốn thấy quảng
                    cáo Stusport phù hợp trên các website đối tác khác.
                  </span>
                </label>
              </div>
              <button type="submit" className="member-btn">
                Lưu cài đặt
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
