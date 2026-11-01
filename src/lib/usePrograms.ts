"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { DEFAULT_PROGRAMS, type Program } from "./programs";
import { getProgramFee } from "./programFees";

// Loads the admin-managed program list. Falls back to the built-in defaults when
// nothing has been saved yet, or if reading fails (e.g. rules not published yet),
// so the site and the admission form never break.
let cache: Program[] | null = null;
let inflight: Promise<Program[]> | null = null;

async function fetchPrograms(): Promise<Program[]> {
  try {
    const snap = await getDocs(collection(getFirebaseDb(), "programs"));
    const list = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Program, "id">) }))
      .filter((p) => p.active !== false && !!p.title)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));
    return list.length > 0 ? list : DEFAULT_PROGRAMS;
  } catch {
    return DEFAULT_PROGRAMS;
  }
}

export function clearProgramsCache() {
  cache = null;
  inflight = null;
}

export function usePrograms(): Program[] {
  const [programs, setPrograms] = useState<Program[]>(cache ?? DEFAULT_PROGRAMS);

  useEffect(() => {
    let cancelled = false;
    if (cache) {
      setPrograms(cache);
      return;
    }
    if (!inflight) {
      inflight = fetchPrograms().then((list) => {
        cache = list;
        inflight = null;
        return list;
      });
    }
    inflight.then((list) => {
      if (!cancelled) setPrograms(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return programs;
}

// Fee for a program name; falls back to the built-in table for names not in the list.
export function feeOf(programs: Program[], title: string): number {
  return programs.find((p) => p.title === title)?.fee ?? getProgramFee(title);
}
