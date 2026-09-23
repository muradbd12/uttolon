"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

// প্রজেক্টে কোনো চার্ট লাইব্রেরি নেই, তাই এখানে হালকা SVG দিয়ে নিজেই
// ২টা সাধারণ চার্ট বানানো হয়েছে — নতুন কোনো npm প্যাকেজ লাগে না।
// রঙগুলো globals.css-এর টোকেনের সাথে মিলিয়ে সরাসরি hex হিসেবে বসানো
// (SVG-তে CSS var() সবসময় নির্ভরযোগ্যভাবে কাজ নাও করতে পারে)।
const TEAL_DEEP = "#123f33";
const TEAL = "#1e6b58";
const GOLD_DEEP = "#96691c";
const LINE = "#dcddd2";
const INK_SOFT = "#4b5566";

const BN_DIGITS: Record<string, string> = {
  "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
  "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
};
function toBnDigits(n: number | string) {
  return String(n).split("").map((c) => BN_DIGITS[c] ?? c).join("");
}

const BN_MONTHS = [
  "জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে",
];
const BN_WEEKDAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];

function last7Days(): string[] {
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function last6Months(): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 5; i >= 0; i--) {
    const m = new Date(d);
    m.setMonth(m.getMonth() - i);
    out.push(m.toISOString().slice(0, 7));
  }
  return out;
}

type ChartData = {
  attendanceByDay: { date: string; rate: number | null }[];
  feeByMonth: { month: string; amount: number }[];
};

export default function AdminCharts() {
  const [data, setData] = useState<ChartData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const db = getFirebaseDb();
        const [attendanceSnap, feesSnap] = await Promise.all([
          getDocs(collection(db, "attendance")),
          getDocs(collection(db, "fees")),
        ]);

        const days = last7Days();
        const attendanceByDay = days.map((date) => {
          const dayDocs = attendanceSnap.docs.filter((d) => d.data().date === date);
          if (dayDocs.length === 0) return { date, rate: null as number | null };
          const present = dayDocs.filter((d) => d.data().status === "present").length;
          return { date, rate: Math.round((present / dayDocs.length) * 100) };
        });

        const months = last6Months();
        const feeByMonth = months.map((month) => {
          const amount = feesSnap.docs
            .filter((d) => d.data().month === month)
            .reduce((sum, d) => sum + (Number(d.data().amountPaid) || 0), 0);
          return { month, amount };
        });

        if (!cancelled) setData({ attendanceByDay, feeByMonth });
      } catch {
        if (!cancelled) setError(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="text-sm text-ink-soft/60">চার্টের তথ্য আনা যায়নি — একটু পরে আবার চেষ্টা করুন।</p>
    );
  }

  if (!data) {
    return <p className="text-sm text-ink-soft/60">চার্ট লোড হচ্ছে...</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <AttendanceLineChart points={data.attendanceByDay} />
      <FeeBarChart bars={data.feeByMonth} />
    </div>
  );
}

function AttendanceLineChart({ points }: { points: { date: string; rate: number | null }[] }) {
  const W = 320;
  const H = 150;
  const padX = 8;
  const padTop = 12;
  const padBottom = 24;
  const plotH = H - padTop - padBottom;
  const stepX = (W - padX * 2) / (points.length - 1 || 1);

  const coords = points.map((p, i) => {
    const x = padX + i * stepX;
    const y = p.rate === null ? null : padTop + plotH * (1 - p.rate / 100);
    return { ...p, x, y };
  });

  const linePoints = coords
    .filter((c) => c.y !== null)
    .map((c) => `${c.x},${c.y}`)
    .join(" ");

  const hasAnyData = coords.some((c) => c.y !== null);

  return (
    <div className="rounded-sm border border-line bg-paper p-5">
      <h3 className="font-display-bn text-base text-ink">উপস্থিতির ট্রেন্ড (গত ৭ দিন)</h3>
      {!hasAnyData ? (
        <p className="mt-6 text-sm text-ink-soft/60">এই সপ্তাহে এখনো উপস্থিতির কোনো তথ্য নেই।</p>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="উপস্থিতির ট্রেন্ড চার্ট">
          {[0, 50, 100].map((v) => {
            const y = padTop + plotH * (1 - v / 100);
            return (
              <g key={v}>
                <line x1={padX} x2={W - padX} y1={y} y2={y} stroke={LINE} strokeWidth={1} />
                <text x={0} y={y - 2} fontSize="8" fill={INK_SOFT}>
                  {toBnDigits(v)}%
                </text>
              </g>
            );
          })}
          <polyline points={linePoints} fill="none" stroke={TEAL_DEEP} strokeWidth={2} />
          {coords.map((c, i) =>
            c.y !== null ? <circle key={i} cx={c.x} cy={c.y} r={3} fill={TEAL} /> : null
          )}
          {coords.map((c, i) => (
            <text key={i} x={c.x} y={H - 6} fontSize="8" fill={INK_SOFT} textAnchor="middle">
              {BN_WEEKDAYS[new Date(c.date).getDay()]}
            </text>
          ))}
        </svg>
      )}
    </div>
  );
}

function FeeBarChart({ bars }: { bars: { month: string; amount: number }[] }) {
  const W = 320;
  const H = 150;
  const padX = 10;
  const padTop = 12;
  const padBottom = 24;
  const plotH = H - padTop - padBottom;
  const max = Math.max(...bars.map((b) => b.amount), 1);
  const gap = 10;
  const barW = (W - padX * 2 - gap * (bars.length - 1)) / bars.length;

  const hasAnyData = bars.some((b) => b.amount > 0);

  return (
    <div className="rounded-sm border border-line bg-paper p-5">
      <h3 className="font-display-bn text-base text-ink">মাসিক ফি সংগ্রহ (গত ৬ মাস)</h3>
      {!hasAnyData ? (
        <p className="mt-6 text-sm text-ink-soft/60">এখনো কোনো মাসিক ফি সংগ্রহের তথ্য নেই।</p>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="ফি সংগ্রহ চার্ট">
          <line x1={padX} x2={W - padX} y1={padTop + plotH} y2={padTop + plotH} stroke={LINE} strokeWidth={1} />
          {bars.map((b, i) => {
            const h = max > 0 ? (b.amount / max) * plotH : 0;
            const x = padX + i * (barW + gap);
            const y = padTop + plotH - h;
            const [, m] = b.month.split("-");
            const monthLabel = BN_MONTHS[Number(m) - 1] ?? b.month;
            return (
              <g key={b.month}>
                <rect x={x} y={y} width={barW} height={h} fill={GOLD_DEEP} rx={2} />
                <text x={x + barW / 2} y={H - 6} fontSize="8" fill={INK_SOFT} textAnchor="middle">
                  {monthLabel}
                </text>
              </g>
            );
          })}
          <text x={padX} y={padTop - 2} fontSize="8" fill={INK_SOFT}>
            সর্বোচ্চ: ৳{toBnDigits(max.toLocaleString("en-US"))}
          </text>
        </svg>
      )}
    </div>
  );
}
