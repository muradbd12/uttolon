"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Quote } from "lucide-react";

type Story = {
  id: string;
  displayName: string;
  program?: string;
  beforeScore?: string;
  afterScore?: string;
  testimonial: string;
};

export default function SuccessStories() {
  const [stories, setStories] = useState<Story[] | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(
          collection(db, "successStories"),
          where("published", "==", true),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        setStories(snapshot.docs.slice(0, 3).map((d) => ({ id: d.id, ...d.data() } as Story)));
      } catch {
        setStories([]);
      }
    }
    load();
  }, []);

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
          {stories === null ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="rounded-sm border border-dashed border-line p-7">
                <Quote size={20} className="text-ink-soft/30" />
                <p className="mt-4 text-sm leading-relaxed text-ink-soft/60">লোড হচ্ছে...</p>
              </div>
            ))
          ) : stories.length === 0 ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="rounded-sm border border-dashed border-line p-7">
                <Quote size={20} className="text-ink-soft/30" />
                <p className="mt-4 text-sm leading-relaxed text-ink-soft/60">
                  যাচাইকৃত শিক্ষার্থীর অগ্রগতির গল্প শীঘ্রই যুক্ত হবে।
                </p>
              </div>
            ))
          ) : (
            stories.map((s) => (
              <div key={s.id} className="rounded-sm border border-line bg-paper p-7">
                <Quote size={20} className="text-gold-deep/50" />
                <p className="mt-4 text-sm leading-relaxed text-ink">{s.testimonial}</p>
                <div className="mt-4 border-t border-line pt-3">
                  <p className="text-sm font-medium text-ink">
                    {s.displayName} {s.program ? `— ${s.program}` : ""}
                  </p>
                  {(s.beforeScore || s.afterScore) && (
                    <p className="mt-1 text-xs text-ink-soft/60">
                      {s.beforeScore} → {s.afterScore}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <p className="mt-6 text-xs text-ink-soft/60">
          প্রতিটি প্রকাশিত ফলাফল ও testimonial অ্যাডমিন-যাচাইকৃত ডেটার ভিত্তিতে দেওয়া হয় —
          কোনো ফলাফল কল্পিতভাবে দেখানো হয় না।
        </p>
      </div>
    </section>
  );
}
