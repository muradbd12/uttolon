import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import TeachersDirectory from "@/components/TeachersDirectory";

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

        <TeachersDirectory />
      </div>
    </section>
  );
}
