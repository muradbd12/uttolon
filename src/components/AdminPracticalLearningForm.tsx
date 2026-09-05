"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { Loader2, AlertCircle, Trash2, Info, ImagePlus } from "lucide-react";

type Entry = {
  id: string;
  title: string;
  category: string;
  description: string;
  photoUrl: string;
  published: boolean;
};

const categories = ["Physics Experiment", "Chemistry Experiment", "Biology Observation", "Geometry Model"];

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export default function AdminPracticalLearningForm() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const db = getFirebaseDb();
      const q = query(collection(db, "practicalLearning"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setEntries(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Entry)));
    } catch {
      setEntries([]);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("শুধু ছবি ফাইল (jpg/png) দেওয়া যাবে।");
      setStatus("error");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setErrorMsg("ছবির সাইজ ৫ MB-এর বেশি হতে পারবে না।");
      setStatus("error");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setStatus("idle");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");
    const form = new FormData(e.currentTarget);
    const title = (form.get("title") as string)?.trim();
    const description = (form.get("description") as string)?.trim();
    const category = form.get("category") as string;
    if (!title || !description || !category) {
      setStatus("error");
      setErrorMsg("শিরোনাম, ক্যাটাগরি ও বিবরণ — সবগুলো দিন।");
      return;
    }
    try {
      let photoUrl = "";
      if (photoFile) {
        photoUrl = await uploadImageToCloudinary(photoFile);
      }
      await addDoc(collection(getFirebaseDb(), "practicalLearning"), {
        title,
        category,
        description,
        photoUrl,
        published: false,
        createdAt: serverTimestamp(),
      });
      (e.target as HTMLFormElement).reset();
      setPhotoFile(null);
      setPhotoPreview(null);
      setStatus("idle");
      load();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "সংরক্ষণ করা যায়নি — আবার চেষ্টা করুন।");
    }
  }

  async function togglePublished(entry: Entry) {
    setBusyId(entry.id);
    try {
      await updateDoc(doc(getFirebaseDb(), "practicalLearning", entry.id), { published: !entry.published });
      setEntries((prev) =>
        prev ? prev.map((x) => (x.id === entry.id ? { ...x, published: !x.published } : x)) : prev
      );
    } catch {
      setStatus("error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("এই এন্ট্রিটা মুছে ফেলতে চান? এটা আর ফিরিয়ে আনা যাবে না।")) return;
    setBusyId(id);
    try {
      await deleteDoc(doc(getFirebaseDb(), "practicalLearning", id));
      setEntries((prev) => (prev ? prev.filter((x) => x.id !== id) : prev));
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
          নতুন এন্ট্রি প্রথমে Draft থাকে — &quot;Publish&quot; না চাপা পর্যন্ত পাবলিক
          পেজে দেখা যাবে না।
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-line bg-paper p-6">
        {status === "error" && errorMsg && (
          <div className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
            <AlertCircle size={14} /> {errorMsg}
          </div>
        )}

        <input required name="title" type="text" placeholder="শিরোনাম (যেমন: প্রিজম দিয়ে আলোর বিচ্ছুরণ)" className={inputClass} />

        <select required name="category" className={inputClass} defaultValue="">
          <option value="" disabled>
            ক্যাটাগরি নির্বাচন করুন
          </option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <textarea
          required
          name="description"
          rows={4}
          placeholder="কী করা হয়েছে, শিক্ষার্থীরা কী শিখেছে তার সংক্ষিপ্ত বিবরণ"
          className={inputClass}
        />

        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-paper-raised text-ink-soft/40">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="প্রিভিউ" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus size={22} />
            )}
          </span>
          <label className="block">
            <span className="text-sm font-medium text-ink">ছবি (ঐচ্ছিক, সর্বোচ্চ ৫ MB)</span>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="mt-1.5 block text-sm text-ink-soft" />
          </label>
        </div>

        <button
          type="submit"
          disabled={status === "saving"}
          className="flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
        >
          {status === "saving" && <Loader2 size={14} className="animate-spin" />}
          Draft হিসেবে সংরক্ষণ করুন
        </button>
      </form>

      {entries === null ? (
        <div className="flex items-center justify-center gap-2 py-10 text-ink-soft">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">লোড হচ্ছে...</span>
        </div>
      ) : entries.length === 0 ? (
        <p className="rounded-sm border border-dashed border-line p-8 text-center text-sm text-ink-soft/60">
          এখনো কোনো এন্ট্রি যোগ করা হয়নি।
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start justify-between gap-4 rounded-sm border border-line p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-paper-raised text-ink-soft/40">
                  {entry.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.photoUrl} alt={entry.title} className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus size={18} />
                  )}
                </span>
                <div>
                  <p className="font-label text-[11px] uppercase tracking-wide text-ink-soft/60">
                    {entry.category}
                  </p>
                  <p className="mt-0.5 text-[15px] text-ink">{entry.title}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-sm px-2 py-0.5 text-xs font-medium ${
                    entry.published ? "bg-teal-soft text-teal-deep" : "bg-line text-ink-soft"
                  }`}
                >
                  {entry.published ? "Published" : "Draft"}
                </span>
                <button
                  type="button"
                  onClick={() => togglePublished(entry)}
                  disabled={busyId === entry.id}
                  className="rounded-sm border border-line px-2.5 py-1 text-xs text-ink hover:border-ink disabled:opacity-50"
                >
                  {entry.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(entry.id)}
                  disabled={busyId === entry.id}
                  className="flex items-center gap-1 rounded-sm border border-line px-2.5 py-1 text-xs text-ink-soft hover:border-clay hover:text-clay disabled:opacity-50"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
