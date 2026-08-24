import { Quote } from "lucide-react";

export default function SuccessStories() {
  return (
    <section className="border-b border-line bg-paper-raised">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-xl">
          <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">Student Success</p>
          <h2 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">
            ফলাফল নয়, অগ্রগতির গল্প
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-sm border border-dashed border-line p-7">
              <Quote size={20} className="text-ink-soft/30" />
              <p className="mt-4 text-sm leading-relaxed text-ink-soft/60">
                যাচাইকৃত শিক্ষার্থীর অগ্রগতির গল্প শীঘ্রই যুক্ত হবে।
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-ink-soft/60">
          প্রতিটি প্রকাশিত ফলাফল ও testimonial অ্যাডমিন-যাচাইকৃত ডেটার ভিত্তিতে দেওয়া হবে —
          কোনো ফলাফল কল্পিতভাবে দেখানো হয় না।
        </p>
      </div>
    </section>
  );
}
