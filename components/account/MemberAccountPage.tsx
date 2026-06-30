"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatPriceVnd } from "@/lib/store/cart";
import type { ProductDetail } from "@/lib/store/types";
import { useCustomerAuth } from "@/components/store/CustomerAuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { DbOrder } from "@/lib/supabase/types";
import { StusportLogo } from "@/components/brand/StusportLogo";
import styles from "@/styles/components/store/Customer.module.css";
import {
  emptyMemberProfile,
  type MemberProfile,
} from "@/lib/account/member-profile.shared";
import {
  buildMemberAccountUrl,
  DEFAULT_MEMBER_SECTION_ID,
  MEMBER_ACCOUNT_SECTIONS,
  parseMemberSectionId,
  type MemberSectionId,
} from "@/lib/account/member-sections";

const statusLabel: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipping",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

type MemberAccountPageProps = {
  productsById?: Record<string, ProductDetail>;
};

export function MemberAccountPage({
  productsById = {},
}: MemberAccountPageProps) {
  const { user, refreshProfile } = useCustomerAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const section = useMemo(
    (): MemberSectionId =>
      parseMemberSectionId(searchParams.get("section")) ??
      DEFAULT_MEMBER_SECTION_ID,
    [searchParams],
  );
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
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
        setError(profileBody.error ?? "Could not load profile.");
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

  const ORDERS_PAGE_SIZE = 5;
  const ordersTotalPages = Math.max(1, Math.ceil(orders.length / ORDERS_PAGE_SIZE));
  const pagedOrders = orders.slice(
    (ordersPage - 1) * ORDERS_PAGE_SIZE,
    ordersPage * ORDERS_PAGE_SIZE,
  );

  useEffect(() => {
    setOrdersPage(1);
    setExpandedOrderId(null);
    setMessage(null);
    setError(null);
  }, [section]);

  function selectSection(nextSection: MemberSectionId): void {
    router.replace(buildMemberAccountUrl(nextSection), { scroll: false });
  }

  useEffect(() => {
    if (ordersPage > ordersTotalPages) setOrdersPage(ordersTotalPages);
  }, [ordersPage, ordersTotalPages]);

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
      setError(body.error ?? "Could not save profile.");
      return;
    }
    if (body.data) setProfile(body.data);
    setMessage("Profile updated.");
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
      setError(body.error ?? "Could not save preferences.");
      return;
    }
    if (body.data) setProfile(body.data);
    setMessage("Preferences saved.");
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (passwordForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Passwords do not match.");
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

    setMessage("Password changed.");
    setPasswordForm({ newPassword: "", confirmPassword: "" });
  }

  async function validateCoupon() {
    setCouponResult(null);
    setError(null);
    const subtotal = Number(couponSubtotal);
    if (!couponCode.trim() || !Number.isFinite(subtotal) || subtotal <= 0) {
      setError("Enter a valid code and order subtotal.");
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
      setError(body.error ?? "Invalid coupon code.");
      return;
    }

    setCouponResult(
      `Code ${body.data?.code}: -${formatPriceVnd(body.data?.discount_amount ?? 0)}, final total ${formatPriceVnd(body.data?.final_total ?? 0)}.`,
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
    <div className={styles.memberPage}>
      <div className={styles.memberHeader}>
        <div className={styles.customerPageEyebrow}>
          <StusportLogo
            variant="mark"
            tone="on-dark"
            href="/"
            className="stusport-logo--compact"
          />
        </div>
        <h1>My Account</h1>
        <p>Hello, {user?.display_name ?? "member"}</p>
      </div>

      <div className={styles.memberLayout}>
        <nav className={styles.memberNav}>
          {MEMBER_ACCOUNT_SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={section === item.id ? styles.isActive : undefined}
              onClick={() => selectSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.memberPanel}>
          {profileWarning ? (
            <p className={styles.memberWarning}>{profileWarning}</p>
          ) : null}
          {message ? <p className={styles.memberSuccess}>{message}</p> : null}
          {error ? <p className={styles.memberError}>{error}</p> : null}

          {sectionLoading ? (
            <p className={styles.memberMuted}>Loading…</p>
          ) : null}

          {section === "orders" && !ordersLoading ? (
            <div>
              <h2>Order History</h2>
              <p className={styles.memberSectionIntro}>
                View your past orders on Stusport.
              </p>
              {orders.length === 0 ? (
                <p className={styles.memberMuted}>No orders yet.</p>
              ) : (
                <>
                  <ul className={styles.memberOrderList}>
                    {pagedOrders.map((order, index) => {
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
                    const isExpanded = expandedOrderId === orderId;

                    return (
                    <li
                      key={`${orderId || order.created_at}-${index}`}
                      className={styles.memberOrderItem}
                    >
                      <div>
                        <strong>#{shortOrderId}</strong>
                        <span className={styles.memberOrderStatus}>
                          {statusLabel[order.status] ?? order.status}
                        </span>
                      </div>
                      <p className={styles.memberMuted}>
                        {new Date(order.created_at).toLocaleString("vi-VN")}
                      </p>
                      {order.coupon_code ? (
                        <p className={styles.memberMuted}>Code: {order.coupon_code}</p>
                      ) : null}
                      <p className={styles.memberOrderTotal}>
                        {formatPriceVnd(Number(order.total_price))}
                        {order.discount_amount
                          ? ` (saved ${formatPriceVnd(Number(order.discount_amount))})`
                          : ""}
                      </p>
                      <p className={styles.memberMuted}>
                        Deposit: {formatPriceVnd(Number(order.deposit_amount ?? 0))}
                        {Number(order.remaining_amount ?? 0) > 0
                          ? ` · Remaining: ${formatPriceVnd(Number(order.remaining_amount ?? 0))}`
                          : ""}
                      </p>
                      <button
                        type="button"
                        className={styles.memberLinkBtn}
                        onClick={() =>
                          setExpandedOrderId((current) =>
                            current === orderId ? null : orderId,
                          )
                        }
                      >
                        {isExpanded ? "Hide details" : "View details"}
                      </button>

                      {isExpanded ? (
                        <div className={styles.memberOrderDetail}>
                          <p className={styles.memberOrderItemLine}>
                            Status:{" "}
                            <strong>{statusLabel[order.status] ?? order.status}</strong>
                          </p>
                          <p className={styles.memberOrderItemLine}>
                            Total: <strong>{formatPriceVnd(Number(order.total_price))}</strong>
                          </p>
                          <p className={styles.memberOrderItemLine}>
                            Delivery address:{" "}
                            {order.shipping_address
                              ? String(order.shipping_address)
                              : "None"}
                          </p>
                          <p className={styles.memberOrderItemLine}>
                            Recipient:{" "}
                            {order.shipping_full_name
                              ? String(order.shipping_full_name)
                              : "None"}
                            {order.shipping_phone
                              ? ` · ${String(order.shipping_phone)}`
                              : ""}
                          </p>
                          <ul className={styles.memberOrderItems}>
                            {orderItems.map((it: any, idx) => {
                              const name = typeof it?.name === "string" ? it.name : "";
                              const size =
                                typeof it?.size === "string" && it.size.trim()
                                  ? ` — Size ${it.size}`
                                  : "";
                              const qty = Number(it?.quantity) || 0;
                              const unitPrice = Number(it?.unit_price ?? 0);
                              if (!name || qty <= 0) return null;
                              return (
                                <li key={`${orderId}-detail-${idx}`} className={styles.memberOrderItemLine}>
                                  {name}
                                  {size} × {qty}
                                  {unitPrice > 0 ? ` · ${formatPriceVnd(unitPrice)}` : ""}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : null}

                      {!isExpanded && orderItems.length > 0 ? (
                        <ul className={styles.memberOrderItems}>
                          {orderItems.slice(0, 5).map((it: any, idx) => {
                            const name = typeof it?.name === "string" ? it.name : "";
                            const size =
                              typeof it?.size === "string" && it.size.trim()
                                ? ` — Size ${it.size}`
                                : "";
                            const qty = Number(it?.quantity) || 0;
                            if (!name || qty <= 0) return null;

                            return (
                              <li key={`${orderId}-${idx}`} className={styles.memberOrderItemLine}>
                                {name}
                                {size} × {qty}
                              </li>
                            );
                          })}
                          {orderItems.length > 5 ? (
                            <li className={`${styles.memberOrderItemsMore} ${styles.memberMuted}`}>
                              +{orderItems.length - 5} more items
                            </li>
                          ) : null}
                        </ul>
                      ) : !isExpanded ? (
                        <p className={styles.memberMuted} style={{ marginTop: 10 }}>
                          No item details in this order.
                        </p>
                      ) : null}
                    </li>
                    );
                  })}
                  </ul>

                  {orders.length > ORDERS_PAGE_SIZE ? (
                    <div className={styles.memberOrdersPager}>
                      <p className={styles.memberMuted}>
                        Page {ordersPage}/{ordersTotalPages} · {orders.length} orders
                      </p>
                      <div className={styles.memberOrdersPagerActions}>
                        <button
                          type="button"
                          className={styles.checkoutSecondaryBtn}
                          disabled={ordersPage <= 1}
                          onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          className={styles.checkoutSecondaryBtn}
                          disabled={ordersPage >= ordersTotalPages}
                          onClick={() =>
                            setOrdersPage((p) => Math.min(ordersTotalPages, p + 1))
                          }
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : null}

          {section === "orders" && ordersLoading ? (
            <p className={styles.memberMuted}>Loading orders…</p>
          ) : null}

          {section === "coupons" ? (
            <div>
              <h2>Coupons</h2>
              <p className={styles.memberMuted}>
                Enter your code at checkout or test it here.
              </p>
              <div className={styles.memberCouponBox}>
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon code (e.g. STU10)"
                  className={styles.memberInput}
                />
                <input
                  type="number"
                  value={couponSubtotal}
                  onChange={(e) => setCouponSubtotal(e.target.value)}
                  placeholder="Order subtotal"
                  className={styles.memberInput}
                />
                <button
                  type="button"
                  className={styles.memberBtn}
                  onClick={() => void validateCoupon()}
                >
                  Test code
                </button>
              </div>
              {couponResult ? (
                <p className={styles.memberSuccess}>{couponResult}</p>
              ) : null}
            </div>
          ) : null}

          {section === "favorites" ? (
            <div>
              <h2>Favorites</h2>
              {favorites.length === 0 ? (
                <p className={styles.memberMuted}>No favorites yet.</p>
              ) : (
                <ul className={styles.memberFavGrid}>
                  {favorites.map((productId) => {
                    const product = productsById[productId];
                    if (!product) return null;
                    return (
                      <li key={productId} className={styles.memberFavCard}>
                        <Link href={`/products/${productId}`}>
                          <Image
                            src={product.images[0] ?? "/images/placeholder.png"}
                            alt={product.name}
                            width={120}
                            height={120}
                          />
                          <p>{product.name}</p>
                          <p className={styles.memberFavPrice}>{product.price}</p>
                        </Link>
                        <button
                          type="button"
                          className={styles.memberLinkBtn}
                          onClick={() => void removeFavorite(productId)}
                        >
                          Remove
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
              <h2>Edit Profile</h2>
              <p className={styles.memberSectionIntro}>
                Update your delivery information. <strong>Address is required</strong>{" "}
                before checkout; name, phone, date of birth, and gender are optional.
              </p>
              <p className={styles.memberMuted}>Email: {displayProfile.email}</p>
              <label className={styles.memberField}>
                Full Name
                <input
                  className={styles.memberInput}
                  value={displayProfile.full_name ?? ""}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...(p ?? displayProfile),
                      full_name: e.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.memberField}>
                Delivery Address *
                <textarea
                  required
                  className={`${styles.memberInput} ${styles.memberTextarea}`}
                  placeholder="Street, ward, district, city"
                  value={displayProfile.address}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...(p ?? displayProfile),
                      address: e.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.memberField}>
                Phone Number
                <input
                  className={styles.memberInput}
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
              <label className={styles.memberField}>
                Date of Birth (optional)
                <input
                  type="date"
                  className={styles.memberInput}
                  value={displayProfile.birthday ?? ""}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...(p ?? displayProfile),
                      birthday: e.target.value || null,
                    }))
                  }
                />
              </label>
              <label className={styles.memberField}>
                Gender (optional)
                <select
                  className={styles.memberInput}
                  value={displayProfile.gender}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...(p ?? displayProfile),
                      gender: e.target.value,
                    }))
                  }
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <button type="submit" className={styles.memberBtn}>
                Save Profile
              </button>
            </form>
          ) : null}

          {section === "password" && !sectionLoading ? (
            <form onSubmit={changePassword}>
              <h2>Change Password</h2>
              <label className={styles.memberField}>
                New Password
                <input
                  type="password"
                  required
                  minLength={6}
                  className={styles.memberInput}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({
                      ...f,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.memberField}>
                Confirm Password
                <input
                  type="password"
                  required
                  minLength={6}
                  className={styles.memberInput}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({
                      ...f,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </label>
              <button type="submit" className={styles.memberBtn}>
                Update Password
              </button>
            </form>
          ) : null}

          {section === "preferences" && !sectionLoading ? (
            <form onSubmit={savePreferences}>
              <h2>Preferences</h2>
              <p className={styles.memberSectionIntro}>
                Choose what you want to receive from Stusport. You can toggle these at any time.
              </p>
              <div className={styles.memberPrefList}>
                <label className={styles.memberCheck}>
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
                    <strong>Stusport Newsletter</strong> — Receive emails about new products,
                    deals, and news from Stusport.
                  </span>
                </label>
                <label className={styles.memberCheck}>
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
                    <strong>Personalized Recommendations</strong> — See product suggestions
                    tailored to you while browsing Stusport.
                  </span>
                </label>
                <label className={styles.memberCheck}>
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
                    <strong>Personalized Ads</strong> — See relevant Stusport ads on partner websites.
                  </span>
                </label>
              </div>
              <button type="submit" className={styles.memberBtn}>
                Save Preferences
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
