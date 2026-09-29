import type { Metadata } from "next";
import GalleryGrid from "@/components/GalleryGrid";

export const metadata: Metadata = {
  title: "গ্যালারি | Uttolon",
  description: "উত্তোলনের ক্লাসরুম, ইভেন্ট ও কার্যক্রমের ছবি।",
};

export default function GalleryPage() {
  return (
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">Gallery</p>
        <h1 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">গ্যালারি</h1>
        <p className="mt-3 max-w-xl text-[15px] text-ink-soft">
          উত্তোলনের ক্লাসরুম, প্র্যাকটিক্যাল সেশন ও বিভিন্ন আয়োজনের কিছু মুহূর্ত।
        </p>
        <div className="mt-8">
          <GalleryGrid />
        </div>
      </div>
    </section>
  );
}
