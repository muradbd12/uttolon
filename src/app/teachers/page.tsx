import type { Metadata } from "next";
import { User, BadgeCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "শিক্ষক | Uttolon",
  description: "উত্তোলনের শিক্ষকমণ্ডলী — মেধাবী বিশ্ববিদ্যালয় শিক্ষার্থীদের একাডেমিক সক্ষমতা।",
};

export default function TeachersPage() {
  return (
    <section>
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">আমাদের শিক্ষক</p>
        <h1 className="mt-4 font-display-bn text-3xl text-ink sm:text-4xl">
          মেধাবী বিশ্ববিদ্যালয় শিক্ষার্থীদের একাডেমিক সক্ষমতা
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          উত্তোলনের লক্ষ্য মেধাবী বিশ্ববিদ্যালয় শিক্ষার্থীদের একাডেমিক সক্ষমতাকে
          স্থানীয় শিক্ষার্থীদের কাছে পৌঁছে দেওয়া। প্রতিটি শিক্ষকের প্রোফাইল
          প্রকাশের আগে যাচাই করা হয় — নাম, প্রতিষ্ঠান বা অভিজ্ঞতা সংক্রান্ত কোনো
          তথ্য যাচাই ছাড়া প্রকাশ করা হয় না।
        </p>

        <div className="mt-6 flex items-center gap-2 text-sm text-teal-deep">
          <BadgeCheck size={16} />
          <span>প্রতিটি প্রোফাইল যাচাইকৃত ও অ্যাডমিন প্যানেল থেকে সম্পাদনযোগ্য</span>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-sm border border-dashed border-line p-8 text-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper-raised text-ink-soft/40">
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
