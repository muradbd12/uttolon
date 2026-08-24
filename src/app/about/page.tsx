import type { Metadata } from "next";
import Link from "next/link";
import CycleDiagram from "@/components/CycleDiagram";

export const metadata: Metadata = {
  title: "উত্তোলন সম্পর্কে | Uttolon",
  description: "উত্তোলনের গল্প, দর্শন এবং শেখার পদ্ধতি সম্পর্কে জানুন।",
};

const philosophy = [
  "মুখস্থ নয়, বোঝার মাধ্যমে শিক্ষা",
  "বাস্তব → ধারণা → পরিভাষা → সূত্র → প্রয়োগ",
  "নিয়মিত Assessment",
  "দুর্বল শিক্ষার্থীর জন্য Recovery System",
  "Revision-based learning",
  "Exam-oriented Final Preparation",
  "বাস্তব ও Practical Science Learning",
  "Guardian communication ও Student progress tracking",
];

const problems = [
  "অনেক শিক্ষার্থী নিয়মিত পড়েও ধারণাগত দুর্বলতায় ভোগে",
  "শুধু পরীক্ষা-কেন্দ্রিক পড়াশোনা দীর্ঘমেয়াদে কার্যকর হয় না",
  "দুর্বল শিক্ষার্থীদের জন্য আলাদা Recovery ব্যবস্থা থাকে না",
  "Guardian অনেক সময় সন্তানের প্রকৃত academic progress জানেন না",
  "Practical learning-এর অভাব থাকে",
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 sm:py-24">
          <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">Our Story</p>
          <h1 className="mt-4 font-display-bn text-3xl leading-[1.3] text-ink sm:text-4xl">
            &ldquo;একজন শিক্ষার্থী কেন পড়ছে, কিন্তু বুঝছে না?&rdquo;
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
            এই একটি প্রশ্ন থেকেই উত্তোলনের যাত্রা শুরু। আমরা লক্ষ করেছি —
          </p>
        </div>
      </section>

      <section className="border-b border-line bg-paper-raised">
        <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {problems.map((p) => (
              <div key={p} className="flex items-start gap-3 rounded-sm border border-line bg-paper p-5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                <p className="text-[15px] leading-relaxed text-ink">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2">
          <div>
            <p className="font-label text-xs uppercase tracking-[0.2em] text-teal">সমাধান</p>
            <h2 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">
              একটি সম্পূর্ণ শেখার চক্র
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">
              উত্তোলন শুধু ক্লাস নেয় না — প্রতিটি শিক্ষার্থীকে শেখা থেকে শুরু করে
              পুনরুদ্ধার হয়ে চূড়ান্ত প্রস্তুতি পর্যন্ত একটি সংযুক্ত চক্রের মধ্য দিয়ে
              নিয়ে যায়। কোনো ধাপ এড়িয়ে যাওয়ার সুযোগ নেই — বিশেষত{" "}
              <span className="font-medium text-ink">Recover</span> ধাপটি, যা বেশিরভাগ
              কোচিং সেন্টারে অনুপস্থিত থাকে।
            </p>
            <Link
              href="/#uls"
              className="mt-7 inline-flex text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
            >
              সম্পূর্ণ ৯-ধাপের Uttolon Learning System দেখুন
            </Link>
          </div>
          <CycleDiagram />
        </div>
      </section>

      <section className="border-b border-line bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="font-label text-xs uppercase tracking-[0.2em] text-gold">উত্তোলন বিশ্বাস করে</p>
          <h2 className="mt-3 font-display-bn text-2xl sm:text-3xl">আমাদের দর্শন</h2>
          <div className="mt-9 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {philosophy.map((p) => (
              <div key={p} className="flex items-start gap-3 border-b border-paper/10 pb-4">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <p className="text-[15px] leading-relaxed text-paper/85">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 sm:py-20">
          <h2 className="font-display-bn text-2xl text-ink sm:text-3xl">
            উত্তোলন — শেখা থেকে সাফল্যের পথে একটি সম্পূর্ণ Learning System।
          </h2>
          <Link
            href="/admission"
            className="mt-8 inline-flex rounded-sm bg-ink px-7 py-3.5 text-sm font-medium text-paper hover:bg-gold-deep"
          >
            ভর্তি সম্পর্কে জানুন
          </Link>
        </div>
      </section>
    </>
  );
}
