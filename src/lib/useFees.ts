"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type FeeEntry = {
  month: string;
  amountDue: number;
  discount: number;
  fine: number;
  amountPaid: number;
  paymentMethod?: string;
  transactionNumber?: string;
  status: "paid" | "partial" | "due";
};

// একজন শিক্ষার্থীর ফি রেকর্ড, মাস অনুযায়ী সাজানো (সবচেয়ে নতুনটা আগে) —
// Student নিজের জন্য, Guardian তাদের যুক্ত শিক্ষার্থীর জন্য ব্যবহার করে।
export function useFees(studentUid: string | null | undefined) {
  const [entries, setEntries] = useState<FeeEntry[] | null>(null);

  useEffect(() => {
    if (!studentUid) return;
    let cancelled = false;
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "fees"), where("studentUid", "==", studentUid));
        const snapshot = await getDocs(q);
        if (!cancelled) {
          const list = snapshot.docs
            .map((d) => d.data() as FeeEntry)
            .sort((a, b) => b.month.localeCompare(a.month));
          setEntries(list);
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
