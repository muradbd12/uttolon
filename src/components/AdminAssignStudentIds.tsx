"use client";

import { useState } from "react";
import { IdCard, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import { withTimeout } from "@/lib/withTimeout";

type Result = { totalStudents: number; assigned: number; alreadyHad: number };

export default function AdminAssignStudentIds() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<Result | null>(null);

  async function run() {
    setStatus("loading");
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken();
      if (!token) throw new Error("unauthorized");
      const res = await withTimeout(
        fetch("/api/admin/assign-student-ids", { method: "POST", headers: { Authorization: `Bearer ${token}` } })
      );
      if (!res.ok) throw new Error("failed");
      setResult((await res.json()) as Result);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-sm border border-line bg-paper p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
          <IdCard size={18} />
        </span>
        <div className="flex-1">
          <h2 className="text-sm font-medium text-ink">পুরনো স্টুডেন্টদের Student ID দিন</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft/70">
            এখন থেকে নতুন স্টুডেন্ট অ্যাকাউন্ট তৈরি হলেই নিজে থেকে একটা Student ID (যেমন UTL-26-0001) পাবে।
            আগে তৈরি হওয়া স্টুডেন্টদের জন্য একবার এই বাটনে চাপুন। যাদের আগেই ID আছে তাদেরটা বদলাবে না,
            তাই বারবার চাপলেও ক্ষতি নেই।
          </p>
          <button
            type="button"
            onClick={run}
            disabled={status === "loading"}
            className="mt-3 flex items-center gap-2 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
          >
            {status === "loading" && <Loader2 size={14} className="animate-spin" />}
            ID দিন
          </button>
          {status === "error" && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-clay">
              <AlertCircle size={13} /> চালানো যায়নি — আবার চেষ্টা করুন।
            </p>
          )}
          {status === "done" && result && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-teal-deep">
              <CheckCircle2 size={13} /> মোট {result.totalStudents} জন স্টুডেন্টের মধ্যে {result.assigned} জনকে নতুন ID
              দেওয়া হলো, {result.alreadyHad} জনের আগেই ছিল।
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
