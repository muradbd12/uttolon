import type { Metadata } from "next";
import BooksBrowser from "@/components/BooksBrowser";

export const metadata: Metadata = {
  title: "বই সংগ্রহ | Uttolon",
  description: "ক্লাস ৩ থেকে HSC এবং বিশ্ববিদ্যালয় ভর্তির জন্য বই সংগ্রহ — বিষয় ও শ্রেণি অনুযায়ী খুঁজুন।",
};

export default function BooksPage() {
  return (
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">Book Library</p>
        <h1 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">বই সংগ্রহ</h1>
        <p className="mt-3 max-w-xl text-[15px] text-ink-soft">
          ক্লাস ৩ থেকে HSC এবং বিশ্ববিদ্যালয়/মেডিকেল/ইঞ্জিনিয়ারিং ভর্তির জন্য পাঠ্যবই ও
          সহায়ক বই — শ্রেণি ও বিষয় অনুযায়ী খুঁজে অর্ডার করুন।
        </p>

        <div className="mt-8">
          <BooksBrowser />
        </div>
      </div>
    </section>
  );
}
