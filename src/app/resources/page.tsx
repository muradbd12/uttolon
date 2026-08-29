import type { Metadata } from "next";
import ResourceLibrary from "@/components/ResourceLibrary";

export const metadata: Metadata = {
  title: "রিসোর্স লাইব্রেরি | Uttolon",
  description: "নোট, ওয়ার্কশিট, মডেল টেস্ট ও অন্যান্য শিক্ষা উপকরণ — ক্লাস ও বিষয় অনুযায়ী খুঁজুন।",
};

export default function ResourcesPage() {
  return (
    <section>
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">Resource Library</p>
        <h1 className="mt-4 font-display-bn text-3xl text-ink sm:text-4xl">রিসোর্স লাইব্রেরি</h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          নোট, ওয়ার্কশিট, মডেল টেস্ট ও অন্যান্য উপকরণ — ক্লাস, বিষয় ও ধরন অনুযায়ী খুঁজুন।
        </p>
        <div className="mt-9">
          <ResourceLibrary />
        </div>
      </div>
    </section>
  );
}
