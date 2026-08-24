const rows = [
  { label: "Concept", value: 82 },
  { label: "Practice", value: 76 },
  { label: "Assessment", value: 71 },
];

export default function ProgressTeaser() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">
            Assessment &amp; Recovery
          </p>
          <h2 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">
            প্রতিটি শিক্ষার্থীর অগ্রগতি, চোখের সামনে
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
            সাপ্তাহিক ও মাসিক মূল্যায়ন থেকে শিক্ষার্থীর দুর্বল অধ্যায় শনাক্ত হয়,
            Recovery নির্ধারিত হয়, এবং Guardian ঘরে বসেই পুরো অগ্রগতি দেখতে পান।
          </p>
        </div>

        <div className="rounded-sm border border-line bg-paper-raised p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display-bn text-lg text-ink">Mathematics</h3>
            <span className="rounded-sm bg-teal-soft px-2.5 py-1 text-xs font-medium text-teal-deep">
              Recovery: Active
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {rows.map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-xs text-ink-soft">
                  <span>{r.label}</span>
                  <span>{r.value}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-line">
                  <div
                    className="h-1.5 rounded-full bg-gold"
                    style={{ width: `${r.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-ink-soft/60">
            Current level: Improving · এটি একটি নমুনা (demo example), প্রকৃত ডেটা নয়।
          </p>
        </div>
      </div>
    </section>
  );
}
