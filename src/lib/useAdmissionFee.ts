"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type AdmissionFeeEntry = {
  id: string;
  program?: string;
  className?: string;
  totalFee: number;
  totalPaid: number;
  due: number;
  mobile?: string;
  shortId?: string;
};

// একজন শিক্ষার্থীর ভর্তি ফি রেকর্ড (একবারই হয়, মাসভিত্তিক না) —
// useFees()-এর মতোই প্যাটার্ন, Student নিজের জন্য, Guardian তাদের
// যুক্ত শিক্ষার্থীর জন্য ব্যবহার করে।
export function useAdmissionFee(studentUid: string | null | undefined) {
  const [entry, setEntry] = useState<AdmissionFeeEntry | null | undefined>(undefined);

  useEffect(() => {
    if (!studentUid) return;
    let cancelled = false;
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "admissions"), where("studentUid", "==", studentUid));
        const snapshot = await getDocs(q);
        if (!cancelled) {
          if (snapshot.empty) {
            setEntry(null);
            return;
          }
          const d = snapshot.docs[0];
          const data = d.data();
          setEntry({
            id: d.id,
            program: data.program,
            className: data.className,
            totalFee: data.totalFee ?? 0,
            totalPaid: data.totalPaid ?? 0,
            due: data.due ?? 0,
            mobile: data.mobile,
            shortId: data.shortId,
          });
        }
      } catch {
        if (!cancelled) setEntry(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [studentUid]);

  return entry;
}
