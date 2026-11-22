"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { cartCount, useCart } from "@/lib/cart";

// Appears on the book-shop pages once something is in the cart.
export default function CartFloatingButton() {
  const count = cartCount(useCart());
  if (count === 0) return null;
  return (
    <Link
      href="/books/cart"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper shadow-lg transition-colors hover:bg-gold-deep"
    >
      <ShoppingCart size={17} /> কার্ট ({count.toLocaleString("bn-BD")})
    </Link>
  );
}
