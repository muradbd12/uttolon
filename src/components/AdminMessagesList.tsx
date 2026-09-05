"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
  deleteDoc,
  type Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { AlertTriangle, Inbox, Loader2, Trash2, MailOpen, Mail } from "lucide-react";

type Message = {
  id: string;
  name?: string;
  phone?: string;
  subject?: string;
  message?: string;
  status?: "new" | "read";
  submittedAt?: Timestamp;
};

function formatDate(ts?: Timestamp) {
  if (!ts) return "";
  return ts.toDate().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

export default function AdminMessagesList() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "contactMessages"), orderBy("submittedAt", "desc"));
        const snapshot = await getDocs(q);
        setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
      } catch {
        setError(true);
      }
    }
    load();
  }, []);

  async function toggleRead(m: Message) {
    setBusyId(m.id);
    const newStatus = m.status === "read" ? "new" : "read";
    try {
      await updateDoc(doc(getFirebaseDb(), "contactMessages", m.id), { status: newStatus });
      setMessages((prev) => (prev ? prev.map((x) => (x.id === m.id ? { ...x, status: newStatus } : x)) : prev));
    } catch {
      setError(true);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("এই বার্তাটা মুছে ফেলতে চান? এটা আর ফিরিয়ে আনা যাবে না।")) return;
    setBusyId(id);
    try {
      await deleteDoc(doc(getFirebaseDb(), "contactMessages", id));
      setMessages((prev) => (prev ? prev.filter((m) => m.id !== id) : prev));
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
        <p className="text-sm text-ink-soft">বার্তার তালিকা আনা যায়নি — একটু পরে আবার চেষ্টা করুন।</p>
      </div>
    );
  }

  if (messages === null) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-ink-soft">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">লোড হচ্ছে...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-line p-12 text-center">
        <Inbox size={20} className="text-ink-soft/40" />
        <p className="text-sm text-ink-soft/60">এখনো কোনো বার্তা আসেনি।</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {messages.map((m) => (
        <li
          key={m.id}
          className={`rounded-sm border p-4 ${m.status === "read" ? "border-line" : "border-gold/40 bg-gold-soft/20"}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[15px] text-ink">
                {m.subject || "—"}
                {m.status !== "read" && (
                  <span className="ml-2 rounded-sm bg-gold-deep px-1.5 py-0.5 text-[10px] font-medium text-paper">
                    নতুন
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-ink-soft/60">
                {m.name} · {m.phone} · {formatDate(m.submittedAt)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-ink-soft">{m.message}</p>
          <div className="mt-3 flex gap-2 border-t border-line pt-3">
            <button
              type="button"
              onClick={() => toggleRead(m)}
              disabled={busyId === m.id}
              className="flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink disabled:opacity-50"
            >
              {m.status === "read" ? <Mail size={13} /> : <MailOpen size={13} />}
              {m.status === "read" ? "অপঠিত হিসেবে চিহ্নিত করুন" : "পঠিত হিসেবে চিহ্নিত করুন"}
            </button>
            <button
              type="button"
              onClick={() => handleDelete(m.id)}
              disabled={busyId === m.id}
              className="flex items-center gap-1.5 rounded-sm border border-clay/40 px-3 py-1.5 text-xs text-clay hover:bg-clay-soft disabled:opacity-50"
            >
              <Trash2 size={13} /> মুছুন
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
