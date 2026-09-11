"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "itarintakes:cart";

const EMPTY_CART: CartItem[] = [];

let cachedItems: CartItem[] | null = null;
let listeners: (() => void)[] = [];

function readCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}

function getSnapshot(): CartItem[] {
  if (cachedItems === null) cachedItems = readCart();
  return cachedItems;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function setCart(items: CartItem[]) {
  cachedItems = items;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore write failures (e.g. private browsing storage limits)
  }
  listeners.forEach((listener) => listener());
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((item: CartItem) => {
    const current = getSnapshot();
    const existing = current.find((line) => line.variantId === item.variantId);
    setCart(
      existing
        ? current.map((line) =>
            line.variantId === item.variantId
              ? { ...line, quantity: line.quantity + item.quantity }
              : line
          )
        : [...current, item]
    );
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    const current = getSnapshot();
    setCart(
      quantity <= 0
        ? current.filter((line) => line.variantId !== variantId)
        : current.map((line) =>
            line.variantId === variantId ? { ...line, quantity } : line
          )
    );
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setCart(getSnapshot().filter((line) => line.variantId !== variantId));
  }, []);

  const clear = useCallback(() => setCart([]), []);

  const { itemCount, subtotal } = useMemo(
    () => ({
      itemCount: items.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: items.reduce((sum, line) => sum + line.quantity * line.price, 0),
    }),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotal, addItem, updateQuantity, removeItem, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
