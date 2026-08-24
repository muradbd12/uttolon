const stats = [
  { label: "শিক্ষার্থী", en: "Students" },
  { label: "শিক্ষক", en: "Teachers" },
  { label: "কোর্স", en: "Courses" },
  { label: "সম্পন্ন মূল্যায়ন", en: "Assessments" },
];

export default function TrustStats() {
  return (
    <section className="border-b border-line bg-paper-raised">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
          {stats.map((s) => (
            <div key={s.en} className="border-l border-line pl-4">
              <div className="font-display-en text-3xl text-ink">—</div>
              <div className="mt-1 text-sm text-ink-soft">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-ink-soft/70">
          * প্রকৃত সংখ্যা অ্যাডমিন ড্যাশবোর্ড থেকে যুক্ত হওয়ার পর এখানে দেখানো হবে।
        </p>
      </div>
    </section>
  );
}
