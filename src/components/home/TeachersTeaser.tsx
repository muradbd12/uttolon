"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { User, ArrowUpRight } from "lucide-react";

type Profile = { name: string; subject: string; photoUrl: string };

export default function TeachersTeaser() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "teacherProfiles"), where("published", "==", true));
        const snapshot = await getDocs(q);
        setProfiles(snapshot.docs.slice(0, 3).map((d) => d.data() as Profile));
      } catch {
        setProfiles([]);
      }
    }
    load();
  }, []);

  return (
    <section id="teachers" className="scroll-mt-20 border-b border-line bg-paper-raised">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">আমাদের শিক্ষক</p>
            <h2 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">
              মেধাবী বিশ্ববিদ্যালয় শিক্ষার্থীদের একাডেমিক সক্ষমতা
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              প্রতিটি শিক্ষকের প্রোফাইল যাচাইকৃত ও অ্যাডমিন প্যানেল থেকে সম্পাদনযোগ্য।
              যাচাই সম্পন্ন না হওয়া পর্যন্ত কোনো নাম বা প্রতিষ্ঠান এখানে দেখানো হচ্ছে না।
            </p>
          </div>
          <Link
            href="/teachers"
            className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-gold-deep"
          >
            সব শিক্ষক দেখুন <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {profiles && profiles.length > 0
            ? profiles.map((p, i) => (
                <div key={i} className="flex flex-col items-center rounded-sm border border-line bg-paper p-8 text-center">
                  <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-paper-raised text-ink-soft/40">
                    {p.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.photoUrl} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <User size={26} strokeWidth={1.4} />
                    )}
                  </span>
                  <h3 className="mt-4 font-display-bn text-base text-ink">{p.name}</h3>
                  <p className="mt-1 text-sm text-gold-deep">{p.subject}</p>
                </div>
              ))
            : [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center rounded-sm border border-dashed border-line p-8 text-center"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper text-ink-soft/40">
                    <User size={26} strokeWidth={1.4} />
                  </span>
                  <p className="mt-4 text-sm text-ink-soft/60">শিক্ষকের প্রোফাইল শীঘ্রই যুক্ত হবে</p>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
