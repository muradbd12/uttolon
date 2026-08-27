"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { Loader2, AlertCircle, Trash2 } from "lucide-react";

type StudentOption = { className: string | null };
type HomeworkItem = { id: string; title: string; subject: string; className: string; dueDate: string };

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

export default function TeacherHomeworkForm() {
  const [classNames, setClassNames] = useState<string[]>([]);
  const [items, setItems] = useState<HomeworkItem[] | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      const db = getFirebaseDb();
      const q = query(collection(db, "homework"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as HomeworkItem)));
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    async function loadClassNames() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "users"), where("role", "==", "student"));
        const snapshot = await getDocs(q);
        const names = Array.from(
          new Set(
            snapshot.docs
              .map((d) => (d.data() as StudentOption).className)
              .filter((c): c is string => !!c)
          )
        );
        setClassNames(names);
      } catch {
        setClassNames([]);
      }
    }
    loadClassNames();
    queueMicrotask(loadItems);
  }, [loadItems]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const form = new FormData(e.currentTarget);
    const title = (form.get("title") as string)?.trim();
    const subject = (form.get("subject") as string)?.trim();
    const className = (form.get("className") as string)?.trim();
    const dueDate = form.get("dueDate") as string;
    if (!title || !subject || !className || !dueDate) {
      setStatus("error");
      return;
    }
    try {
      const authInstance = getFirebaseAuth();
      await addDoc(collection(getFirebaseDb(), "homework"), {
        title,
        subject,
        className,
        dueDate,
        assignedBy: authInstance.currentUser?.uid || null,
        createdAt: serverTimestamp(),
      });
      (e.target as HTMLFormElement).reset();
      setStatus("idle");
      loadItems();
    } catch {
      setStatus("error");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteDoc(doc(getFirebaseDb(), "homework", id));
      setItems((prev) => (prev ? prev.filter((h) => h.id !== id) : prev));
    } catch {
      setStatus("error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-line bg-paper p-6">
        {status === "error" && (
          <div className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
            <AlertCircle size={14} /> সব ফিল্ড পূরণ করুন, তারপর আবার চেষ্টা করুন।
          </div>
        )}

        <input required name="title" type="text" placeholder="হোমওয়ার্কের শিরোনাম" className={inputClass} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input required name="subject" type="text" placeholder="বিষয়" className={inputClass} />
          <input
            required
            name="className"
            type="text"
            list="class-options"
            placeholder="ক্লাস (যেমন: Class 10)"
            className={inputClass}
          />
          <datalist id="class-options">
            {classNames.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <input required name="dueDate" type="date" className={inputClass} />
        </div>

        <button
          type="submit"
          disabled={status === "saving"}
          className="flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
        >
          {status === "saving" && <Loader2 size={14} className="animate-spin" />}
          হোমওয়ার্ক দিন
        </button>
      </form>

      {items === null ? (
        <div className="flex items-center justify-center gap-2 py-10 text-ink-soft">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">লোড হচ্ছে...</span>
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-sm border border-dashed border-line p-8 text-center text-sm text-ink-soft/60">
          এখনো কোনো হোমওয়ার্ক দেওয়া হয়নি।
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((h) => (
            <li key={h.id} className="flex items-center justify-between gap-4 rounded-sm border border-line p-4">
              <div>
                <p className="font-label text-[11px] uppercase tracking-wide text-ink-soft/60">
                  {h.className} — {h.subject}
                </p>
                <p className="mt-1 text-[15px] text-ink">{h.title}</p>
                <p className="mt-1 text-xs text-ink-soft/60">জমার সময়সীমা: {h.dueDate}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(h.id)}
                disabled={deletingId === h.id}
                className="flex shrink-0 items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-clay hover:text-clay disabled:opacity-50"
              >
                {deletingId === h.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                মুছুন
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
