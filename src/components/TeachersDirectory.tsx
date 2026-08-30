"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { User, Loader2 } from "lucide-react";

type Profile = {
  name: string;
  subject: string;
  institution: string;
  department: string;
  experience: string;
  bio: string;
  photoUrl: string;
};

export default function TeachersDirectory() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "teacherProfiles"), where("published", "==", true));
        const snapshot = await getDocs(q);
        setProfiles(snapshot.docs.map((d) => d.data() as Profile));
      } catch {
        setProfiles([]);
      }
    }
    load();
  }, []);

  if (profiles === null) {
    return (
      <div className="mt-10 flex items-center justify-center gap-2 py-16 text-ink-soft">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">লোড হচ্ছে...</span>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center rounded-sm border border-dashed border-line p-8 text-center"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper-raised text-ink-soft/40">
              <User size={26} strokeWidth={1.4} />
            </span>
            <p className="mt-4 text-sm text-ink-soft/60">শিক্ষকের প্রোফাইল শীঘ্রই যুক্ত হবে</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {profiles.map((p, i) => (
        <div key={i} className="rounded-sm border border-line bg-paper-raised p-6 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-paper text-ink-soft/40">
            {p.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.photoUrl} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <User size={30} strokeWidth={1.4} />
            )}
          </span>
          <h3 className="mt-4 font-display-bn text-lg text-ink">{p.name}</h3>
          <p className="mt-1 text-sm text-gold-deep">{p.subject}</p>
          {p.institution && <p className="mt-2 text-xs text-ink-soft/70">{p.institution}</p>}
          {p.experience && <p className="mt-1 text-xs text-ink-soft/60">অভিজ্ঞতা: {p.experience}</p>}
          {p.bio && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.bio}</p>}
        </div>
      ))}
    </div>
  );
}
