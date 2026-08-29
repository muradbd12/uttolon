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
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Loader2, AlertCircle, Trash2, Info } from "lucide-react";

type Resource = {
  id: string;
  title: string;
  resourceType: string;
  className: string;
  subject: string;
  chapter?: string;
  link: string;
};

const resourceTypes = ["PDF", "Notes", "Worksheet", "Model Test", "Question Bank", "Video", "Revision Sheet"];

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

export default function AdminResourceForm() {
  const [resources, setResources] = useState<Resource[] | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const db = getFirebaseDb();
      const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setResources(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Resource)));
    } catch {
      setResources([]);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const form = new FormData(e.currentTarget);
    const title = (form.get("title") as string)?.trim();
    const link = (form.get("link") as string)?.trim();
    const className = (form.get("className") as string)?.trim();
    const subject = (form.get("subject") as string)?.trim();
    const resourceType = form.get("resourceType") as string;
    if (!title || !link || !className || !subject || !resourceType) {
      setStatus("error");
      return;
    }
    try {
      await addDoc(collection(getFirebaseDb(), "resources"), {
        title,
        resourceType,
        className,
        subject,
        chapter: (form.get("chapter") as string)?.trim() || "",
        link,
        createdAt: serverTimestamp(),
      });
      (e.target as HTMLFormElement).reset();
      setStatus("idle");
      load();
    } catch {
      setStatus("error");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteDoc(doc(getFirebaseDb(), "resources", id));
      setResources((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
    } catch {
      setStatus("error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 rounded-sm border border-gold/30 bg-gold-soft/40 p-3 text-sm text-ink">
        <Info size={15} className="mt-0.5 shrink-0 text-gold-deep" />
        <p>
          ফাইল সরাসরি এখানে আপলোড করার সুযোগ নেই — এর বদলে ফাইলটা Google Drive-এ
          আপলোড করে &quot;Anyone with the link can view&quot; করে সেই লিংকটা এখানে
          বসান। এতে কোনো বাড়তি খরচ বা সেটআপ ছাড়াই কাজ হয়ে যায়।
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-line bg-paper p-6">
        {status === "error" && (
          <div className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
            <AlertCircle size={14} /> শিরোনাম, লিংক, ক্লাস, বিষয় ও ধরন — সবগুলো দিন।
          </div>
        )}

        <input required name="title" type="text" placeholder="রিসোর্সের শিরোনাম" className={inputClass} />
        <input required name="link" type="url" placeholder="লিংক (Google Drive বা অন্য কোনো)" className={inputClass} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input required name="className" type="text" placeholder="ক্লাস" className={inputClass} />
          <input required name="subject" type="text" placeholder="বিষয়" className={inputClass} />
          <input name="chapter" type="text" placeholder="অধ্যায় (ঐচ্ছিক)" className={inputClass} />
        </div>

        <select required name="resourceType" className={inputClass} defaultValue="">
          <option value="" disabled>
            ধরন নির্বাচন করুন
          </option>
          {resourceTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <button
          type="submit"
          disabled={status === "saving"}
          className="flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
        >
          {status === "saving" && <Loader2 size={14} className="animate-spin" />}
          যোগ করুন
        </button>
      </form>

      {resources === null ? (
        <div className="flex items-center justify-center gap-2 py-10 text-ink-soft">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">লোড হচ্ছে...</span>
        </div>
      ) : resources.length === 0 ? (
        <p className="rounded-sm border border-dashed border-line p-8 text-center text-sm text-ink-soft/60">
          এখনো কোনো রিসোর্স যোগ করা হয়নি।
        </p>
      ) : (
        <ul className="space-y-3">
          {resources.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-4 rounded-sm border border-line p-4">
              <div>
                <p className="font-label text-[11px] uppercase tracking-wide text-ink-soft/60">
                  {r.resourceType} · {r.className} · {r.subject}
                </p>
                <p className="mt-1 text-[15px] text-ink">{r.title}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(r.id)}
                disabled={deletingId === r.id}
                className="flex shrink-0 items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-clay hover:text-clay disabled:opacity-50"
              >
                {deletingId === r.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                মুছুন
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
