"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { addToCart, useCart } from "@/lib/cart";

const bn = (n: number) => n.toLocaleString("bn-BD");

export default function AddToCartButton({
  type,
  id,
  disabled,
  large,
}: {
  type: "book" | "bundle";
  id: string;
  disabled?: boolean;
  large?: boolean;
}) {
  const lines = useCart();
  const [flash, setFlash] = useState(false);
  const inCart = lines.find((l) => l.type === type && l.id === id)?.qty || 0;

  function add(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(type, id);
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={add}
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 rounded-sm font-medium transition-colors disabled:opacity-50 ${
        large ? "px-6 py-3 text-sm" : "w-full px-2 py-1.5 text-xs"
      } ${flash ? "bg-teal-deep text-paper" : "bg-ink text-paper hover:bg-gold-deep"}`}
    >
      {flash ? <Check size={large ? 16 : 13} /> : <ShoppingCart size={large ? 16 : 13} />}
      {flash ? "যোগ হয়েছে" : inCart > 0 ? `কার্টে আছে (${bn(inCart)}) — আরও যোগ করুন` : "কার্টে যোগ করুন"}
    </button>
  );
}
