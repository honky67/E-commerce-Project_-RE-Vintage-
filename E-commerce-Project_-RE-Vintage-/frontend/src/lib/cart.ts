"use client";

import { useEffect, useState } from "react";

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  image?: string;
  stockCount: number;
  quantity: number;
  option: string;
  category?: string;
  vendorName?: string;
}

const CART_KEY = "rv_cart";
const EVENT_KEY = "rv:cart-updated";

export function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch {
    // LocalStorage quota or access error
  }
}

export function addToCart(
  item: Omit<CartItem, "quantity">,
  quantity = 1,
): { success: boolean; message: string } {
  if (item.stockCount <= 0) {
    return {
      success: false,
      message: `"${item.title}" is out of stock and cannot be added.`,
    };
  }

  const items = getStoredCart();
  const index = items.findIndex(
    (i) => i.productId === item.productId && i.option === item.option,
  );

  if (index >= 0) {
    const current = items[index];
    const newQty = current.quantity + quantity;
    if (newQty > item.stockCount) {
      current.quantity = item.stockCount;
      saveStoredCart(items);
      return {
        success: false,
        message: `Maximum available stock (${item.stockCount}) reached for "${item.title}".`,
      };
    }
    current.quantity = newQty;
    current.stockCount = item.stockCount; // update snapshot
    saveStoredCart(items);
    return { success: true, message: `Added to crate (${current.quantity} in crate).` };
  }

  const initialQty = Math.min(Math.max(1, quantity), item.stockCount);
  items.push({ ...item, quantity: initialQty });
  saveStoredCart(items);
  return { success: true, message: `Added "${item.title}" to crate!` };
}

export function removeFromCart(productId: string, option: string): void {
  const items = getStoredCart().filter(
    (i) => !(i.productId === productId && i.option === option),
  );
  saveStoredCart(items);
}

export function updateQuantity(
  productId: string,
  option: string,
  newQuantity: number,
): { success: boolean; message?: string } {
  const items = getStoredCart();
  const index = items.findIndex(
    (i) => i.productId === productId && i.option === option,
  );
  if (index < 0) return { success: false, message: "Item not in crate" };

  if (newQuantity <= 0) {
    items.splice(index, 1);
    saveStoredCart(items);
    return { success: true, message: "Item removed" };
  }

  const item = items[index];
  if (newQuantity > item.stockCount) {
    item.quantity = item.stockCount;
    saveStoredCart(items);
    return {
      success: false,
      message: `Only ${item.stockCount} available in stock.`,
    };
  }

  item.quantity = newQuantity;
  saveStoredCart(items);
  return { success: true };
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch {
    // Ignore
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(getStoredCart());
    setIsLoaded(true);

    const onUpdate = () => {
      setItems(getStoredCart());
    };

    window.addEventListener(EVENT_KEY, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(EVENT_KEY, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    items,
    itemCount,
    subtotal,
    isLoaded,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}
