"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const classes = ["Class 8", "Class 9", "Class 10", "SSC", "Dakhil"];
const groups = ["Science", "Business Studies", "Humanities"];
const programs = [
  "Regular Academic Program",
  "Revision Batch",
  "Recovery Batch",
  "Final Preparation Batch",
  "SSC / Dakhil Program",
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

export default function AdmissionForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [applicationId, setApplicationId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const data = {
      studentName: form.get("studentName") as string,
      dob: form.get("dob") as string,
      fatherName: form.get("fatherName") as string,
      motherName: form.get("motherName") as string,
      mobile: form.get("mobile") as string,
      guardianMobile: form.get("guardianMobile") as string,
      address: form.get("address") as string,
      school: form.get("school") as string,
      className: form.get("className") as string,
      group: form.get("group") as string,
      previousResult: form.get("previousResult") as string,
      weakSubjects: form.get("weakSubjects") as string,
      program: form.get("program") as string,
      preferredBatchTime: form.get("preferredBatchTime") as string,
      status: "new",
      submittedAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(getFirebaseDb(), "admissions"), data);
      setApplicationId(docRef.id);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm border border-teal/30 bg-teal-soft p-8 text-center">
        <CheckCircle2 className="mx-auto text-teal-deep" size={32} />
        <h3 className="mt-4 font-display-bn text-xl text-ink">আবেদন সফলভাবে জমা হয়েছে</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          আপনার আবেদন আমাদের কাছে পৌঁছে গেছে। প্রয়োজনে যোগাযোগের জন্য নিচের আইডিটি
          রেখে দিন।
        </p>
        {applicationId && (
          <p className="mx-auto mt-3 w-fit rounded-sm bg-paper px-4 py-1.5 font-display-en text-sm text-ink">
            {applicationId.slice(0, 8).toUpperCase()}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {status === "error" && (
        <div className="flex items-start gap-2 rounded-sm border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>আবেদন জমা দেওয়া যায়নি — ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।</span>
        </div>
      )}

      <fieldset className="space-y-5">
        <legend className="font-label mb-1 text-xs uppercase tracking-[0.15em] text-gold-deep">
          শিক্ষার্থীর তথ্য
        </legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="শিক্ষার্থীর নাম">
            <input required name="studentName" type="text" className={inputClass} placeholder="পূর্ণ নাম লিখুন" />
          </Field>
          <Field label="জন্ম তারিখ">
            <input required name="dob" type="date" className={inputClass} />
          </Field>
          <Field label="বাবার নাম">
            <input required name="fatherName" type="text" className={inputClass} />
          </Field>
          <Field label="মায়ের নাম">
            <input required name="motherName" type="text" className={inputClass} />
          </Field>
          <Field label="মোবাইল নম্বর">
            <input required name="mobile" type="tel" className={inputClass} placeholder="01XXXXXXXXX" />
          </Field>
          <Field label="গার্ডিয়ানের নম্বর">
            <input required name="guardianMobile" type="tel" className={inputClass} placeholder="01XXXXXXXXX" />
          </Field>
        </div>
        <Field label="ঠিকানা">
          <textarea required name="address" rows={2} className={inputClass} />
        </Field>
      </fieldset>

      <fieldset className="space-y-5 border-t border-line pt-8">
        <legend className="font-label mb-1 text-xs uppercase tracking-[0.15em] text-gold-deep">
          একাডেমিক তথ্য
        </legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="স্কুল/মাদ্রাসা">
            <input required name="school" type="text" className={inputClass} />
          </Field>
          <Field label="ক্লাস">
            <select required name="className" className={inputClass} defaultValue="">
              <option value="" disabled>
                নির্বাচন করুন
              </option>
              {classes.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="গ্রুপ">
            <select name="group" className={inputClass} defaultValue="">
              <option value="" disabled>
                নির্বাচন করুন
              </option>
              {groups.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field label="পূর্ববর্তী ফলাফল (GPA/Class Position)">
            <input name="previousResult" type="text" className={inputClass} />
          </Field>
        </div>
        <Field label="দুর্বল বিষয় (যদি থাকে)">
          <input name="weakSubjects" type="text" className={inputClass} placeholder="যেমন: Math, Physics" />
        </Field>
      </fieldset>

      <fieldset className="space-y-5 border-t border-line pt-8">
        <legend className="font-label mb-1 text-xs uppercase tracking-[0.15em] text-gold-deep">
          প্রোগ্রাম নির্বাচন
        </legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="প্রোগ্রাম">
            <select required name="program" className={inputClass} defaultValue="">
              <option value="" disabled>
                নির্বাচন করুন
              </option>
              {programs.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="পছন্দের ব্যাচ সময়">
            <input name="preferredBatchTime" type="text" className={inputClass} placeholder="যেমন: সকাল / বিকাল / সন্ধ্যা" />
          </Field>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-sm bg-ink py-3.5 text-sm font-medium text-paper transition-colors hover:bg-gold-deep disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {status === "loading" && <Loader2 size={15} className="animate-spin" />}
        {status === "loading" ? "জমা হচ্ছে..." : "আবেদন জমা দিন"}
      </button>
    </form>
  );
}
