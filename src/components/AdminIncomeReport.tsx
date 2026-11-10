"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, AlertCircle, Printer, TrendingUp } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import { withTimeout } from "@/lib/withTimeout";
import { printIsolated } from "@/lib/printReceipt";
import { PALETTE } from "@/lib/dashboardColors";

type Labeled = { label: string; amount: number; count: number };
type Report = {
  range: { from: string; to: string };
  totals: { all: number; admission: number; monthly: number; count: number };
  byDay: { date: string; amount: number }[];
  byMonth: { month: string; amount: number }[];
  byMethod: Labeled[];
  byProgram: Labeled[];
  byClass: Labeled[];
};

const bn = (n: number) => n.toLocaleString("bn-BD");
const tk = (n: number) => `${bn(Math.round(n))} টাকা`;

// Bangladesh "today" (UTC+6), so presets are right even if the device clock is elsewhere
function bdToday() {
  return new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 10);
}
function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const PRESETS: { key: string; label: string; range: () => { from: string; to: string } }[] = [
  { key: "today", label: "আজ", range: () => ({ from: bdToday(), to: bdToday() }) },
  { key: "7d", label: "গত ৭ দিন", range: () => ({ from: addDays(bdToday(), -6), to: bdToday() }) },
  { key: "month", label: "এই মাস", range: () => ({ from: `${bdToday().slice(0, 7)}-01`, to: bdToday() }) },
  {
    key: "lastmonth",
    label: "গত মাস",
    range: () => {
      const first = `${bdToday().slice(0, 7)}-01`;
      const lastEnd = addDays(first, -1);
      return { from: `${lastEnd.slice(0, 7)}-01`, to: lastEnd };
    },
  },
  { key: "year", label: "এই বছর", range: () => ({ from: `${bdToday().slice(0, 4)}-01-01`, to: bdToday() }) },
  { key: "all", label: "সব সময়", range: () => ({ from: "", to: "" }) },
];

