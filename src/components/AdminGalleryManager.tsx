"use client";

import { useEffect, useRef, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { Trash2, Loader2, AlertCircle, ImageOff, UploadCloud, CheckCircle2 } from "lucide-react";

type Photo = { id: string; imageUrl: string; caption?: string };
type UploadItem = { name: string; status: "uploading" | "done" | "error" };

const MAX_FILES = 10;

export default function AdminGalleryManager() {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const snap = await getDocs(collection(getFirebaseDb(), "gallery"));
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Photo, "id">) })));
    } catch {
      setError("তালিকা আনা যায়নি।");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const files = Array.from(fileList).slice(0, MAX_FILES);
    if (fileList.length > MAX_FILES) {
      setError(`একসাথে সর্বোচ্চ ${MAX_FILES}টা ছবি আপলোড করা যাবে — প্রথম ${MAX_FILES}টা নেওয়া হয়েছে।`);
    }

    setUploads(files.map((f) => ({ name: f.name, status: "uploading" as const })));
    const db = getFirebaseDb();

    await Promise.all(
      files.map(async (file, index) => {
        try {
          const url = await uploadImageToCloudinary(file);
          await addDoc(collection(db, "gallery"), {
            imageUrl: url,
            caption: null,
            createdAt: serverTimestamp(),
          });
          setUploads((prev) => prev.map((u, i) => (i === index ? { ...u, status: "done" } : u)));
        } catch {
          setUploads((prev) => prev.map((u, i) => (i === index ? { ...u, status: "error" } : u)));
        }
      })
    );

    await load();
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(photo: Photo) {
    setDeletingId(photo.id);
    try {
      await deleteDoc(doc(getFirebaseDb(), "gallery", photo.id));
      setPhotos((prev) => (prev ? prev.filter((p) => p.id !== photo.id) : prev));
    } catch {
      setError("মুছে ফেলা যায়নি।");
    } finally {
      setDeletingId(null);
    }
  }

  const isUploading = uploads.some((u) => u.status === "uploading");

  return (
    <div>
      <div className="rounded-sm border-2 border-dashed border-line bg-paper p-6 text-center">
        <UploadCloud size={26} className="mx-auto text-gold-deep" strokeWidth={1.4} />
        <p className="mt-2 text-sm text-ink">একসাথে সর্বোচ্চ {MAX_FILES}টা ছবি বেছে নিয়ে আপলোড করুন</p>
        <p className="mt-1 text-xs text-ink-soft/60">JPG/PNG — সরাসরি আপলোড হবে, কোনো লিংক বসাতে হবে না</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={isUploading}
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="mt-4 text-sm text-ink-soft file:mr-3 file:rounded-sm file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-medium file:text-paper hover:file:bg-gold-deep"
        />

        {uploads.length > 0 && (
          <div className="mt-5 space-y-1.5 text-left">
            {uploads.map((u, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-ink-soft">
                {u.status === "uploading" && <Loader2 size={14} className="animate-spin" />}
                {u.status === "done" && <CheckCircle2 size={14} className="text-teal-deep" />}
                {u.status === "error" && <AlertCircle size={14} className="text-clay" />}
                <span className="truncate">{u.name}</span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-clay">
            <AlertCircle size={14} /> {error}
          </p>
        )}
      </div>

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
                <div className="flex items-center justify-end p-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(p)}
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
