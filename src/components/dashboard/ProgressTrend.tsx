"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { TrendingUp } from "lucide-react";
import { getFirebaseDb } from "@/lib/firebase";

type Point = { date: string; ms: number; subject: string; avg: number };

const bn = (n: number) => n.toLocaleString("bn-BD");
const W = 520;
const H = 190;
const PAD = { l: 34, r: 14, t: 14, b: 30 };

// Progress over time, drawn from the dated history entries teachers leave every
// time they record an assessment. It starts filling up from the first entry saved
// after this feature was switched on.
export default function ProgressTrend({ studentUid }: { studentUid: string | null | undefined }) {
  const [points, setPoints] = useState<Point[] | null>(null);
  const [subject, setSubject] = useState("");

  useEffect(() => {
    if (!studentUid) {
      setPoints(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(query(collection(getFirebaseDb(), "assessmentHistory"), where("studentUid", "==", studentUid)));
        if (cancelled) return;
        setPoints(
          snap.docs
            .map((d) => {
              const x = d.data();
              const avg = Math.round(((Number(x.concept) || 0) + (Number(x.practice) || 0) + (Number(x.assessment) || 0)) / 3);
              return {
                date: (x.date as string) || "",
                ms: x.createdAt?.toMillis ? (x.createdAt.toMillis() as number) : 0,
                subject: (x.subject as string) || "",
                avg,
              };
            })
            .sort((a, b) => a.date.localeCompare(b.date) || a.ms - b.ms)
        );
      } catch {
        if (!cancelled) setPoints([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentUid]);

  const subjects = useMemo(() => Array.from(new Set((points || []).map((p) => p.subject).filter(Boolean))).sort(), [points]);

  const series = useMemo(() => {
    const list = (points || []).filter((p) => !subject || p.subject === subject);
    if (subject) return list.map((p) => ({ date: p.date, avg: p.avg }));
    // all subjects: average of everything recorded on the same day
    const byDay = new Map<string, number[]>();
    list.forEach((p) => byDay.set(p.date, [...(byDay.get(p.date) || []), p.avg]));
    return Array.from(byDay, ([date, vals]) => ({ date, avg: Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) }));
  }, [points, subject]);

  if (!points || points.length === 0) return null;

  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const x = (i: number) => PAD.l + (series.length <= 1 ? plotW / 2 : (i / (series.length - 1)) * plotW);
  const y = (v: number) => PAD.t + plotH * (1 - v / 100);
  const line = series.map((p, i) => `${x(i)},${y(p.avg)}`).join(" ");
  const area = series.length > 1 ? `${x(0)},${y(0)} ${line} ${x(series.length - 1)},${y(0)}` : "";
  const first = series[0]?.avg ?? 0;
  const last = series[series.length - 1]?.avg ?? 0;
  const diff = last - first;

  return (
    <div className="rounded-sm border border-line bg-paper p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display-bn text-lg text-ink">
          <TrendingUp size={17} style={{ color: "#2563eb" }} /> উন্নতির গ্রাফ
        </h2>
        {subjects.length > 0 && (
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-sm border border-line bg-paper-raised px-3 py-1.5 text-sm text-ink outline-none focus:border-ink"
          >
            <option value="">সব বিষয় (গড়)</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      {series.length < 2 ? (
        <p className="mt-4 text-sm text-ink-soft">
          গ্রাফ আঁকতে কমপক্ষে ২টা আলাদা মূল্যায়ন দরকার — এখন পর্যন্ত {bn(series.length)}টা আছে ({bn(series[0]?.avg ?? 0)}%)।
          শিক্ষক নতুন মূল্যায়ন যোগ করলেই গ্রাফ ফুটে উঠবে।
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm text-ink-soft">
            শুরুতে <span className="font-semibold text-ink">{bn(first)}%</span> → এখন{" "}
            <span className="font-semibold text-ink">{bn(last)}%</span>{" "}
            <span className="font-bold" style={{ color: diff >= 0 ? "#047857" : "#be123c" }}>
              ({diff >= 0 ? "+" : "−"}{bn(Math.abs(diff))})
            </span>
          </p>
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="সময়ের সাথে গড় নম্বরের গ্রাফ">
            <defs>
              <linearGradient id="trend-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 50, 100].map((v) => (
              <g key={v}>
                <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="#dcddd2" strokeWidth={1} />
                <text x={4} y={y(v) + 3} fontSize="10" fill="#4b5566">{bn(v)}%</text>
              </g>
            ))}
            {area && <polygon points={area} fill="url(#trend-area)" />}
            <polyline points={line} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinejoin="round" />
            {series.map((p, i) => (
              <circle key={i} cx={x(i)} cy={y(p.avg)} r={3.5} fill="#1d4ed8" />
            ))}
            <text x={x(0)} y={H - 8} fontSize="10" fill="#4b5566" textAnchor="start">{series[0].date}</text>
            <text x={x(series.length - 1)} y={H - 8} fontSize="10" fill="#4b5566" textAnchor="end">{series[series.length - 1].date}</text>
          </svg>
        </>
      )}
    </div>
  );
}
