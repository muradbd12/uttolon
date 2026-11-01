import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ProgramsList from "@/components/ProgramsList";

export const metadata: Metadata = {
  title: "প্রোগ্রাম | Uttolon",
  description: "উত্তোলনের সকল একাডেমিক প্রোগ্রাম — Regular, Revision, Recovery, Final Preparation, SSC, Dakhil, Alim, HSC ও University Admission।",
};

const ssc2027 = [
  { bn: "চূড়ান্ত প্রস্তুতি ব্যাচ", en: "Final Preparation" },
  { bn: "রিভিশন ব্যাচ", en: "Revision" },
  { bn: "রিকভারি ব্যাচ", en: "Recovery" },
];

const fields = ["টার্গেট শিক্ষার্থী", "মেয়াদ", "বিষয়", "ক্লাসের সময়সূচি", "আসন সংখ্যা", "শিক্ষক", "ফি"];

export default function ProgramsPage() {
  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 sm:py-20">
          <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">প্রোগ্রাম</p>
          <h1 className="mt-4 font-display-bn text-3xl text-ink sm:text-4xl">
            দুর্বলতা শেষ নয় — সঠিক Recovery দরকার।
          </h1>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <ProgramsList />
        </div>
      </section>

      <section className="bg-paper-raised">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="max-w-xl">
            <p className="font-label text-xs uppercase tracking-[0.2em] text-clay">Campaign</p>
            <h2 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">SSC / দাখিল ২০২৭</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              ২০২৭ সালের SSC ও দাখিল পরীক্ষার্থীদের জন্য বিশেষভাবে সাজানো তিনটি ব্যাচ।
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {ssc2027.map((s) => (
              <div key={s.en} className="rounded-sm border border-line bg-paper p-7">
                <h3 className="font-display-bn text-lg text-ink">{s.bn}</h3>
                <p className="font-label mt-1 text-[11px] uppercase tracking-wide text-ink-soft/60">{s.en}</p>
                <dl className="mt-5 space-y-2.5 border-t border-line pt-5">
                  {fields.map((f) => (
                    <div key={f} className="flex justify-between text-sm">
                      <dt className="text-ink-soft">{f}</dt>
                      <dd className="text-ink-soft/50">শীঘ্রই যুক্ত হবে</dd>
                    </div>
                  ))}
                </dl>
                <Link
                  href="/admission"
                  className="mt-6 flex w-fit items-center gap-1.5 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold-deep"
                >
                  ভর্তি হোন <ArrowUpRight size={14} />
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-ink-soft/60">
            * মেয়াদ, ফি, আসন সংখ্যা ও শিক্ষক-তথ্য অ্যাডমিন ড্যাশবোর্ড থেকে যুক্ত হওয়ার পর
            প্রকাশ করা হবে।
          </p>
        </div>
      </section>
    </>
  );
}
