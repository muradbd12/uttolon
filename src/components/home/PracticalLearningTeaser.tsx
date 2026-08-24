import { Atom, FlaskConical, Shapes, Microscope } from "lucide-react";

const items = [
  { icon: Atom, bn: "Physics Experiment", desc: "বাস্তব পরীক্ষণের মাধ্যমে সূত্র বোঝা।" },
  { icon: FlaskConical, bn: "Chemistry Experiment", desc: "বিক্রিয়া প্রত্যক্ষ পর্যবেক্ষণ ও ব্যাখ্যা।" },
  { icon: Microscope, bn: "Biology Observation", desc: "জীবজগৎ পর্যবেক্ষণ ও বিশ্লেষণ।" },
  { icon: Shapes, bn: "Geometry Model", desc: "হাতে-কলমে জ্যামিতিক ধারণা গঠন।" },
];

export default function PracticalLearningTeaser() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-xl">
          <p className="font-label text-xs uppercase tracking-[0.2em] text-teal">Practical Learning</p>
          <h2 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">
            শেখা হবে হাতে-কলমে
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            সূত্র মুখস্থ নয় — প্রতিটি ধারণা যাচাই হয় বাস্তব পরীক্ষণ ও পর্যবেক্ষণের
            মাধ্যমে।
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, bn, desc }) => (
            <div key={bn} className="rounded-sm border border-line p-6">
              <Icon size={22} className="text-teal" strokeWidth={1.6} />
              <h3 className="mt-4 font-display-bn text-base text-ink">{bn}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
