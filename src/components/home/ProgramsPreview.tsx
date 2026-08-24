import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const programs = [
  {
    title: "Regular Academic Program",
    bn: "নিয়মিত একাডেমিক প্রোগ্রাম",
    desc: "দীর্ঘমেয়াদী, কাঠামোবদ্ধ শিক্ষার জন্য।",
  },
  {
    title: "Revision Batch",
    bn: "রিভিশন ব্যাচ",
    desc: "প্রাথমিক পড়াশোনা শেষ, এখন দরকার নিয়মিত পুনরাবৃত্তি।",
  },
  {
    title: "Recovery Batch",
    bn: "রিকভারি ব্যাচ",
    desc: "একটি বা একাধিক বিষয়ে দুর্বল শিক্ষার্থীদের জন্য।",
    highlight: true,
  },
  {
    title: "Final Preparation Batch",
    bn: "ফাইনাল প্রিপারেশন ব্যাচ",
    desc: "পরীক্ষার আগে নিবিড় রিভিশন ও মডেল টেস্ট।",
  },
  {
    title: "SSC / Dakhil Program",
    bn: "SSC / দাখিল প্রোগ্রাম",
    desc: "Class 9, Class 10, SSC ও দাখিল শিক্ষার্থীদের জন্য।",
  },
];

export default function ProgramsPreview() {
  return (
    <section className="border-b border-line bg-paper-raised">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">প্রোগ্রাম</p>
            <h2 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">
              দুর্বলতা শেষ নয় — সঠিক Recovery দরকার।
            </h2>
          </div>
          <Link
            href="/programs"
            className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-gold-deep"
          >
            সব প্রোগ্রাম দেখুন <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <div
              key={p.title}
              className={`rounded-sm border p-6 ${
                p.highlight ? "border-gold bg-ink text-paper" : "border-line bg-paper"
              }`}
            >
              <h3 className="font-display-bn text-lg">{p.bn}</h3>
              <p
                className={`font-label mt-1 text-[11px] uppercase tracking-wide ${
                  p.highlight ? "text-gold" : "text-ink-soft/60"
                }`}
              >
                {p.title}
              </p>
              <p className={`mt-3 text-sm leading-relaxed ${p.highlight ? "text-paper/75" : "text-ink-soft"}`}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
