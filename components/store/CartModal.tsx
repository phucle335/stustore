"use client";


import { ProductImage } from "@/components/store/ProductImage";
import { MobileOverlayLogoHeader } from "@/components/store/MobileOverlayLogoHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import styles from "@/styles/components/store/CartModal.module.css";

export function CartModal() {
  const router = useRouter();
  const {
    items,
    itemCount,
    totalLabel,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    getStock,
  } = useCart();

  return (
    <div
      className={`${styles.cartSidebar} ${isOpen ? styles.open : ""}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className={styles.cartSidebarBackdrop}
        onClick={closeCart}
        aria-label="Close cart"
        tabIndex={isOpen ? 0 : -1}
      />

      <aside
        className={styles.cartSidebarPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-sidebar-title"
      >
        <div className={styles.cartLogoWrap}>
          <MobileOverlayLogoHeader
            onClose={closeCart}
            closeLabel="Close cart"
          />
        </div>
        <div className={styles.cartSidebarHeader}>
          <h2 id="cart-sidebar-title">
            Cart
            {itemCount > 0 ? (
              <span className={styles.cartSidebarCount}> ({itemCount})</span>
            ) : null}
          </h2>
        </div>

        <div className={styles.cartSidebarBody}>
          {items.length === 0 ? (
            <div className={styles.cartEmpty}>
              <i className="fas fa-shopping-bag" aria-hidden="true" />
              <p>Your cart is empty</p>
              <button
                type="button"
                className={styles.cartContinueBtn}
                onClick={closeCart}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className={styles.cartItems}>
              {items.map((item) => {
                const stock = getStock(item.productId, item.size);
                const atMaxStock = item.quantity >= stock;

                return (
                <li key={item.lineId} className={styles.cartItem}>
                  <Link
                    href={`/products/${item.productId}`}
                    className={styles.cartItemImage}
                    onClick={closeCart}
                  >
                    <ProductImage
                      src={item.image}
                      alt={item.imageAlt}
                      width={80}
                      height={80}
                    />
                  </Link>
                  <div className={styles.cartItemInfo}>
                    <p className={styles.brand}>{item.brand}</p>
                    <Link
                      href={`/products/${item.productId}`}
                      className={styles.cartItemName}
                      onClick={closeCart}
                    >
                      {item.name}
                    </Link>
                    <p className={styles.cartItemPrice}>{item.price}</p>
                    {item.size ? (
                      <p className={styles.cartItemVariants}>Size: {item.size}</p>
                    ) : null}
                    <div className={styles.cartItemActions}>
                      <div className={styles.cartQty}>
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(item.lineId, item.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
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
                        className={styles.cartItemRemove}
                        onClick={() => removeItem(item.lineId)}
                      >
                        Remove
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
          <div className={styles.cartFooter}>
            <div className={styles.cartTotalRow}>
              <span>Total</span>
              <strong>{totalLabel}</strong>
            </div>
            <button
              type="button"
              className={styles.cartCheckoutBtn}
              onClick={() => {
                closeCart();
                router.push("/checkout");
              }}
            >
              Checkout
            </button>
            <button
              type="button"
              className={styles.cartClearBtn}
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
