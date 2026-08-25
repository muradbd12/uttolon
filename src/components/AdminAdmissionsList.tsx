"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, type Timestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

type Application = {
  id: string;
  studentName?: string;
  mobile?: string;
  className?: string;
  program?: string;
  status?: string;
  submittedAt?: Timestamp;
};

export default function AdminAdmissionsList() {
  const [apps, setApps] = useState<Application[] | null>(null);
  const [error, setError] = useState(false);

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
    <div className="overflow-x-auto rounded-sm border border-line">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line bg-paper-raised text-left text-ink-soft">
            <th className="px-4 py-3 font-normal">শিক্ষার্থী</th>
            <th className="px-4 py-3 font-normal">মোবাইল</th>
            <th className="px-4 py-3 font-normal">ক্লাস</th>
            <th className="px-4 py-3 font-normal">প্রোগ্রাম</th>
            <th className="px-4 py-3 font-normal">স্ট্যাটাস</th>
          </tr>
        </thead>
        <tbody>
          {apps.map((a) => (
            <tr key={a.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3 text-ink">{a.studentName || "—"}</td>
              <td className="px-4 py-3 text-ink-soft">{a.mobile || "—"}</td>
              <td className="px-4 py-3 text-ink-soft">{a.className || "—"}</td>
              <td className="px-4 py-3 text-ink-soft">{a.program || "—"}</td>
              <td className="px-4 py-3">
                <span className="rounded-sm bg-teal-soft px-2 py-0.5 text-xs font-medium text-teal-deep">
                  {a.status || "new"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
