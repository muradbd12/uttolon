"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, AlertCircle, Search, Info } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import { withTimeout } from "@/lib/withTimeout";

type Row = {
  id: string;
  ts: number;
  student: string;
  kind: "admission" | "monthly";
  detail: string;
  method: string;
  ref: string;
  amount: number;
};

type LedgerResponse = {
  rows: Row[];
  truncated: boolean;
  count: number;
  totals: { all: number; admission: number; monthly: number };
};

function fmtDate(ts: number) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" });
}

function monthKey(ts: number) {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function csvCell(v: string | number) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function AdminLedger() {
  const [data, setData] = useState<LedgerResponse | null>(null);
  const [error, setError] = useState(false);
  const [kind, setKind] = useState<"all" | "admission" | "monthly">("all");
  const [month, setMonth] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const token = await getFirebaseAuth().currentUser?.getIdToken();
        if (!token) throw new Error("unauthorized");
        const res = await withTimeout(
          fetch("/api/admin/ledger", { headers: { Authorization: `Bearer ${token}` } })
        );
        if (!res.ok) throw new Error("failed");
        const json = (await res.json()) as LedgerResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const months = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.rows.map((r) => monthKey(r.ts)).filter(Boolean))).sort().reverse();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.rows.filter((r) => {
      if (kind !== "all" && r.kind !== kind) return false;
      if (month && monthKey(r.ts) !== month) return false;
      if (q && !`${r.student} ${r.ref} ${r.detail}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, kind, month, search]);

  const filteredTotal = filtered.reduce((s, r) => s + r.amount, 0);

  function downloadCsv() {
    const header = ["তারিখ", "শিক্ষার্থী", "ধরন", "বিবরণ", "পদ্ধতি", "রেফারেন্স", "টাকা"];
    const lines = [header.map(csvCell).join(",")];
    filtered.forEach((r) => {
      lines.push(
        [
          fmtDate(r.ts),
          r.student,
          r.kind === "admission" ? "ভর্তি ফি" : "মাসিক ফি",
          r.detail,
          r.method,
          r.ref,
          r.amount,
        ]
          .map(csvCell)
          .join(",")
      );
    });
    // BOM so Excel shows Bangla text correctly
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uttolon-payment-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (error) {
    return (
      <p className="flex items-start gap-2 rounded-sm border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay">
        <AlertCircle size={15} className="mt-0.5 shrink-0" />
        পেমেন্ট ইতিহাস আনা যায়নি — একটু পরে আবার চেষ্টা করুন।
      </p>
    );
  }

  if (!data) {
    return (
      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <Loader2 size={15} className="animate-spin" /> লোড হচ্ছে...
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-sm border border-line bg-paper p-4">
          <p className="text-xs text-ink-soft/60">মোট জমা (সব)</p>
          <p className="mt-1 text-xl font-bold text-teal-deep">৳{data.totals.all.toLocaleString("bn-BD")}</p>
        </div>
        <div className="rounded-sm border border-line bg-paper p-4">
          <p className="text-xs text-ink-soft/60">ভর্তি ফি বাবদ</p>
          <p className="mt-1 text-xl font-bold text-ink">৳{data.totals.admission.toLocaleString("bn-BD")}</p>
        </div>
        <div className="rounded-sm border border-line bg-paper p-4">
          <p className="text-xs text-ink-soft/60">মাসিক ফি বাবদ</p>
          <p className="mt-1 text-xl font-bold text-ink">৳{data.totals.monthly.toLocaleString("bn-BD")}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-sm border border-line bg-paper px-3 py-2">
          <Search size={14} className="text-ink-soft/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম বা আইডি দিয়ে খুঁজুন"
            className="w-full bg-transparent text-sm text-ink outline-none"
          />
        </div>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as typeof kind)}
          className="rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        >
          <option value="all">সব ধরন</option>
          <option value="admission">ভর্তি ফি</option>
          <option value="monthly">মাসিক ফি</option>
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        >
          <option value="">সব মাস</option>
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={filtered.length === 0}
          className="flex items-center gap-1.5 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-50"
        >
          <Download size={14} /> CSV
        </button>
      </div>

      <p className="mt-3 text-sm text-ink-soft">
        {filtered.length}টি এন্ট্রি · মোট <span className="font-medium text-ink">৳{filteredTotal.toLocaleString("bn-BD")}</span>
        {data.truncated && <span className="text-ink-soft/60"> (সব লেনদেনের মধ্যে সবচেয়ে নতুন ৫০০টি দেখানো হচ্ছে)</span>}
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-ink-soft/60">
              <th className="py-2 pr-3 font-normal">তারিখ</th>
              <th className="py-2 pr-3 font-normal">শিক্ষার্থী</th>
              <th className="py-2 pr-3 font-normal">ধরন</th>
              <th className="py-2 pr-3 font-normal">বিবরণ</th>
              <th className="py-2 pr-3 font-normal">পদ্ধতি</th>
              <th className="py-2 text-right font-normal">টাকা</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={`${r.kind}-${r.id}`} className="border-b border-line/60">
                <td className="py-2 pr-3 text-ink-soft">{fmtDate(r.ts)}</td>
                <td className="py-2 pr-3 text-ink">
                  {r.student}
                  {r.ref && <span className="ml-1.5 text-xs text-ink-soft/50">{r.ref}</span>}
                </td>
                <td className="py-2 pr-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      r.kind === "admission" ? "bg-gold-soft text-gold-deep" : "bg-teal-soft text-teal-deep"
                    }`}
                  >
                    {r.kind === "admission" ? "ভর্তি ফি" : "মাসিক ফি"}
                  </span>
                </td>
                <td className="py-2 pr-3 text-ink-soft">{r.detail || "—"}</td>
                <td className="py-2 pr-3 text-ink-soft">{r.method || "—"}</td>
                <td className="py-2 text-right font-medium text-ink">৳{r.amount.toLocaleString("bn-BD")}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-ink-soft/60">কোনো এন্ট্রি পাওয়া যায়নি।</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-sm border border-gold/30 bg-gold-soft/40 p-3 text-xs text-ink">
        <Info size={14} className="mt-0.5 shrink-0 text-gold-deep" />
        ভর্তি ফি-র প্রতিটা কিস্তি আলাদা এন্ট্রি হিসেবে আসে। মাসিক ফি-তে প্রতি মাসে ওই মাসের সর্বশেষ
        সংরক্ষিত মোট পরিশোধিত টাকাটাই দেখায় (একই মাসে দুইবার এডিট করলে আগের অঙ্ক বদলে যায়, আলাদা
        কিস্তি হিসেবে জমে না)।
      </p>
    </div>
  );
}
