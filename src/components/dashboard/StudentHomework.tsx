"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { CheckCircle2, Loader2, ImagePlus, X, AlertCircle, MessageSquare } from "lucide-react";
import { getFirebaseDb } from "@/lib/firebase";
import { useHomework, type HomeworkItem } from "@/lib/useHomework";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { resizeImageFile } from "@/lib/imageResize";

type Submission = {
  homeworkId: string;
  text?: string;
  imageUrls?: string[];
  late?: boolean;
  checked?: boolean;
  teacherComment?: string;
};

const MAX_IMAGES = 4;

function HomeworkRow({
  h,
  studentUid,
  studentName,
  className,
  existing,
  onSubmitted,
}: {
  h: HomeworkItem;
  studentUid: string;
  studentName: string;
  className: string;
  existing?: Submission;
  onSubmitted: (s: Submission) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const overdue = !!h.dueDate && today > h.dueDate;

  async function addImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const room = MAX_IMAGES - images.length;
      const picked = Array.from(files).slice(0, Math.max(room, 0));
      const urls = await Promise.all(
        picked.map(async (f) => uploadImageToCloudinary(await resizeImageFile(f, 1400, 0.82)))
      );
      setImages((prev) => [...prev, ...urls]);
    } catch {
      setError("ছবি আপলোড হয়নি — আবার চেষ্টা করুন।");
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!text.trim() && images.length === 0) {
      setError("উত্তর লিখুন অথবা অন্তত একটা ছবি দিন।");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload = {
        homeworkId: h.id,
        homeworkTitle: h.title,
        subject: h.subject,
        className,
        studentUid,
        studentName,
        text: text.trim(),
        imageUrls: images,
        late: overdue,
        checked: false,
        teacherComment: "",
        submittedAt: serverTimestamp(),
      };
      await setDoc(doc(getFirebaseDb(), "homeworkSubmissions", `${h.id}_${studentUid}`), payload);
      onSubmitted({ homeworkId: h.id, text: payload.text, imageUrls: images, late: overdue, checked: false });
      setOpen(false);
    } catch {
      setError("জমা হয়নি — ইন্টারনেট দেখে আবার চেষ্টা করুন। (আগে জমা দিয়ে থাকলে আর বদলানো যায় না।)");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-sm border border-line px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-label text-[11px] uppercase tracking-wide text-ink-soft/60">{h.subject}</p>
          <p className="mt-1 text-[15px] text-ink">{h.title}</p>
          <p className={`mt-1 text-xs ${overdue && !existing ? "text-clay" : "text-gold-deep"}`}>
            জমা দেওয়ার সময়সীমা: {h.dueDate}
            {overdue && !existing && " (সময় পেরিয়ে গেছে)"}
          </p>
        </div>
        {existing ? (
          <span className="flex items-center gap-1 rounded-full bg-teal-soft px-2.5 py-1 text-xs font-semibold text-teal-deep">
            <CheckCircle2 size={13} /> জমা দেওয়া হয়েছে{existing.late ? " (দেরিতে)" : ""}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-sm bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-gold-deep"
          >
            {open ? "বন্ধ করুন" : "জমা দিন"}
          </button>
        )}
      </div>

      {existing?.checked && (
        <p className="mt-2 flex items-start gap-1.5 rounded-sm bg-gold-soft/50 px-2.5 py-1.5 text-xs text-ink">
          <MessageSquare size={13} className="mt-0.5 shrink-0 text-gold-deep" />
          <span>
            <strong>শিক্ষক দেখেছেন।</strong> {existing.teacherComment}
          </span>
        </p>
      )}

      {open && !existing && (
        <div className="mt-3 space-y-3 border-t border-line pt-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="তোমার উত্তর/নোট লেখো (ঐচ্ছিক, ছবি দিলেও চলবে)"
            className="w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-ink"
          />
          <div className="flex flex-wrap items-center gap-2">
            {images.map((u) => (
              <div key={u} className="relative h-16 w-16 overflow-hidden rounded-sm border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="হোমওয়ার্কের ছবি" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((x) => x !== u))}
                  className="absolute right-0 top-0 rounded-bl-sm bg-ink/80 p-0.5 text-paper"
                  aria-label="ছবি সরান"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-sm border border-dashed border-ink-soft/40 text-[10px] text-ink-soft hover:border-ink">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                ছবি দিন
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={(e) => {
                    void addImages(e.target.files);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="text-[11px] text-ink-soft/60">
            সর্বোচ্চ {MAX_IMAGES}টা ছবি। একবার জমা দিলে আর বদলানো যাবে না — ভুল হলে শিক্ষক বা অফিসকে জানাও।
          </p>
          {error && (
            <p className="flex items-start gap-1.5 text-xs text-clay">
              <AlertCircle size={13} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={busy || uploading}
            className="flex items-center gap-1.5 rounded-sm bg-teal-deep px-4 py-2 text-sm font-medium text-paper hover:opacity-90 disabled:opacity-50"
          >
            {busy && <Loader2 size={14} className="animate-spin" />} জমা দিন
          </button>
        </div>
      )}
    </div>
  );
}

export default function StudentHomework({
  className,
  studentUid,
  studentName,
}: {
  className: string | null | undefined;
  studentUid: string | null | undefined;
  studentName: string | null | undefined;
}) {
  const homework = useHomework(className);
  const [subs, setSubs] = useState<Record<string, Submission>>({});

  useEffect(() => {
    if (!studentUid) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(getFirebaseDb(), "homeworkSubmissions"), where("studentUid", "==", studentUid))
        );
        if (cancelled) return;
        const map: Record<string, Submission> = {};
        snap.docs.forEach((d) => {
          const x = d.data() as Submission;
          map[x.homeworkId] = x;
        });
        setSubs(map);
      } catch {
        // list still works; statuses just won't show
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentUid]);

  return (
    <div className="rounded-sm border border-line bg-paper p-6">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={17} className="text-gold-deep" />
        <h2 className="font-display-bn text-lg text-ink">হোমওয়ার্ক</h2>
      </div>
      {homework === null ? (
        <p className="mt-4 text-sm text-ink-soft/60">লোড হচ্ছে...</p>
      ) : homework.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft/60">এখনো কোনো হোমওয়ার্ক দেওয়া হয়নি।</p>
      ) : (
        <div className="mt-4 space-y-3">
          {homework.map((h) => (
            <HomeworkRow
              key={h.id}
              h={h}
              studentUid={studentUid || ""}
              studentName={studentName || ""}
              className={className || ""}
              existing={subs[h.id]}
              onSubmitted={(s) => setSubs((prev) => ({ ...prev, [s.homeworkId]: s }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
