"use client";

import { useState } from "react";
import { CouponManager } from "@/components/admin/CouponManager";
import { CustomerManager } from "@/components/admin/CustomerManager";
import { OrderManager } from "@/components/admin/OrderManager";
import { ProductManager } from "@/components/admin/ProductManager";
import type {
  DbCoupon,
  DbOrder,
  DbProduct,
  DbSupportRequest,
  DbUser,
} from "@/lib/supabase/types";

type TabId = "products" | "orders" | "customers" | "coupons";

const tabs: { id: TabId; label: string }[] = [
  { id: "products", label: "Sản phẩm" },
  { id: "orders", label: "Đơn hàng" },
  { id: "customers", label: "Khách hàng" },
  { id: "coupons", label: "Phiếu giảm giá" },
];

type AdminTabsProps = {
  products: DbProduct[];
  orders: DbOrder[];
  users: DbUser[];
  coupons: DbCoupon[];
  supportRequests: DbSupportRequest[];
};

export function AdminTabs({
  products,
  orders,
  users,
  coupons,
  supportRequests,
}: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("products");

  const customers = users.filter((user) => user.role === "user");

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs opacity-70">
              (
              {tab.id === "products"
                ? products.length
                : tab.id === "orders"
                  ? orders.length
                  : tab.id === "customers"
                    ? users.length
                    : coupons.length}
              )
            </span>
          </button>
        ))}
      </div>

      {activeTab === "products" ? (
        <ProductManager initialProducts={products} />
      ) : null}
      {activeTab === "orders" ? (
        <OrderManager initialOrders={orders} customers={customers} />
      ) : null}
      {activeTab === "customers" ? (
        <CustomerManager
          initialUsers={users}
          supportRequests={supportRequests}
        />
      ) : null}
      {activeTab === "coupons" ? (
        <CouponManager initialCoupons={coupons} />
      ) : null}
    </div>
  );
}
