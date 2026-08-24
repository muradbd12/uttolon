import type { Metadata } from "next";
import NoticesBoard from "@/components/NoticesBoard";

export const metadata: Metadata = {
  title: "নোটিশ | Uttolon",
  description: "উত্তোলনের সকল একাডেমিক ও প্রশাসনিক নোটিশ।",
};

export default function NoticesPage() {
  return (
    <section>
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">Notice Board</p>
        <h1 className="mt-4 font-display-bn text-3xl text-ink sm:text-4xl">নোটিশ</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          ভর্তি, পরীক্ষা, ফলাফল ও ছুটি সংক্রান্ত সকল ঘোষণা এখানে প্রকাশিত হবে।
        </p>

        <div className="mt-9">
          <NoticesBoard />
        </div>
      </div>
    </section>
  );
}
