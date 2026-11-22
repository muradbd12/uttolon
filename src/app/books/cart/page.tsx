import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CartView from "@/components/CartView";

export const metadata: Metadata = {
  title: "বইয়ের কার্ট | Uttolon",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <Link href="/books" className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft size={14} /> বই সংগ্রহে ফিরুন
        </Link>
        <h1 className="mt-4 font-display-bn text-3xl text-ink sm:text-4xl">কার্ট ও অর্ডার</h1>
        <div className="mt-8">
          <CartView />
        </div>
      </div>
    </section>
  );
}
