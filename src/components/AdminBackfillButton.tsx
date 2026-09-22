"use client";

import { useState } from "react";
import { Wand2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import { withTimeout } from "@/lib/withTimeout";

type Result = {
  totalAdmissions: number;
  shortIdFixed: number;
  studentUidLinked: number;
  noMatch: number;
  alreadyOk: number;
};

// এটা একবার চালানোর জন্য একটা বাটন — এই ব্যাচের আগে জমা হওয়া
// পুরনো ভর্তি আবেদনগুলোর মধ্যে shortId ফাঁকা থাকলে সেটা বসিয়ে দেয়
// (তাতে /payment পেজে খোঁজা যাবে), আর মোবাইল নম্বর মিলিয়ে সম্ভব
// হলে পুরনো স্টুডেন্ট অ্যাকাউন্টের সাথেও যুক্ত করে দেয় (তাতে
// ড্যাশবোর্ডের "ভর্তি ফি" কার্ড ও "সবার বকেয়া" তালিকায় দেখা যাবে)।
// এটা একাধিকবার চাপলেও সমস্যা নেই — শুধু ফাঁকা থাকা জায়গাগুলোই
// পূরণ করে, আগে থেকে থাকা কিছু বদলায় না।
export default function AdminBackfillButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<Result | null>(null);

  async function handleRun() {
    setStatus("loading");
    try {
      const authInstance = getFirebaseAuth();
      const token = await authInstance.currentUser?.getIdToken();
      if (!token) throw new Error("unauthorized");

      const res = await withTimeout(
        fetch("/api/admin/backfill-admissions", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as Result;
      setResult(data);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-sm border border-gold/40 bg-gold-soft/30 p-4">
      <div className="flex items-start gap-2">
        <Wand2 size={16} className="mt-0.5 shrink-0 text-gold-deep" />
        <div className="flex-1">
          <p className="text-sm text-ink">
            এই ব্যাচের আগে জমা হওয়া পুরনো আবেদনগুলো নতুন সিস্টেমে (পেমেন্ট লুকআপ, ড্যাশবোর্ড
            কার্ড, সবার বকেয়া তালিকা) ঠিকভাবে দেখাতে একবার এই বাটনে চাপুন। বারবার চাপলেও
            ক্ষতি নেই।
          </p>
          <button
            type="button"
            onClick={handleRun}
            disabled={status === "loading"}
            className="mt-3 flex items-center gap-2 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
          >
            {status === "loading" && <Loader2 size={14} className="animate-spin" />}
            পুরনো আবেদন ঠিক করুন
          </button>

          {status === "error" && (
            <p className="mt-3 flex items-center gap-2 text-sm text-clay">
              <AlertCircle size={14} /> চালানো যায়নি — আবার চেষ্টা করুন।
            </p>
          )}

          {status === "done" && result && (
            <div className="mt-3 rounded-sm border border-teal/30 bg-teal-soft px-3 py-2 text-sm text-teal-deep">
              <p className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={14} /> শেষ হয়েছে
              </p>
              <ul className="mt-1.5 space-y-0.5 text-ink-soft">
                <li>মোট আবেদন: {result.totalAdmissions}</li>
                <li>shortId বসানো হলো: {result.shortIdFixed}</li>
                <li>অ্যাকাউন্টের সাথে নতুন যুক্ত হলো: {result.studentUidLinked}</li>
                <li>মিল পাওয়া যায়নি (ম্যানুয়ালি যুক্ত করতে হবে): {result.noMatch}</li>
                <li>আগে থেকেই ঠিক ছিল: {result.alreadyOk}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
