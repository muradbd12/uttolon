"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, orderBy, query, doc, updateDoc, type Timestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { AlertTriangle, Inbox, Loader2, ChevronDown, ChevronUp, Check, X, UserPlus } from "lucide-react";

type Application = {
  id: string;
  studentName?: string;
  dob?: string;
  fatherName?: string;
  motherName?: string;
  mobile?: string;
  guardianMobile?: string;
  address?: string;
  school?: string;
  className?: string;
  group?: string;
  previousResult?: string;
  weakSubjects?: string;
  program?: string;
  preferredBatchTime?: string;
  status?: "new" | "confirmed" | "rejected";
  submittedAt?: Timestamp;
};

const statusLabel: Record<string, string> = {
  new: "পর্যালোচনার অপেক্ষায়",
  confirmed: "ভর্তি নিশ্চিত",
  rejected: "প্রত্যাখ্যাত",
};

const statusClass: Record<string, string> = {
  new: "bg-gold-soft text-gold-deep",
  confirmed: "bg-teal-soft text-teal-deep",
  rejected: "bg-clay-soft text-clay",
};

function formatDate(ts?: Timestamp) {
  if (!ts) return "";
  return ts.toDate().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

export default function AdminAdmissionsList() {
  const router = useRouter();
  const [apps, setApps] = useState<Application[] | null>(null);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "admissions"), orderBy("submittedAt", "desc"));
        const snapshot = await getDocs(q);
        setApps(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Application)));
      } catch {
        setError(true);
      }
    }
    load();
  }, []);

  async function setStatus(id: string, status: "confirmed" | "rejected") {
    setBusyId(id);
    try {
      await updateDoc(doc(getFirebaseDb(), "admissions", id), { status });
      setApps((prev) => (prev ? prev.map((a) => (a.id === id ? { ...a, status } : a)) : prev));
    } catch {
      setError(true);
    } finally {
      setBusyId(null);
    }
  }

  function createAccountFrom(a: Application) {
    const params = new URLSearchParams({
      prefillName: a.studentName || "",
      prefillClass: a.className || "",
      prefillGuardianMobile: a.guardianMobile || "",
      prefillIdentifier: a.mobile || "",
    });
    router.push(`/admin/users?${params.toString()}`);
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-line p-12 text-center">
        <AlertTriangle size={20} className="text-clay" />
        <p className="text-sm text-ink-soft">
          আবেদনের তালিকা আনা যায়নি — Firestore Database চালু আছে কিনা এবং
          security rules-এ অ্যাডমিনের read অনুমতি দেওয়া আছে কিনা যাচাই করুন।
        </p>
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
        <p className="text-sm text-ink-soft/60">এখনো কোনো আবেদন জমা পড়েনি।</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {apps.map((a) => {
        const isOpen = expandedId === a.id;
        return (
          <li key={a.id} className="rounded-sm border border-line">
            <button
              type="button"
              onClick={() => setExpandedId(isOpen ? null : a.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
            >
              <div>
                <p className="text-[15px] text-ink">{a.studentName || "—"}</p>
                <p className="mt-0.5 text-xs text-ink-soft/60">
                  {a.mobile} · {a.className} · {formatDate(a.submittedAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${statusClass[a.status || "new"]}`}>
                  {statusLabel[a.status || "new"]}
                </span>
                {isOpen ? <ChevronUp size={16} className="text-ink-soft" /> : <ChevronDown size={16} className="text-ink-soft" />}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-line px-4 py-4">
                <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-ink-soft/60">জন্ম তারিখ</dt>
                    <dd className="text-ink">{a.dob || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-soft/60">বাবার নাম</dt>
                    <dd className="text-ink">{a.fatherName || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-soft/60">মায়ের নাম</dt>
                    <dd className="text-ink">{a.motherName || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-soft/60">গার্ডিয়ানের নম্বর</dt>
                    <dd className="text-ink">{a.guardianMobile || "—"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-ink-soft/60">ঠিকানা</dt>
                    <dd className="text-ink">{a.address || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-soft/60">স্কুল/মাদ্রাসা</dt>
                    <dd className="text-ink">{a.school || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-soft/60">গ্রুপ</dt>
                    <dd className="text-ink">{a.group || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-soft/60">পূর্ববর্তী ফলাফল</dt>
                    <dd className="text-ink">{a.previousResult || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-soft/60">দুর্বল বিষয়</dt>
                    <dd className="text-ink">{a.weakSubjects || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-soft/60">প্রোগ্রাম</dt>
                    <dd className="text-ink">{a.program || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-soft/60">পছন্দের ব্যাচ সময়</dt>
                    <dd className="text-ink">{a.preferredBatchTime || "—"}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                  {(!a.status || a.status === "new") && (
                    <>
                      <button
                        type="button"
                        onClick={() => setStatus(a.id, "confirmed")}
                        disabled={busyId === a.id}
                        className="flex items-center gap-1.5 rounded-sm bg-teal-deep px-3 py-1.5 text-xs font-medium text-paper hover:opacity-90 disabled:opacity-50"
                      >
                        <Check size={13} /> ভর্তি নিশ্চিত করুন
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(a.id, "rejected")}
                        disabled={busyId === a.id}
                        className="flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-clay hover:text-clay disabled:opacity-50"
                      >
                        <X size={13} /> প্রত্যাখ্যান করুন
                      </button>
                    </>
                  )}
                  {a.status === "confirmed" && (
                    <button
                      type="button"
                      onClick={() => createAccountFrom(a)}
                      className="flex items-center gap-1.5 rounded-sm bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-gold-deep"
                    >
                      <UserPlus size={13} /> লগইন অ্যাকাউন্ট তৈরি করুন
                    </button>
                  )}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
