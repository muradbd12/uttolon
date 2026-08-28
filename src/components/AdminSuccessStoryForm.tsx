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
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Loader2, AlertCircle, Trash2, Info } from "lucide-react";

type Story = {
  id: string;
  displayName: string;
  program: string;
  beforeScore: string;
  afterScore: string;
  testimonial: string;
  published: boolean;
};

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

export default function AdminSuccessStoryForm() {
  const [stories, setStories] = useState<Story[] | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const db = getFirebaseDb();
      const q = query(collection(db, "successStories"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setStories(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Story)));
    } catch {
      setStories([]);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const form = new FormData(e.currentTarget);
    const displayName = (form.get("displayName") as string)?.trim();
    const testimonial = (form.get("testimonial") as string)?.trim();
    if (!displayName || !testimonial) {
      setStatus("error");
      return;
    }
    try {
      await addDoc(collection(getFirebaseDb(), "successStories"), {
        displayName,
        program: (form.get("program") as string)?.trim() || "",
        beforeScore: (form.get("beforeScore") as string)?.trim() || "",
        afterScore: (form.get("afterScore") as string)?.trim() || "",
        testimonial,
        published: false,
        createdAt: serverTimestamp(),
      });
      (e.target as HTMLFormElement).reset();
      setStatus("idle");
      load();
    } catch {
      setStatus("error");
    }
  }

  async function togglePublished(story: Story) {
    setBusyId(story.id);
    try {
      await updateDoc(doc(getFirebaseDb(), "successStories", story.id), {
        published: !story.published,
      });
      setStories((prev) =>
        prev ? prev.map((s) => (s.id === story.id ? { ...s, published: !s.published } : s)) : prev
      );
    } catch {
      setStatus("error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      await deleteDoc(doc(getFirebaseDb(), "successStories", id));
      setStories((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
    } catch {
      setStatus("error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 rounded-sm border border-gold/30 bg-gold-soft/40 p-3 text-sm text-ink">
        <Info size={15} className="mt-0.5 shrink-0 text-gold-deep" />
        <p>
          গোপনীয়তার জন্য শিক্ষার্থীর পুরো নাম না দিয়ে ছদ্মনাম বা শুধু প্রথম নাম/আদ্যক্ষর
          ব্যবহার করার পরামর্শ থাকলো। নতুন গল্প যোগ করার পর তা draft অবস্থায় থাকে —
          &quot;Publish&quot; না চাপা পর্যন্ত ওয়েবসাইটে দেখা যাবে না।
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-line bg-paper p-6">
        {status === "error" && (
          <div className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
            <AlertCircle size={14} /> নাম ও testimonial দুটোই দিন, তারপর আবার চেষ্টা করুন।
          </div>
        )}

        <input required name="displayName" type="text" placeholder="প্রদর্শিত নাম (যেমন: রাফি, বা R.)" className={inputClass} />
        <input name="program" type="text" placeholder="প্রোগ্রাম/বিষয় (ঐচ্ছিক)" className={inputClass} />

        <div className="grid grid-cols-2 gap-4">
          <input name="beforeScore" type="text" placeholder="আগের ফলাফল (ঐচ্ছিক)" className={inputClass} />
          <input name="afterScore" type="text" placeholder="পরের ফলাফল (ঐচ্ছিক)" className={inputClass} />
        </div>

        <textarea required name="testimonial" rows={3} placeholder="Testimonial / অগ্রগতির বিবরণ" className={inputClass} />

        <button
          type="submit"
          disabled={status === "saving"}
          className="flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
        >
          {status === "saving" && <Loader2 size={14} className="animate-spin" />}
          Draft হিসেবে যোগ করুন
        </button>
      </form>

      {stories === null ? (
        <div className="flex items-center justify-center gap-2 py-10 text-ink-soft">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">লোড হচ্ছে...</span>
        </div>
      ) : stories.length === 0 ? (
        <p className="rounded-sm border border-dashed border-line p-8 text-center text-sm text-ink-soft/60">
          এখনো কোনো গল্প যোগ করা হয়নি।
        </p>
      ) : (
        <ul className="space-y-3">
          {stories.map((s) => (
            <li key={s.id} className="rounded-sm border border-line p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[15px] text-ink">
                    {s.displayName} {s.program ? `— ${s.program}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">{s.testimonial}</p>
                  {(s.beforeScore || s.afterScore) && (
                    <p className="mt-1 text-xs text-ink-soft/60">
                      {s.beforeScore} → {s.afterScore}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-sm px-2 py-0.5 text-xs font-medium ${
                    s.published ? "bg-teal-soft text-teal-deep" : "bg-line text-ink-soft"
                  }`}
                >
                  {s.published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => togglePublished(s)}
                  disabled={busyId === s.id}
                  className="rounded-sm border border-line px-3 py-1.5 text-xs text-ink hover:border-ink disabled:opacity-50"
                >
                  {s.published ? "Unpublish করুন" : "Publish করুন"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  disabled={busyId === s.id}
                  className="flex items-center gap-1 rounded-sm border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-clay hover:text-clay disabled:opacity-50"
                >
                  <Trash2 size={12} /> মুছুন
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
