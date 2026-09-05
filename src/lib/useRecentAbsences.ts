"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type AbsenceInfo = { count: number; mostRecentDate: string | null };

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// গত ৭ দিনে কতবার অনুপস্থিত ছিল — Guardian/Student dashboard-এর
// সতর্কতা অংশে দেখানোর জন্য। বড় কোনো নোটিফিকেশন সিস্টেম না, শুধু
// dashboard-এ ঢুকলেই যেন চোখে পড়ে।
export function useRecentAbsences(studentUid: string | null | undefined) {
  const [info, setInfo] = useState<AbsenceInfo | null>(null);

  useEffect(() => {
    if (!studentUid) return;
    let cancelled = false;
    async function load() {
      try {
        const db = getFirebaseDb();
        const cutoff = daysAgo(7);
        // একটাই সরল equality query — এটা কোনো নতুন composite index
        // ছাড়াই কাজ করে (studentUid + date রেঞ্জ একসাথে ফিল্টার করলে
        // Firestore-এ আলাদা index বানাতে হতো, যা এড়ানো হলো)।
        const q = query(collection(db, "attendance"), where("studentUid", "==", studentUid));
        const snapshot = await getDocs(q);
        const absences = snapshot.docs
          .map((d) => d.data())
          .filter((d) => d.status === "absent" && (d.date as string) >= cutoff)
          .sort((a, b) => (b.date as string).localeCompare(a.date as string));
        if (!cancelled) {
          setInfo({
            count: absences.length,
            mostRecentDate: absences.length > 0 ? (absences[0].date as string) : null,
          });
        }
      } catch {
        if (!cancelled) setInfo({ count: 0, mostRecentDate: null });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [studentUid]);

  return info;
}
