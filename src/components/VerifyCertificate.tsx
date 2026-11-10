"use client";

import { useState } from "react";
import { BadgeCheck, Loader2, SearchX, ShieldCheck } from "lucide-react";
import { withTimeout } from "@/lib/withTimeout";

type Found = { valid: true; certNo: string; studentName: string; className: string; title: string; issuedDate: string };

export default function VerifyCertificate() {
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "found" | "notfound" | "error">("idle");
  const [data, setData] = useState<Found | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{8}$/.test(c)) {
      setState("notfound");
      return;
    }
    setState("loading");
    try {
      const res = await withTimeout(fetch(`/api/public/verify-certificate?code=${encodeURIComponent(c)}`));
      if (res.status === 404) {
        setState("notfound");
        return;
      }
      if (!res.ok) throw new Error("failed");
      setData((await res.json()) as Found);
      setState("found");
    } catch {
      setState("error");
    }
  }

  return (
    <div>
      <form onSubmit={check} className="flex flex-wrap items-center gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={8}
          placeholder="৮ অক্ষরের যাচাই কোড (যেমন K7M2QX9P)"
          className="w-full max-w-xs rounded-sm border border-line bg-paper px-3.5 py-2.5 font-mono text-[15px] tracking-widest text-ink outline-none focus:border-ink"
        />
        <button type="submit" disabled={state === "loading"} className="flex items-center gap-2 rounded-sm bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60">
          {state === "loading" ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} যাচাই করুন
        </button>
      </form>
      <p className="mt-2 text-xs text-ink-soft/70">কোডটা সনদের নিচের মাঝখানে "যাচাই: … কোড XXXXXXXX" লাইনে ছাপা থাকে।</p>

      {state === "found" && data && (
        <div className="mt-6 rounded-sm border-2 border-teal bg-teal-soft/50 p-5">
          <p className="flex items-center gap-2 text-lg font-bold text-teal-deep"><BadgeCheck size={20} /> এই সনদটি আসল ও উত্তোলন কর্তৃক প্রদত্ত</p>
          <dl className="mt-3 grid grid-cols-1 gap-2 text-[15px] sm:grid-cols-2">
            <div><dt className="text-xs text-ink-soft">নাম</dt><dd className="font-semibold text-ink">{data.studentName}</dd></div>
            <div><dt className="text-xs text-ink-soft">ক্লাস</dt><dd className="text-ink">{data.className || "—"}</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs text-ink-soft">সনদ</dt><dd className="font-semibold text-ink">{data.title}</dd></div>
            <div><dt className="text-xs text-ink-soft">সনদ নং</dt><dd className="text-ink">{data.certNo}</dd></div>
            <div><dt className="text-xs text-ink-soft">তারিখ</dt><dd className="text-ink">{data.issuedDate}</dd></div>
          </dl>
        </div>
      )}
      {state === "notfound" && (
        <p className="mt-6 flex items-start gap-2 rounded-sm border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay">
          <SearchX size={16} className="mt-0.5 shrink-0" /> এই কোডে কোনো সনদ পাওয়া যায়নি — কোডটা আবার মিলিয়ে দেখুন। না মিললে অফিসে যোগাযোগ করুন।
        </p>
      )}
      {state === "error" && <p className="mt-6 text-sm text-clay">যাচাই করা যায়নি — একটু পরে আবার চেষ্টা করুন।</p>}
    </div>
  );
}
