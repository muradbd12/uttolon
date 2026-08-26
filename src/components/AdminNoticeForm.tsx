"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Loader2, AlertCircle } from "lucide-react";

const categories = [
  "Academic",
  "Examination",
  "Admission",
  "Result",
  "Holiday",
  "Scholarship",
  "Important Announcement",
];

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

export default function AdminNoticeForm({ onPublished }: { onPublished: () => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const title = (form.get("title") as string)?.trim();
    const category = form.get("category") as string;
    if (!title || !category) {
      setStatus("error");
      return;
    }
    try {
      await addDoc(collection(getFirebaseDb(), "notices"), {
        title,
        category,
        publishedAt: serverTimestamp(),
      });
      (e.target as HTMLFormElement).reset();
      setStatus("idle");
      onPublished();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-sm border border-line bg-paper p-6">
      <h2 className="font-display-bn text-lg text-ink">নতুন নোটিশ প্রকাশ করুন</h2>
      {status === "error" && (
        <div className="mt-3 flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
          <AlertCircle size={14} /> শিরোনাম ও ক্যাটাগরি দুটোই দিন, তারপর আবার চেষ্টা করুন।
        </div>
      )}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_200px]">
        <input required name="title" type="text" placeholder="নোটিশের শিরোনাম" className={inputClass} />
        <select required name="category" defaultValue="" className={inputClass}>
          <option value="" disabled>
            ক্যাটাগরি
          </option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-4 flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
      >
        {status === "loading" && <Loader2 size={14} className="animate-spin" />}
        প্রকাশ করুন
      </button>
    </form>
  );
}
