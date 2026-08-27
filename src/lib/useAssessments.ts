"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type AssessmentEntry = {
  subject: string;
  concept: number;
  practice: number;
  assessment: number;
  recoveryActive: boolean;
  comment?: string;
};

// একজন শিক্ষার্থীর সব বিষয়ের সর্বশেষ মূল্যায়ন — Student নিজের জন্য,
// Guardian তাদের যুক্ত শিক্ষার্থীর জন্য ব্যবহার করে।
export function useAssessments(studentUid: string | null | undefined) {
  const [entries, setEntries] = useState<AssessmentEntry[] | null>(null);

  useEffect(() => {
    if (!studentUid) return;
    let cancelled = false;
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "assessments"), where("studentUid", "==", studentUid));
        const snapshot = await getDocs(q);
        if (!cancelled) {
          setEntries(snapshot.docs.map((d) => d.data() as AssessmentEntry));
        }
      } catch {
        if (!cancelled) setEntries([]);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [studentUid]);

  return entries;
}