function csvCell(v: string | number) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function Bars({ title, rows }: { title: string; rows: Labeled[] }) {
  const max = Math.max(...rows.map((r) => r.amount), 1);
  const total = rows.reduce((s, r) => s + r.amount, 0) || 1;
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <h3 className="font-display-bn text-base text-ink">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft/60">কোনো তথ্য নেই।</p>
      ) : (
        <div className="mt-3 space-y-3">
          {rows.map((r, i) => {
            const c = PALETTE[i % PALETTE.length];
            return (
              <div key={r.label}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="text-ink">{r.label}</span>
                  <span className="font-semibold text-ink">
                    {tk(r.amount)} <span className="font-normal text-ink-soft/60">({bn(Math.round((r.amount / total) * 100))}%)</span>
                  </span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-line">
                  <div className="h-2 rounded-full" style={{ width: `${(r.amount / max) * 100}%`, background: `linear-gradient(90deg, ${c.from}, ${c.to})` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TimeBars({ points, unit }: { points: { label: string; amount: number }[]; unit: "দিন" | "মাস" }) {
  const W = 640;
  const H = 210;
  const pad = { l: 8, r: 8, t: 22, b: 34 };
  const max = Math.max(...points.map((p) => p.amount), 1);
  const gap = points.length > 40 ? 2 : 6;
  const barW = Math.max((W - pad.l - pad.r - gap * (points.length - 1)) / points.length, 2);
  const plotH = H - pad.t - pad.b;
  const labelEvery = Math.max(1, Math.ceil(points.length / 8));
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[420px]" role="img" aria-label={`${unit} অনুযায়ী আয়`}>
        <defs>
          <linearGradient id="inc-bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
        <line x1={pad.l} x2={W - pad.r} y1={pad.t + plotH} y2={pad.t + plotH} stroke="#dcddd2" />
        <text x={pad.l} y={12} fontSize="10" fill="#4b5566">সর্বোচ্চ: {tk(max)}</text>
        {points.map((p, i) => {
          const h = (p.amount / max) * plotH;
          const x = pad.l + i * (barW + gap);
          return (
            <g key={p.label}>
              <rect x={x} y={pad.t + plotH - h} width={barW} height={h} rx={2} fill="url(#inc-bar)">
                <title>{`${p.label}: ${tk(p.amount)}`}</title>
              </rect>
              {i % labelEvery === 0 && (
                <text x={x + barW / 2} y={H - 14} fontSize="9" fill="#4b5566" textAnchor="middle">
                  {p.label.length > 7 ? p.label.slice(5) : p.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function AdminIncomeReport() {
  const [preset, setPreset] = useState("month");
  const [from, setFrom] = useState(() => PRESETS[2].range().from);
  const [to, setTo] = useState(() => PRESETS[2].range().to);
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const token = await getFirebaseAuth().currentUser?.getIdToken();
        if (!token) throw new Error("unauthorized");
        const qs = new URLSearchParams();
        if (from) qs.set("from", from);
        if (to) qs.set("to", to);
        const res = await withTimeout(fetch(`/api/admin/income-report?${qs.toString()}`, { headers: { Authorization: `Bearer ${token}` } }));
        if (!res.ok) throw new Error("failed");
        const json = (await res.json()) as Report;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  function pick(key: string) {
    const p = PRESETS.find((x) => x.key === key);
    if (!p) return;
    const r = p.range();
    setPreset(key);
    setFrom(r.from);
    setTo(r.to);
  }

  function downloadCsv() {
    if (!data) return;
    const lines = [["বিভাগ", "বিবরণ", "টাকা", "পেমেন্ট সংখ্যা"].map(csvCell).join(",")];
    lines.push(["সারাংশ", "মোট আয়", data.totals.all, data.totals.count].map(csvCell).join(","));
    lines.push(["সারাংশ", "ভর্তি ফি", data.totals.admission, ""].map(csvCell).join(","));
    lines.push(["সারাংশ", "মাসিক ফি", data.totals.monthly, ""].map(csvCell).join(","));
    data.byDay.forEach((d) => lines.push(["দিন", d.date, d.amount, ""].map(csvCell).join(",")));
    data.byMethod.forEach((m) => lines.push(["পদ্ধতি", m.label, m.amount, m.count].map(csvCell).join(",")));
    data.byProgram.forEach((m) => lines.push(["প্রোগ্রাম", m.label, m.amount, m.count].map(csvCell).join(",")));
    data.byClass.forEach((m) => lines.push(["ক্লাস", m.label, m.amount, m.count].map(csvCell).join(",")));
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uttolon-income-${from || "all"}_${to || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const useDays = data ? data.byDay.length > 0 && data.byDay.length <= 62 : false;
  const timePoints = data
    ? useDays
      ? data.byDay.map((d) => ({ label: d.date, amount: d.amount }))
      : data.byMonth.map((m) => ({ label: m.month, amount: m.amount }))
    : [];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => pick(p.key)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${
              preset === p.key ? "border-ink bg-ink text-paper" : "border-line bg-white text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-soft print:hidden">
        <span>তারিখ থেকে</span>
        <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPreset("custom"); }} className="rounded-sm border border-line bg-white px-2.5 py-1.5 text-ink outline-none focus:border-ink" />
        <span>পর্যন্ত</span>
        <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPreset("custom"); }} className="rounded-sm border border-line bg-white px-2.5 py-1.5 text-ink outline-none focus:border-ink" />
        <button type="button" onClick={downloadCsv} disabled={!data} className="ml-auto flex items-center gap-1.5 rounded-sm border border-ink px-3 py-1.5 font-medium text-ink hover:bg-ink hover:text-paper disabled:opacity-50">
          <Download size={14} /> CSV
        </button>
        <button type="button" onClick={() => printIsolated("printable-income-report")} disabled={!data} className="flex items-center gap-1.5 rounded-sm bg-ink px-3 py-1.5 font-medium text-paper hover:bg-gold-deep disabled:opacity-50">
          <Printer size={14} /> প্রিন্ট
        </button>
      </div>

      {error && (
        <p className="mt-5 flex items-start gap-2 rounded-sm border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay">
          <AlertCircle size={15} className="mt-0.5 shrink-0" /> রিপোর্ট আনা যায়নি — একটু পরে আবার চেষ্টা করুন।
        </p>
      )}
      {loading && !data && (
        <p className="mt-5 flex items-center gap-2 text-sm text-ink-soft"><Loader2 size={15} className="animate-spin" /> লোড হচ্ছে...</p>
      )}

      {data && (
        <div id="printable-income-report" className={`mt-5 space-y-5 ${loading ? "opacity-60" : ""}`}>
          <p className="text-sm text-ink-soft">
            {data.range.from || data.range.to
              ? `${data.range.from || "শুরু"} থেকে ${data.range.to || "আজ"} পর্যন্ত`
              : "সব সময়ের হিসাব"}{" "}
            · {bn(data.totals.count)}টা পেমেন্ট
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "মোট আয়", value: data.totals.all, from: PALETTE[2].from, to: PALETTE[2].to },
              { label: "ভর্তি ফি বাবদ", value: data.totals.admission, from: PALETTE[0].from, to: PALETTE[0].to },
              { label: "মাসিক ফি বাবদ", value: data.totals.monthly, from: PALETTE[1].from, to: PALETTE[1].to },
            ].map((c) => (
              <div key={c.label} className="rounded-xl p-4 text-white shadow-md" style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
                <p className="flex items-center gap-1.5 text-xs font-medium text-white/85"><TrendingUp size={13} /> {c.label}</p>
                <p className="mt-1.5 font-display-en text-2xl font-semibold">{tk(c.value)}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <h3 className="font-display-bn text-base text-ink">{useDays ? "দিন অনুযায়ী আয়" : "মাস অনুযায়ী আয়"}</h3>
            {timePoints.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft/60">এই সময়ে কোনো পেমেন্ট নেই।</p>
            ) : (
              <div className="mt-2"><TimeBars points={timePoints} unit={useDays ? "দিন" : "মাস"} /></div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Bars title="পেমেন্টের পদ্ধতি অনুযায়ী" rows={data.byMethod} />
            <Bars title="প্রোগ্রাম অনুযায়ী" rows={data.byProgram} />
          </div>
          <Bars title="ক্লাস অনুযায়ী" rows={data.byClass} />

          <p className="text-xs leading-relaxed text-ink-soft/70">
            মাসিক ফি-র ক্ষেত্রে প্রতিটা মাসের শুধু সর্বশেষ সংরক্ষণের দিনেই পুরো পরিশোধিত অঙ্কটা ধরা হয় (আলাদা
            কিস্তি হিসেবে জমে না) — তাই মাসিক ফি-র দিন-অনুযায়ী ভাগ কিছুটা আনুমানিক। ভর্তি ফি-র প্রতিটা কিস্তি তার
            আসল তারিখেই ধরা হয়। তারিখ বাংলাদেশ সময় অনুযায়ী।
          </p>
        </div>
      )}
    </div>
  );
}
