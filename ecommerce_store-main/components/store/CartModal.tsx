"use client";

import Image from "next/image";
import Link from "next/link";
import { getProductStock } from "@/lib/store/catalog";
import { useCart } from "./CartProvider";

export function CartModal() {
  const {
    items,
    itemCount,
    totalLabel,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  return (
    <div
      className={`cart-sidebar${isOpen ? " open" : ""}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className="cart-sidebar-backdrop"
        onClick={closeCart}
        aria-label="Đóng giỏ hàng"
        tabIndex={isOpen ? 0 : -1}
      />

      <aside
        className="cart-sidebar-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-sidebar-title"
      >
        <div className="cart-sidebar-header">
          <h2 id="cart-sidebar-title">
            Giỏ hàng
            {itemCount > 0 ? (
              <span className="cart-sidebar-count"> ({itemCount})</span>
            ) : null}
          </h2>
          <button
            type="button"
            className="cart-sidebar-close"
            onClick={closeCart}
            aria-label="Đóng giỏ hàng"
          >
            &times;
          </button>
        </div>

        <div className="cart-sidebar-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <i className="fas fa-shopping-bag" aria-hidden="true" />
              <p>Giỏ hàng của bạn đang trống</p>
              <button
                type="button"
                className="cart-continue-btn"
                onClick={closeCart}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <ul className="cart-items">
              {items.map((item) => {
                const stock = getProductStock(item.productId, item.size);
                const atMaxStock = item.quantity >= stock;

                return (
                <li key={item.lineId} className="cart-item">
                  <Link
                    href={`/products/${item.productId}`}
                    className="cart-item-image"
                    onClick={closeCart}
                  >
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      width={80}
                      height={80}
                    />
                  </Link>
                  <div className="cart-item-info">
                    <p className="brand">{item.brand}</p>
                    <Link
                      href={`/products/${item.productId}`}
                      className="cart-item-name"
                      onClick={closeCart}
                    >
                      {item.name}
                    </Link>
                    <p className="cart-item-price">{item.price}</p>
                    {item.size ? (
                      <p className="cart-item-variants">Size: {item.size}</p>
                    ) : null}
                    <div className="cart-item-actions">
                      <div className="cart-qty">
                        <button
                          type="button"
                          aria-label="Giảm số lượng"
                          onClick={() =>
                            updateQuantity(item.lineId, item.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Tăng số lượng"
                          disabled={atMaxStock || stock <= 0}
                          onClick={() =>
                            updateQuantity(item.lineId, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                        </div>
                      <button
                        type="button"
                        className="cart-item-remove"
                        onClick={() => removeItem(item.lineId)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </li>
              );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Tổng cộng</span>
              <strong>{totalLabel}</strong>
            </div>
            <button type="button" className="cart-checkout-btn">
              Thanh toán
            </button>
            <button
              type="button"
              className="cart-clear-btn"
              onClick={clearCart}
            >
              Xóa toàn bộ giỏ hàng
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
