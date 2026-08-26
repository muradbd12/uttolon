"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type AttendanceSummary = { presentDays: number; totalDays: number; percent: number };

// একটা শিক্ষার্থীর সব উপস্থিতি রেকর্ড থেকে মোট শতাংশ হিসাব করে —
// Student নিজের জন্য, Guardian তাদের যুক্ত শিক্ষার্থীর জন্য ব্যবহার করে।
export function useAttendanceSummary(studentUid: string | null | undefined) {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);

  useEffect(() => {
    if (!studentUid) return;
    let cancelled = false;
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "attendance"), where("studentUid", "==", studentUid));
        const snapshot = await getDocs(q);
        const total = snapshot.size;
        const present = snapshot.docs.filter((d) => d.data().status === "present").length;
        if (!cancelled) {
          setSummary({
            presentDays: present,
            totalDays: total,
            percent: total > 0 ? Math.round((present / total) * 100) : 0,
          });
        }
      } catch {
        if (!cancelled) setSummary({ presentDays: 0, totalDays: 0, percent: 0 });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [studentUid]);

  return summary;
}
