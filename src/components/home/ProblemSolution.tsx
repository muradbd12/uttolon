const problems = [
  "পড়ছে, কিন্তু বুঝছে না",
  "বুঝছে, কিন্তু প্রয়োগ করতে পারছে না",
  "পড়েছে, কিন্তু পরীক্ষায় ভুল করছে",
  "দুর্বল অধ্যায় শনাক্ত হচ্ছে না",
  "নিয়মিত Revision হচ্ছে না",
  "Guardian প্রকৃত অগ্রগতি জানেন না",
];

const solution = ["Concept", "Practice", "Assessment", "Recovery", "Revision", "Final Preparation"];

export default function ProblemSolution() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-xl">
          <p className="font-label text-xs uppercase tracking-[0.2em] text-clay">শিক্ষার্থীর বাস্তবতা</p>
          <h2 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">
            শিক্ষার্থীর সমস্যা কোথায়?
          </h2>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((p) => (
            <div
              key={p}
              className="flex items-start gap-3 rounded-sm border border-line bg-paper-raised p-5"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
              <p className="text-[15px] leading-relaxed text-ink">{p}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-line pt-14">
          <p className="font-label text-xs uppercase tracking-[0.2em] text-teal">উত্তোলনের সমাধান</p>
          <h3 className="mt-3 font-display-bn text-2xl text-ink sm:text-3xl">
            একটি সংযুক্ত শিক্ষা-চক্র, বিচ্ছিন্ন ক্লাস নয়
          </h3>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {solution.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <span className="rounded-sm border border-teal/30 bg-teal-soft px-4 py-2 text-sm font-medium text-teal-deep">
                  {s}
                </span>
                {i < solution.length - 1 && <span className="text-ink-soft/50">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
