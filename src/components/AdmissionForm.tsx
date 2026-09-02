"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { CheckCircle2, AlertCircle, Loader2, Printer } from "lucide-react";
import { withTimeout } from "@/lib/withTimeout";

const classes = ["Class 8", "Class 9", "Class 10", "SSC", "Dakhil"];
const groups = ["Science", "Business Studies", "Humanities"];
const programs = [
  "Regular Academic Program",
  "Revision Batch",
  "Recovery Batch",
  "Final Preparation Batch",
  "SSC / Dakhil Program",
];

type AdmissionData = {
  studentName: string;
  dob: string;
  fatherName: string;
  motherName: string;
  mobile: string;
  guardianMobile: string;
  address: string;
  school: string;
  className: string;
  group: string;
  previousResult: string;
  weakSubjects: string;
  program: string;
  preferredBatchTime: string;
};

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

function todayBn() {
  return new Date().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

export default function AdmissionForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<AdmissionData | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const data: AdmissionData = {
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
    };

    try {
      const docRef = await withTimeout(
        addDoc(collection(getFirebaseDb(), "admissions"), {
          ...data,
          status: "new",
          submittedAt: serverTimestamp(),
        })
      );
      setApplicationId(docRef.id);
      setSubmitted(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success" && submitted) {
    const shortId = applicationId ? applicationId.slice(0, 8).toUpperCase() : "";
    return (
      <div>
        <div className="rounded-sm border border-teal/30 bg-teal-soft p-8 text-center print:hidden">
          <CheckCircle2 className="mx-auto text-teal-deep" size={32} />
          <h3 className="mt-4 font-display-bn text-xl text-ink">আবেদন সফলভাবে জমা হয়েছে</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
            নিচের রশিদটি প্রিন্ট করে বা ছবি তুলে রেখে দিন — ভর্তি নিশ্চিত করতে ও
            যোগাযোগের জন্য এই আইডি প্রয়োজন হবে।
          </p>
          <button
            type="button"
            onClick={() => window.print()}
            className="mx-auto mt-5 flex items-center gap-2 rounded-sm bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-gold-deep"
          >
            <Printer size={16} /> রশিদ প্রিন্ট করুন
          </button>
        </div>

        {/* এই অংশটা স্ক্রিনেও দেখা যাবে, প্রিন্ট করলেও শুধু এটাই ছাপা হবে */}
        <div className="mt-6 rounded-sm border border-line bg-paper p-8 print:mt-0 print:border-none print:p-0">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <p className="font-display-bn text-xl text-ink">উত্তোলন</p>
              <p className="text-xs text-ink-soft/60">Uttolon Learning System</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-soft/60">আবেদন আইডি</p>
              <p className="font-display-en text-sm text-ink">{shortId}</p>
            </div>
          </div>

          <h4 className="mt-5 font-display-bn text-lg text-ink">ভর্তি আবেদনের রশিদ</h4>
          <p className="text-xs text-ink-soft/60">জমার তারিখ: {todayBn()}</p>

          <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-soft/60">শিক্ষার্থীর নাম</dt>
              <dd className="text-ink">{submitted.studentName}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft/60">জন্ম তারিখ</dt>
              <dd className="text-ink">{submitted.dob}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft/60">বাবার নাম</dt>
              <dd className="text-ink">{submitted.fatherName}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft/60">মায়ের নাম</dt>
              <dd className="text-ink">{submitted.motherName}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft/60">মোবাইল নম্বর</dt>
              <dd className="text-ink">{submitted.mobile}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft/60">গার্ডিয়ানের নম্বর</dt>
              <dd className="text-ink">{submitted.guardianMobile}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-ink-soft/60">ঠিকানা</dt>
              <dd className="text-ink">{submitted.address}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft/60">স্কুল/মাদ্রাসা</dt>
              <dd className="text-ink">{submitted.school}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft/60">ক্লাস / গ্রুপ</dt>
              <dd className="text-ink">
                {submitted.className} {submitted.group ? `/ ${submitted.group}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft/60">প্রোগ্রাম</dt>
              <dd className="text-ink">{submitted.program}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft/60">পছন্দের ব্যাচ সময়</dt>
              <dd className="text-ink">{submitted.preferredBatchTime || "—"}</dd>
            </div>
          </dl>

          <div className="mt-8 border-t border-dashed border-line pt-4">
            <p className="text-xs leading-relaxed text-ink-soft/70">
              এই রশিদটি শুধু আবেদন জমার প্রমাণ — চূড়ান্ত ভর্তি নিশ্চিত হয়েছে কিনা তা
              জানতে আবেদন আইডি উল্লেখ করে সরাসরি যোগাযোগ করুন। উত্তোলন থেকেও প্রদত্ত
              নম্বরে যোগাযোগ করা হবে।
            </p>
          </div>
        </div>
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
