"use client";

import { useSyncExternalStore } from "react";

// Shopping cart kept in the visitor's own browser (localStorage) — no account needed.
// A line is a single book or a whole book set; prices are always re-read from the
// database on the cart page and again on the server when the order is placed.
export type CartLine = { type: "book" | "bundle"; id: string; qty: number };

const KEY = "uttolon-cart-v1";
const EVENT = "uttolon-cart-change";
const EMPTY: CartLine[] = [];
let cached: { raw: string | null; value: CartLine[] } = { raw: null, value: EMPTY };

function read(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cached.raw) return cached.value;
    const parsed = raw ? (JSON.parse(raw) as CartLine[]) : EMPTY;
    const value = Array.isArray(parsed)
      ? parsed.filter((l) => l && (l.type === "book" || l.type === "bundle") && typeof l.id === "string" && l.qty > 0)
      : EMPTY;
    cached = { raw, value: value.length ? value : EMPTY };
    return cached.value;
  } catch {
    return EMPTY;
  }
}

function write(lines: CartLine[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // storage blocked (private mode) — the cart just won't persist
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((s, l) => s + l.qty, 0);
}

export function addToCart(type: CartLine["type"], id: string) {
  const lines = [...read()];
  const i = lines.findIndex((l) => l.type === type && l.id === id);
  if (i >= 0) lines[i] = { ...lines[i], qty: Math.min(lines[i].qty + 1, 20) };
  else lines.push({ type, id, qty: 1 });
  write(lines);
}

export function setQty(type: CartLine["type"], id: string, qty: number) {
  const q = Math.max(0, Math.min(Math.round(qty), 20));
  write(read().flatMap((l) => (l.type === type && l.id === id ? (q > 0 ? [{ ...l, qty: q }] : []) : [l])));
}

export function clearCart() {
  write([]);
}
