"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchProductStockMap,
  getStockFromMap,
} from "@/lib/store/product-stock-client";
import type { ProductStockSnapshot } from "@/lib/store/products-data";
import {
  type AddToCartInput,
  type CartItem,
  buildCartLineId,
  formatPriceVnd,
  getCartItemCount,
  getCartTotalVnd,
  loadCartFromStorage,
  saveCartToStorage,
} from "@/lib/store/cart";
import { CartModal } from "./CartModal";
import { useToast } from "./ToastProvider";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalLabel: string;
  getStock: (productId: string, size?: string) => number;
  addItem: (item: AddToCartInput) => boolean;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => boolean;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [stockMap, setStockMap] = useState<Record<string, ProductStockSnapshot>>(
    {},
  );

  useEffect(() => {
    setItems(loadCartFromStorage());
    setHydrated(true);
    void fetchProductStockMap()
      .then(setStockMap)
      .catch(() => setStockMap({}));
  }, []);

  const resolveStock = useCallback(
    (productId: string, size?: string) =>
      getStockFromMap(stockMap, productId, size),
    [stockMap],
  );

  useEffect(() => {
    if (hydrated) {
      saveCartToStorage(items);
    }
  }, [items, hydrated]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const addItem = useCallback(
    (input: AddToCartInput): boolean => {
      const stock = resolveStock(input.productId, input.size);
      const lineId =
        input.lineId ?? buildCartLineId(input.productId, undefined, input.size);

      if (stock <= 0) {
        showToast(
          input.size
            ? `Size ${input.size} đã hết hàng`
            : "Sản phẩm đã hết hàng",
          "error",
        );
        return false;
      }

      const existing = items.find((item) => item.lineId === lineId);
      const nextQuantity = existing ? existing.quantity + 1 : 1;

      if (nextQuantity > stock) {
        showToast(
          input.size
            ? `Size ${input.size} chỉ còn ${stock} sản phẩm`
            : `Chỉ còn ${stock} sản phẩm trong kho`,
          "error",
        );
        return false;
      }

      setItems((prev) => {
        const current = prev.find((item) => item.lineId === lineId);

        if (current) {
          return prev.map((item) =>
            item.lineId === lineId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        }

        return [...prev, { ...input, lineId, quantity: 1 }];
      });

      showToast("Đã thêm vào giỏ hàng thành công", "success");
      return true;
    },
    [items, showToast, resolveStock],
  );

  const removeItem = useCallback((lineId: string): void => {
    setItems((prev) => prev.filter((item) => item.lineId !== lineId));
  }, []);

  const updateQuantity = useCallback(
    (lineId: string, quantity: number): boolean => {
      if (quantity < 1) {
        removeItem(lineId);
        return true;
      }

      const cartLine = items.find((item) => item.lineId === lineId);

      if (!cartLine) {
        return false;
      }

      const stock = resolveStock(cartLine.productId, cartLine.size);

      if (stock <= 0) {
        showToast(
          cartLine.size
            ? `Size ${cartLine.size} đã hết hàng`
            : "Sản phẩm đã hết hàng",
          "error",
        );
        removeItem(lineId);
        return false;
      }

      if (quantity > stock) {
        showToast(
          cartLine.size
            ? `Size ${cartLine.size} chỉ còn ${stock} sản phẩm`
            : `Chỉ còn ${stock} sản phẩm trong kho`,
          "error",
        );
        return false;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.lineId === lineId ? { ...item, quantity } : item,
        ),
      );

      return true;
    },
    [items, removeItem, showToast, resolveStock],
  );

  const clearCart = useCallback((): void => {
    setItems([]);
  }, []);

  const openCart = useCallback((): void => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback((): void => {
    setIsOpen(false);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: getCartItemCount(items),
      totalLabel: formatPriceVnd(getCartTotalVnd(items)),
      getStock: resolveStock,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isOpen,
      openCart,
      closeCart,
    }),
    [
      items,
      resolveStock,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isOpen,
      openCart,
      closeCart,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartModal />
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
