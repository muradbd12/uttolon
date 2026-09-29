"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Trash2, Loader2, AlertCircle, ImageOff, Plus } from "lucide-react";

type Photo = { id: string; imageUrl: string; caption?: string };

export default function AdminGalleryManager() {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    try {
      const snap = await getDocs(collection(getFirebaseDb(), "gallery"));
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Photo, "id">) })));
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(getFirebaseDb(), "gallery"), {
        imageUrl: imageUrl.trim(),
        caption: caption.trim() || null,
        createdAt: serverTimestamp(),
      });
      setImageUrl("");
      setCaption("");
      await load();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteDoc(doc(getFirebaseDb(), "gallery", id));
      setPhotos((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
    } catch {
      setError(true);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="rounded-sm border border-line bg-paper p-5">
        <h2 className="font-display-bn text-lg text-ink">নতুন ছবি যোগ করুন</h2>
        <p className="mt-1 text-xs text-ink-soft/60">
          ছবি Google Drive/Imgur-এর মতো কোথাও আপলোড করে তার সরাসরি লিংক (URL) এখানে বসান।
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            required
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="ছবির লিংক (https://...)"
            className="rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="ক্যাপশন (ঐচ্ছিক)"
            className="rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          যোগ করুন
        </button>
        {error && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-clay">
            <AlertCircle size={14} /> একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।
          </p>
        )}
      </form>

      <div className="mt-8">
        {photos === null ? (
          <p className="text-sm text-ink-soft">লোড হচ্ছে...</p>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-ink-soft/60">
            <ImageOff size={26} strokeWidth={1.3} />
            <p className="text-sm">এখনো কোনো ছবি যোগ করা হয়নি।</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-sm border border-line bg-paper">
                <div className="aspect-square bg-paper-raised">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl} alt={p.caption || ""} className="h-full w-full object-cover" />
                </div>
                <div className="flex items-center justify-between gap-2 p-2.5">
                  <p className="line-clamp-1 text-xs text-ink-soft">{p.caption || "—"}</p>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="shrink-0 text-clay hover:text-clay/70 disabled:opacity-50"
                    aria-label="মুছে ফেলুন"
                  >
                    {deletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
