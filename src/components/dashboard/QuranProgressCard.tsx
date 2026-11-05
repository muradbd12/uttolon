"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { BookOpenCheck } from "lucide-react";
import { getFirebaseDb } from "@/lib/firebase";
import { QURAN_RATINGS, QURAN_TYPES, mapQuranLog, ratingStyle, type QuranLog } from "@/lib/quran";

const bn = (n: number) => n.toLocaleString("bn-BD");

// Shown on the student / guardian dashboard only when the teacher has recorded
// at least one Quran lesson for that student (so other students see nothing).
export default function QuranProgressCard({ studentUid }: { studentUid: string | null | undefined }) {
  const [logs, setLogs] = useState<QuranLog[] | null>(null);

  useEffect(() => {
    if (!studentUid) {
      setLogs(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(query(collection(getFirebaseDb(), "quranLogs"), where("studentUid", "==", studentUid)));
        if (cancelled) return;
        setLogs(
          snap.docs
            .map((d) => mapQuranLog(d.id, d.data()))
            .sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.ms - a.ms)
        );
      } catch {
        if (!cancelled) setLogs([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentUid]);

  if (!logs || logs.length === 0) return null;

  const paras = new Set(logs.map((l) => l.paraCompleted).filter((p): p is number => p !== null && p >= 1 && p <= 30));
  const last = logs[0];

  return (
    <div className="rounded-sm border border-line bg-paper p-6">
      <div className="flex items-center gap-2">
        <BookOpenCheck size={17} className="text-teal-deep" />
        <h2 className="font-display-bn text-lg text-ink">কুরআন শিক্ষা — অগ্রগতি</h2>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-ink-soft">সম্পন্ন পারা</span>
          <span className="font-bold text-ink">{bn(paras.size)} / {bn(30)}</span>
        </div>
        <div className="mt-1.5 h-2.5 w-full rounded-full bg-line">
          <div
            className="h-2.5 rounded-full"
            style={{ width: `${(paras.size / 30) * 100}%`, background: "linear-gradient(90deg,#10b981,#047857)" }}
          />
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          সর্বশেষ পাঠ: <span className="font-medium text-ink">{last.range || QURAN_TYPES[last.type]}</span>
          {last.date ? ` (${last.date})` : ""}
        </p>
      </div>

      <ul className="mt-4 divide-y divide-line/60">
        {logs.slice(0, 5).map((l) => (
          <li key={l.id} className="py-2.5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-ink">{l.range || "—"}</span>
              <span className="text-xs text-ink-soft/70">{l.date}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-paper-raised px-2 py-0.5 text-[11px] text-ink-soft">{QURAN_TYPES[l.type]}</span>
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{ background: ratingStyle[l.rating].bg, color: ratingStyle[l.rating].fg }}
              >
                {QURAN_RATINGS[l.rating]}
              </span>
              {l.paraCompleted ? (
                <span className="rounded-full bg-teal-soft px-2 py-0.5 text-[11px] font-semibold text-teal-deep">
                  {bn(l.paraCompleted)} নম্বর পারা সম্পন্ন ✓
                </span>
              ) : null}
            </div>
            {l.note && <p className="mt-1 text-xs text-ink-soft">{l.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
