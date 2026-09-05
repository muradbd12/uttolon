"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Atom, FlaskConical, Shapes, Microscope, ArrowUpRight } from "lucide-react";

type Entry = { id: string; title: string; category: string; description: string; photoUrl: string };

const categoryIcon: Record<string, typeof Atom> = {
  "Physics Experiment": Atom,
  "Chemistry Experiment": FlaskConical,
  "Biology Observation": Microscope,
  "Geometry Model": Shapes,
};

const fallbackItems = [
  { icon: Atom, bn: "Physics Experiment", desc: "বাস্তব পরীক্ষণের মাধ্যমে সূত্র বোঝা।" },
  { icon: FlaskConical, bn: "Chemistry Experiment", desc: "বিক্রিয়া প্রত্যক্ষ পর্যবেক্ষণ ও ব্যাখ্যা।" },
  { icon: Microscope, bn: "Biology Observation", desc: "জীবজগৎ পর্যবেক্ষণ ও বিশ্লেষণ।" },
  { icon: Shapes, bn: "Geometry Model", desc: "হাতে-কলমে জ্যামিতিক ধারণা গঠন।" },
];

export default function PracticalLearningTeaser() {
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(
          collection(db, "practicalLearning"),
          where("published", "==", true),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        setEntries(snapshot.docs.slice(0, 4).map((d) => ({ id: d.id, ...d.data() } as Entry)));
      } catch {
        setEntries([]);
      }
    }
    load();
  }, []);

  const hasReal = entries && entries.length > 0;

  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="font-label text-xs uppercase tracking-[0.2em] text-teal">Practical Learning</p>
            <h2 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">শেখা হবে হাতে-কলমে</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              সূত্র মুখস্থ নয় — প্রতিটি ধারণা যাচাই হয় বাস্তব পরীক্ষণ ও পর্যবেক্ষণের মাধ্যমে।
            </p>
          </div>
          {hasReal && (
            <Link
              href="/practical-learning"
              className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-gold-deep"
            >
              সব দেখুন <ArrowUpRight size={15} />
            </Link>
          )}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {hasReal
            ? entries!.map((entry) => {
                const Icon = categoryIcon[entry.category] || Atom;
                return (
                  <Link
                    key={entry.id}
                    href="/practical-learning"
                    className="overflow-hidden rounded-sm border border-line transition-colors hover:border-ink"
                  >
                    {entry.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={entry.photoUrl} alt={entry.title} className="h-32 w-full object-cover" />
                    ) : (
                      <div className="flex h-32 w-full items-center justify-center bg-paper-raised">
                        <Icon size={24} className="text-teal" strokeWidth={1.6} />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-display-bn text-base text-ink">{entry.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft line-clamp-2">
                        {entry.description}
                      </p>
                    </div>
                  </Link>
                );
              })
            : fallbackItems.map(({ icon: Icon, bn, desc }) => (
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
