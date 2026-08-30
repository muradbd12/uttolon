"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
  type Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { AlertTriangle, Inbox, Loader2, Trash2 } from "lucide-react";
import AdminNoticeForm from "./AdminNoticeForm";

type Notice = {
  id: string;
  title: string;
  category: string;
  publishedAt?: Timestamp;
};

function formatDate(ts?: Timestamp) {
  if (!ts) return "";
  return ts.toDate().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

export default function AdminNoticesList() {
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [error, setError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const db = getFirebaseDb();
      const q = query(collection(db, "notices"), orderBy("publishedAt", "desc"));
      const snapshot = await getDocs(q);
      setNotices(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Notice)));
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  async function handleDelete(id: string) {
    if (!window.confirm("এই নোটিশটা মুছে ফেলতে চান? এটা আর ফিরিয়ে আনা যাবে না।")) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(getFirebaseDb(), "notices", id));
      setNotices((prev) => (prev ? prev.filter((n) => n.id !== id) : prev));
    } catch {
      setError(true);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminNoticeForm onPublished={load} />

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-line p-10 text-center">
          <AlertTriangle size={20} className="text-clay" />
          <p className="text-sm text-ink-soft">
            নোটিশ লোড/মুছতে সমস্যা হয়েছে — Firestore rules ঠিক আছে কিনা যাচাই করুন।
          </p>
        </div>
      )}

      {!error && notices === null && (
        <div className="flex items-center justify-center gap-2 py-14 text-ink-soft">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">লোড হচ্ছে...</span>
        </div>
      )}

      {!error && notices !== null && notices.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-line p-10 text-center">
          <Inbox size={20} className="text-ink-soft/40" />
          <p className="text-sm text-ink-soft/60">এখনো কোনো নোটিশ প্রকাশিত হয়নি।</p>
        </div>
      )}

      {!error && notices !== null && notices.length > 0 && (
        <ul className="space-y-3">
          {notices.map((n) => (
            <li
              key={n.id}
              className="flex items-center justify-between gap-4 rounded-sm border border-line p-4"
            >
              <div>
                <p className="text-[15px] text-ink">{n.title}</p>
                <p className="mt-1 text-xs text-ink-soft/60">
                  {n.category} · {formatDate(n.publishedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(n.id)}
                disabled={deletingId === n.id}
                className="flex shrink-0 items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-clay hover:text-clay disabled:opacity-50"
              >
                {deletingId === n.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                মুছুন
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
