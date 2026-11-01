"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, AlertCircle, Search, Info, Receipt, Printer, X } from "lucide-react";
import PaymentVoucherCard, { type VoucherData } from "@/components/PaymentVoucherCard";
import { printIsolated } from "@/lib/printReceipt";
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
  receipt: {
    idLabel: string;
    applicationId: string;
    className: string;
    group: string;
    program: string;
    mobile: string;
    nameEn: string;
    voucherId: string;
    purpose: string;
    totalFee: number;
    paidUpTo: number;
    dueAfter: number;
  };
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

function buildVoucher(r: Row): VoucherData {
  return {
    idLabel: r.receipt.idLabel,
    studentNameBn: r.student,
    studentNameEn: r.receipt.nameEn,
    applicationId: r.receipt.applicationId,
    className: r.receipt.className,
    group: r.receipt.group,
    program: r.receipt.program,
    mobile: r.receipt.mobile,
    voucherId: r.receipt.voucherId,
    paymentDate: r.ts
      ? new Date(r.ts).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })
      : "—",
    amountPaidNow: r.amount,
    method: r.ref && r.kind === "monthly" ? `${r.method || "—"} (${r.ref})` : r.method || "—",
    monthOrPurpose: r.receipt.purpose,
    totalFee: r.receipt.totalFee,
    totalPaid: r.receipt.paidUpTo,
    due: r.receipt.dueAfter,
  };
}

export default function AdminLedger() {
  const [data, setData] = useState<LedgerResponse | null>(null);
  const [error, setError] = useState(false);
  const [kind, setKind] = useState<"all" | "admission" | "monthly">("all");
  const [month, setMonth] = useState("");
  const [search, setSearch] = useState("");
  const [receiptRow, setReceiptRow] = useState<Row | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (receiptRow) receiptRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [receiptRow]);

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
          <p className="mt-1 text-xl font-bold text-teal-deep">{data.totals.all.toLocaleString("bn-BD")} টাকা</p>
        </div>
        <div className="rounded-sm border border-line bg-paper p-4">
          <p className="text-xs text-ink-soft/60">ভর্তি ফি বাবদ</p>
          <p className="mt-1 text-xl font-bold text-ink">{data.totals.admission.toLocaleString("bn-BD")} টাকা</p>
        </div>
        <div className="rounded-sm border border-line bg-paper p-4">
          <p className="text-xs text-ink-soft/60">মাসিক ফি বাবদ</p>
          <p className="mt-1 text-xl font-bold text-ink">{data.totals.monthly.toLocaleString("bn-BD")} টাকা</p>
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
        {filtered.length}টি এন্ট্রি · মোট <span className="font-medium text-ink">{filteredTotal.toLocaleString("bn-BD")} টাকা</span>
        {data.truncated && <span className="text-ink-soft/60"> (সব লেনদেনের মধ্যে সবচেয়ে নতুন ৫০০টি দেখানো হচ্ছে)</span>}
      </p>

      {receiptRow && (
        <div ref={receiptRef} className="mt-4 rounded-sm border border-line bg-paper p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
            <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
              <Receipt size={15} /> টাকার রশিদ (শুধু এই পেমেন্টের)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => printIsolated("printable-voucher")}
                className="flex items-center gap-1.5 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold-deep"
              >
                <Printer size={14} /> রশিদ প্রিন্ট করুন
              </button>
              <button
                type="button"
                onClick={() => setReceiptRow(null)}
                className="flex items-center gap-1 rounded-sm border border-line px-3 py-2 text-sm text-ink-soft hover:border-ink"
              >
                <X size={14} /> বন্ধ করুন
              </button>
            </div>
          </div>
          <div className="mt-4">
            <PaymentVoucherCard data={buildVoucher(receiptRow)} />
          </div>
        </div>
      )}

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[15px]">
          <thead>
            <tr className="border-b-2 border-line text-left text-[13px] font-semibold text-ink-soft">
              <th className="py-2 pr-3 font-normal">তারিখ</th>
              <th className="py-2 pr-3 font-normal">শিক্ষার্থী</th>
              <th className="py-2 pr-3 font-normal">ধরন</th>
              <th className="py-2 pr-3 font-normal">বিবরণ</th>
              <th className="py-2 pr-3 font-normal">পদ্ধতি</th>
              <th className="py-2 pr-3 text-right font-normal">টাকা</th>
              <th className="py-2 font-normal">রশিদ</th>
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
                <td className="py-2 pr-3 text-right text-[15px] font-bold text-ink">{r.amount.toLocaleString("bn-BD")} টাকা</td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => setReceiptRow(r)}
                    className="flex items-center gap-1 rounded-sm border border-ink px-2 py-1 text-xs font-medium text-ink hover:bg-ink hover:text-paper"
                  >
                    <Receipt size={12} /> রশিদ
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-ink-soft/60">কোনো এন্ট্রি পাওয়া যায়নি।</td>
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
