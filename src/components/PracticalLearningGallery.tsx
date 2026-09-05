"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Atom, FlaskConical, Microscope, Shapes, ImageOff, Loader2 } from "lucide-react";

type Entry = {
  id: string;
  title: string;
  category: string;
  description: string;
  photoUrl: string;
};

const categoryIcon: Record<string, typeof Atom> = {
  "Physics Experiment": Atom,
  "Chemistry Experiment": FlaskConical,
  "Biology Observation": Microscope,
  "Geometry Model": Shapes,
};

export default function PracticalLearningGallery() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("সব");

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
        setEntries(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Entry)));
      } catch {
        setEntries([]);
      }
    }
    load();
  }, []);

  const categories = useMemo(
    () => ["সব", ...Array.from(new Set((entries || []).map((e) => e.category)))],
    [entries]
  );
  const filtered = (entries || []).filter((e) => categoryFilter === "সব" || e.category === categoryFilter);

  if (entries === null) {
    return (
      <div className="mt-10 flex items-center justify-center gap-2 py-16 text-ink-soft">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">লোড হচ্ছে...</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center gap-3 rounded-sm border border-dashed border-line p-12 text-center">
        <ImageOff size={22} className="text-ink-soft/40" />
        <p className="text-sm text-ink-soft/60">শীঘ্রই বাস্তব ক্লাসরুমের পরীক্ষণ ও পর্যবেক্ষণ যুক্ত হবে।</p>
      </div>
    );
  }

  return (
    <div>
      {categories.length > 2 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoryFilter(c)}
              className={`rounded-sm border px-3.5 py-1.5 text-sm ${
                categoryFilter === c ? "border-ink bg-ink text-paper" : "border-line text-ink-soft"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((entry) => {
          const Icon = categoryIcon[entry.category] || Atom;
          return (
            <div key={entry.id} className="overflow-hidden rounded-sm border border-line bg-paper-raised">
              {entry.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={entry.photoUrl} alt={entry.title} className="h-44 w-full object-cover" />
              ) : (
                <div className="flex h-44 w-full items-center justify-center bg-paper">
                  <Icon size={32} className="text-teal/40" strokeWidth={1.4} />
                </div>
              )}
              <div className="p-5">
                <span className="font-label inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-teal">
                  <Icon size={13} /> {entry.category}
                </span>
                <h3 className="mt-2.5 font-display-bn text-base text-ink">{entry.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{entry.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
