"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export default function ScholarshipForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    try {
      await addDoc(collection(getFirebaseDb(), "scholarshipApplications"), {
        studentName: form.get("studentName"),
        className: form.get("className"),
        mobile: form.get("mobile"),
        guardianMobile: form.get("guardianMobile"),
        academicPerformance: form.get("academicPerformance"),
        familyCircumstances: form.get("familyCircumstances"),
        reason: form.get("reason"),
        status: "pending",
        submittedAt: serverTimestamp(),
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm border border-teal/30 bg-teal-soft p-8 text-center">
        <CheckCircle2 className="mx-auto text-teal-deep" size={32} />
        <h3 className="mt-4 font-display-bn text-xl text-ink">আবেদন জমা হয়েছে</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          আপনার বৃত্তির আবেদন যাচাইয়ের জন্য জমা হয়েছে। প্রয়োজনে আমরা আপনার দেওয়া
          নম্বরে যোগাযোগ করব।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === "error" && (
        <div className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
          <AlertCircle size={14} /> আবেদন জমা দেওয়া যায়নি — আবার চেষ্টা করুন।
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="শিক্ষার্থীর নাম">
          <input required name="studentName" type="text" className={inputClass} />
        </Field>
        <Field label="ক্লাস">
          <input required name="className" type="text" className={inputClass} />
        </Field>
        <Field label="মোবাইল নম্বর">
          <input required name="mobile" type="tel" placeholder="01XXXXXXXXX" className={inputClass} />
        </Field>
        <Field label="গার্ডিয়ানের মোবাইল নম্বর">
          <input required name="guardianMobile" type="tel" placeholder="01XXXXXXXXX" className={inputClass} />
        </Field>
      </div>

      <Field label="একাডেমিক ফলাফল (GPA/Class Position)">
        <input required name="academicPerformance" type="text" className={inputClass} />
      </Field>

      <Field label="পারিবারিক অবস্থা">
        <textarea required name="familyCircumstances" rows={3} className={inputClass} />
      </Field>

      <Field label="বৃত্তির আবেদনের কারণ">
        <textarea required name="reason" rows={3} className={inputClass} />
      </Field>

      <p className="text-xs text-ink-soft/60">
        সহায়ক কাগজপত্র (প্রয়োজনে) পরে সরাসরি যোগাযোগের মাধ্যমে চাওয়া হবে।
      </p>

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex items-center gap-2 rounded-sm bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
      >
        {status === "loading" && <Loader2 size={15} className="animate-spin" />}
        আবেদন জমা দিন
      </button>
    </form>
  );
}
