"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { CheckCircle2, Loader2, AlertCircle, Clock, Search } from "lucide-react";

type Sub = {
  id: string;
  homeworkTitle: string;
  subject: string;
  className: string;
  studentName: string;
  text: string;
  imageUrls: string[];
  late: boolean;
  checked: boolean;
  teacherComment: string;
  submittedAtMs: number;
};

function SubmissionCard({ s, onSaved }: { s: Sub; onSaved: (id: string, comment: string) => void }) {
  const [comment, setComment] = useState(s.teacherComment || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function markChecked() {
    setBusy(true);
    setError(false);
    try {
      await updateDoc(doc(getFirebaseDb(), "homeworkSubmissions", s.id), {
        checked: true,
        teacherComment: comment.trim(),
        checkedAt: serverTimestamp(),
        checkedBy: getFirebaseAuth().currentUser?.uid || null,
      });
      onSaved(s.id, comment.trim());
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-sm border border-line bg-paper p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[15px] font-semibold text-ink">{s.studentName || "নাম নেই"}</p>
          <p className="text-xs text-ink-soft/70">
            {s.className} · {s.subject} · {s.homeworkTitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {s.late && (
            <span className="flex items-center gap-1 rounded-full bg-clay-soft px-2 py-0.5 text-[11px] text-clay">
              <Clock size={11} /> দেরিতে জমা
            </span>
          )}
          {s.checked ? (
            <span className="flex items-center gap-1 rounded-full bg-teal-soft px-2 py-0.5 text-[11px] text-teal-deep">
              <CheckCircle2 size={11} /> দেখা হয়েছে
            </span>
          ) : (
            <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] text-gold-deep">এখনো দেখা হয়নি</span>
          )}
          <span className="text-[11px] text-ink-soft/60">
            {s.submittedAtMs
              ? new Date(s.submittedAtMs).toLocaleString("bn-BD", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
              : ""}
          </span>
        </div>
      </div>

      {s.text && <p className="mt-3 whitespace-pre-wrap rounded-sm bg-paper-raised p-3 text-sm text-ink">{s.text}</p>}

      {s.imageUrls.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {s.imageUrls.map((u) => (
            <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="block h-24 w-24 overflow-hidden rounded-sm border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="জমা দেওয়া ছবি" className="h-full w-full object-cover" />
            </a>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="শিক্ষার্থীর জন্য মন্তব্য (ঐচ্ছিক)"
          className="min-w-[200px] flex-1 rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        />
        <button
          type="button"
          onClick={markChecked}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-50"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          {s.checked ? "মন্তব্য আপডেট" : "দেখা হয়েছে"}
        </button>
      </div>
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-clay">
          <AlertCircle size={13} /> সেভ হয়নি — আবার চেষ্টা করুন।
        </p>
      )}
    </div>
  );
}

export default function TeacherSubmissions() {
  const [subs, setSubs] = useState<Sub[] | null>(null);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<"all" | "pending" | "checked">("pending");
  const [cls, setCls] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(getFirebaseDb(), "homeworkSubmissions"), orderBy("submittedAt", "desc"), limit(200))
        );
        if (cancelled) return;
        setSubs(
          snap.docs.map((d) => {
            const x = d.data();
            return {
              id: d.id,
              homeworkTitle: (x.homeworkTitle as string) || "",
              subject: (x.subject as string) || "",
              className: (x.className as string) || "",
              studentName: (x.studentName as string) || "",
              text: (x.text as string) || "",
              imageUrls: (x.imageUrls as string[]) || [],
              late: !!x.late,
              checked: !!x.checked,
              teacherComment: (x.teacherComment as string) || "",
              submittedAtMs: x.submittedAt?.toMillis ? (x.submittedAt.toMillis() as number) : 0,
            };
          })
        );
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const classes = useMemo(() => Array.from(new Set((subs || []).map((s) => s.className).filter(Boolean))).sort(), [subs]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (subs || []).filter((s) => {
      if (status === "pending" && s.checked) return false;
      if (status === "checked" && !s.checked) return false;
      if (cls && s.className !== cls) return false;
      if (q && !`${s.studentName} ${s.homeworkTitle}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [subs, status, cls, search]);

  if (error)
    return (
      <p className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay">
        <AlertCircle size={15} /> জমা পড়া হোমওয়ার্ক আনা যায়নি — Firestore Rules Publish করা আছে কিনা দেখুন।
      </p>
    );
  if (!subs)
    return (
      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <Loader2 size={15} className="animate-spin" /> লোড হচ্ছে...
      </p>
    );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-sm border border-line bg-paper px-3 py-2">
          <Search size={14} className="text-ink-soft/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="শিক্ষার্থী বা হোমওয়ার্কের নাম"
            className="w-full bg-transparent text-sm text-ink outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        >
          <option value="pending">এখনো দেখা হয়নি</option>
          <option value="checked">দেখা হয়েছে</option>
          <option value="all">সব</option>
        </select>
        <select
          value={cls}
          onChange={(e) => setCls(e.target.value)}
          className="rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        >
          <option value="">সব ক্লাস</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-3 text-sm text-ink-soft">{shown.length.toLocaleString("bn-BD")}টি জমা</p>
      <div className="mt-3 space-y-3">
        {shown.map((s) => (
          <SubmissionCard
            key={s.id}
            s={s}
            onSaved={(id, comment) =>
              setSubs((prev) => (prev ? prev.map((x) => (x.id === id ? { ...x, checked: true, teacherComment: comment } : x)) : prev))
            }
          />
        ))}
        {shown.length === 0 && <p className="py-10 text-center text-sm text-ink-soft/60">কোনো জমা পাওয়া যায়নি।</p>}
      </div>
    </div>
  );
}
