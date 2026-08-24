import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <section>
      <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center sm:px-8 sm:py-32">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-paper-raised text-gold-deep">
          <Compass size={26} strokeWidth={1.6} />
        </span>
        <p className="font-label mt-6 text-xs uppercase tracking-[0.2em] text-gold-deep">404</p>
        <h1 className="mt-3 font-display-bn text-2xl text-ink sm:text-3xl">
          এই পাতাটি খুঁজে পাওয়া যায়নি
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          লিংকটি হয়তো পরিবর্তিত হয়েছে বা পাতাটি এখনো তৈরি হয়নি।
        </p>
        <Link
          href="/"
          className="mt-8 rounded-sm bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-gold-deep"
        >
          হোমপেজে ফিরে যান
        </Link>
      </div>
    </section>
  );
}
