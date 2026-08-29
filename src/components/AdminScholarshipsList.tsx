"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { AlertTriangle, Inbox, Loader2, Check, X } from "lucide-react";

type Application = {
  id: string;
  studentName?: string;
  className?: string;
  mobile?: string;
  guardianMobile?: string;
  academicPerformance?: string;
  familyCircumstances?: string;
  reason?: string;
  status?: "pending" | "approved" | "rejected";
  submittedAt?: Timestamp;
};

const statusLabel: Record<string, string> = {
  pending: "পর্যালোচনার অপেক্ষায়",
  approved: "অনুমোদিত",
  rejected: "প্রত্যাখ্যাত",
};

const statusClass: Record<string, string> = {
  pending: "bg-gold-soft text-gold-deep",
  approved: "bg-teal-soft text-teal-deep",
  rejected: "bg-clay-soft text-clay",
};

export default function AdminScholarshipsList() {
  const [apps, setApps] = useState<Application[] | null>(null);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const db = getFirebaseDb();
      const q = query(collection(db, "scholarshipApplications"), orderBy("submittedAt", "desc"));
      const snapshot = await getDocs(q);
      setApps(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Application)));
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  async function setStatus(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    try {
      await updateDoc(doc(getFirebaseDb(), "scholarshipApplications", id), { status });
      setApps((prev) => (prev ? prev.map((a) => (a.id === id ? { ...a, status } : a)) : prev));
    } catch {
      setError(true);
    } finally {
      setBusyId(null);
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-line p-12 text-center">
        <AlertTriangle size={20} className="text-clay" />
        <p className="text-sm text-ink-soft">তালিকা আনা যায়নি — একটু পরে আবার চেষ্টা করুন।</p>
      </div>
    );
  }

  if (apps === null) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-ink-soft">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">লোড হচ্ছে...</span>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-line p-12 text-center">
        <Inbox size={20} className="text-ink-soft/40" />
        <p className="text-sm text-ink-soft/60">এখনো কোনো বৃত্তি আবেদন জমা পড়েনি।</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {apps.map((a) => (
        <li key={a.id} className="rounded-sm border border-line p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[15px] text-ink">
                {a.studentName} {a.className ? `— ${a.className}` : ""}
              </p>
              <p className="mt-1 text-xs text-ink-soft/60">
                {a.mobile} · গার্ডিয়ান: {a.guardianMobile}
              </p>
            </div>
            <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${statusClass[a.status || "pending"]}`}>
              {statusLabel[a.status || "pending"]}
            </span>
          </div>

          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-xs text-ink-soft/60">একাডেমিক ফলাফল</dt>
              <dd className="text-ink">{a.academicPerformance}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft/60">পারিবারিক অবস্থা</dt>
              <dd className="text-ink">{a.familyCircumstances}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft/60">আবেদনের কারণ</dt>
              <dd className="text-ink">{a.reason}</dd>
            </div>
          </dl>

          {(!a.status || a.status === "pending") && (
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setStatus(a.id, "approved")}
                disabled={busyId === a.id}
                className="flex items-center gap-1.5 rounded-sm bg-teal-deep px-3 py-1.5 text-xs font-medium text-paper hover:opacity-90 disabled:opacity-50"
              >
                <Check size={13} /> অনুমোদন করুন
              </button>
              <button
                type="button"
                onClick={() => setStatus(a.id, "rejected")}
                disabled={busyId === a.id}
                className="flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-clay hover:text-clay disabled:opacity-50"
              >
                <X size={13} /> প্রত্যাখ্যান করুন
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
