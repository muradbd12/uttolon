"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { X, ImageOff } from "lucide-react";

type Photo = { id: string; imageUrl: string; caption?: string };

export default function GalleryGrid() {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [error, setError] = useState(false);
  const [active, setActive] = useState<Photo | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(getFirebaseDb(), "gallery"));
        setPhotos(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Photo, "id">) })));
      } catch {
        setError(true);
      }
    }
    load();
  }, []);

  if (error) {
    return <p className="text-sm text-clay">গ্যালারি আনা যায়নি — একটু পরে আবার চেষ্টা করুন।</p>;
  }

  if (!photos) {
    return <p className="text-sm text-ink-soft">লোড হচ্ছে...</p>;
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center text-ink-soft/60">
        <ImageOff size={28} strokeWidth={1.3} />
        <p className="text-sm">এখনো কোনো ছবি যোগ করা হয়নি।</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActive(p)}
            className="group aspect-square overflow-hidden rounded-sm border border-line bg-paper-raised"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.imageUrl}
              alt={p.caption || "উত্তোলন গ্যালারি"}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/85 p-4"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label="বন্ধ করুন"
            className="absolute right-5 top-5 text-paper hover:text-gold"
          >
            <X size={22} />
          </button>
          <div className="max-h-[85vh] max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.imageUrl} alt={active.caption || ""} className="max-h-[85vh] w-full rounded-sm object-contain" />
            {active.caption && <p className="mt-3 text-center text-sm text-paper/80">{active.caption}</p>}
          </div>
        </div>
      )}
    </>
  );
}
