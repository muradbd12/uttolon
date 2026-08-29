import Link from "next/link";

const options = [
  "সম্পূর্ণ বিনামূল্যে শিক্ষা (Free Education)",
  "আংশিক বৃত্তি (Partial Scholarship)",
  "প্রয়োজনভিত্তিক সহায়তা (Need-based Support)",
];

export default function Scholarship() {
  return (
    <section className="border-b border-line bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <p className="font-label text-xs uppercase tracking-[0.2em] text-gold">
              উত্তোলন সবার জন্য
            </p>
            <h2 className="mt-3 font-display-bn text-3xl sm:text-4xl">
              শিক্ষার সুযোগ শুধু সামর্থ্যের ওপর নির্ভর করবে না
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-paper/70">
              মেধাবী ও প্রয়োজনগ্রস্ত শিক্ষার্থীদের জন্য উত্তোলন নির্বাচিতভাবে সহায়তা
              প্রদান করে।
            </p>
            <Link
              href="/scholarship"
              className="mt-7 inline-flex rounded-sm bg-gold px-6 py-3 text-sm font-medium text-ink hover:bg-gold-soft"
            >
              বৃত্তি সম্পর্কে জানুন
            </Link>
          </div>

          <ul className="space-y-3">
            {options.map((o) => (
              <li
                key={o}
                className="rounded-sm border border-paper/15 px-5 py-4 text-sm text-paper/85"
              >
                {o}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
