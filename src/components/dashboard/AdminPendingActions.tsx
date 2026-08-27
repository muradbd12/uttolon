"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Inbox } from "lucide-react";

export default function AdminPendingActions() {
  const [pendingAdmissions, setPendingAdmissions] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "admissions"), where("status", "==", "new"));
        const snapshot = await getDocs(q);
        setPendingAdmissions(snapshot.size);
      } catch {
        setPendingAdmissions(0);
      }
    }
    load();
  }, []);

  const items = [
    { label: "পর্যালোচনার অপেক্ষায় থাকা ভর্তি আবেদন", count: pendingAdmissions === null ? "…" : pendingAdmissions },
    { label: "পর্যালোচনার অপেক্ষায় থাকা বৃত্তি আবেদন", count: 0 },
    { label: "অনুমোদনের অপেক্ষায় থাকা Testimonial", count: 0 },
  ];

  return (
    <div className="space-y-4">
      {items.map((p) => (
        <div key={p.label} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Inbox size={15} className="shrink-0 text-ink-soft/50" />
            <p className="text-sm text-ink-soft">{p.label}</p>
          </div>
          <span className="rounded-sm bg-line px-2 py-0.5 text-xs font-medium text-ink-soft">
            {p.count}
          </span>
        </div>
      ))}
    </div>
  );
}
