const steps = [
  { n: "01", en: "Learn", bn: "শেখা", desc: "নতুন ধারণা শেখা" },
  { n: "02", en: "Understand", bn: "উপলব্ধি", desc: "কেন এবং কীভাবে কাজ করে তা বোঝা" },
  { n: "03", en: "Practice", bn: "অনুশীলন", desc: "নির্দেশিত ও স্বাধীন অনুশীলন" },
  { n: "04", en: "Assess", bn: "মূল্যায়ন", desc: "নিয়মিত মূল্যায়ন" },
  { n: "05", en: "Diagnose", bn: "শনাক্তকরণ", desc: "কোন জায়গায় দুর্বলতা তা শনাক্ত" },
  { n: "06", en: "Recover", bn: "পুনরুদ্ধার", desc: "দুর্বল শিক্ষার্থীর জন্য Recovery" },
  { n: "07", en: "Revise", bn: "পুনরাবৃত্তি", desc: "পরিকল্পিত পুনরাবৃত্তি" },
  { n: "08", en: "Prepare", bn: "প্রস্তুতি", desc: "পরীক্ষার চূড়ান্ত প্রস্তুতি" },
  { n: "09", en: "Perform", bn: "উপস্থাপন", desc: "আত্মবিশ্বাসের সঙ্গে পরীক্ষায় অংশগ্রহণ" },
];

export default function LearningSystem() {
  return (
    <section id="uls" className="scroll-mt-20 border-b border-line bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-xl">
          <p className="font-label text-xs uppercase tracking-[0.2em] text-gold">
            ULS — Uttolon Learning System
          </p>
          <h2 className="mt-3 font-display-bn text-3xl sm:text-4xl">
            নয়টি ধাপে গড়া একটি সম্পূর্ণ শিক্ষা-পদ্ধতি
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-paper/70">
            উত্তোলনের মূল একাডেমিক পদ্ধতি — প্রতিটি ধাপ পরের ধাপের ভিত্তি তৈরি করে,
            যাতে শেখাটা টিকে থাকে পরীক্ষার পরেও।
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-paper/10 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="bg-ink p-6 sm:p-7">
              <span className="font-display-en text-sm text-gold">{s.n}</span>
              <h3 className="mt-3 font-display-bn text-lg text-paper">
                {s.bn} <span className="font-label text-xs text-paper/40">({s.en})</span>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/65">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
