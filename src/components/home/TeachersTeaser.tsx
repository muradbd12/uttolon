import Link from "next/link";
import { User, ArrowUpRight } from "lucide-react";

export default function TeachersTeaser() {
  return (
    <section id="teachers" className="scroll-mt-20 border-b border-line bg-paper-raised">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">আমাদের শিক্ষক</p>
            <h2 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">
              মেধাবী বিশ্ববিদ্যালয় শিক্ষার্থীদের একাডেমিক সক্ষমতা
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              প্রতিটি শিক্ষকের প্রোফাইল যাচাইকৃত ও অ্যাডমিন প্যানেল থেকে সম্পাদনযোগ্য।
              যাচাই সম্পন্ন না হওয়া পর্যন্ত কোনো নাম বা প্রতিষ্ঠান এখানে দেখানো হচ্ছে না।
            </p>
          </div>
          <Link
            href="/teachers"
            className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-gold-deep"
          >
            সব শিক্ষক দেখুন <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-sm border border-dashed border-line p-8 text-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper text-ink-soft/40">
                <User size={26} strokeWidth={1.4} />
              </span>
              <p className="mt-4 text-sm text-ink-soft/60">শিক্ষকের প্রোফাইল শীঘ্রই যুক্ত হবে</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
