"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

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
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-sm border border-teal/30 bg-teal-soft p-8 text-center">
        <CheckCircle2 className="mx-auto text-teal-deep" size={32} />
        <h3 className="mt-4 font-display-bn text-xl text-ink">ফর্মটি প্রস্তুত করা হয়েছে</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          এই মুহূর্তে ওয়েবসাইটের ব্যাকএন্ড এখনো যুক্ত হয়নি, তাই এই তথ্য এখনো সংরক্ষিত
          হয়নি। ভর্তি নিশ্চিত করতে অনুগ্রহ করে সরাসরি{" "}
          <span className="font-medium text-ink">যোগাযোগ পেজ</span> থেকে আমাদের সাথে
          যোগাযোগ করুন।
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 rounded-sm border border-ink px-5 py-2.5 text-sm font-medium text-ink hover:bg-paper"
        >
          ফর্মে ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-10"
    >
      <fieldset className="space-y-5">
        <legend className="font-label mb-1 text-xs uppercase tracking-[0.15em] text-gold-deep">
          শিক্ষার্থীর তথ্য
        </legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="শিক্ষার্থীর নাম">
            <input required type="text" className={inputClass} placeholder="পূর্ণ নাম লিখুন" />
          </Field>
          <Field label="জন্ম তারিখ">
            <input required type="date" className={inputClass} />
          </Field>
          <Field label="বাবার নাম">
            <input required type="text" className={inputClass} />
          </Field>
          <Field label="মায়ের নাম">
            <input required type="text" className={inputClass} />
          </Field>
          <Field label="মোবাইল নম্বর">
            <input required type="tel" className={inputClass} placeholder="01XXXXXXXXX" />
          </Field>
          <Field label="গার্ডিয়ানের নম্বর">
            <input type="tel" className={inputClass} placeholder="01XXXXXXXXX" />
          </Field>
        </div>
        <Field label="ঠিকানা">
          <textarea required rows={2} className={inputClass} />
        </Field>
      </fieldset>

      <fieldset className="space-y-5 border-t border-line pt-8">
        <legend className="font-label mb-1 text-xs uppercase tracking-[0.15em] text-gold-deep">
          একাডেমিক তথ্য
        </legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="স্কুল/মাদ্রাসা">
            <input required type="text" className={inputClass} />
          </Field>
          <Field label="ক্লাস">
            <select required className={inputClass} defaultValue="">
              <option value="" disabled>
                নির্বাচন করুন
              </option>
              {classes.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="গ্রুপ">
            <select className={inputClass} defaultValue="">
              <option value="" disabled>
                নির্বাচন করুন
              </option>
              {groups.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field label="পূর্ববর্তী ফলাফল (GPA/Class Position)">
            <input type="text" className={inputClass} />
          </Field>
        </div>
        <Field label="দুর্বল বিষয় (যদি থাকে)">
          <input type="text" className={inputClass} placeholder="যেমন: Math, Physics" />
        </Field>
      </fieldset>

      <fieldset className="space-y-5 border-t border-line pt-8">
        <legend className="font-label mb-1 text-xs uppercase tracking-[0.15em] text-gold-deep">
          প্রোগ্রাম নির্বাচন
        </legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="প্রোগ্রাম">
            <select required className={inputClass} defaultValue="">
              <option value="" disabled>
                নির্বাচন করুন
              </option>
              {programs.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="পছন্দের ব্যাচ সময়">
            <input type="text" className={inputClass} placeholder="যেমন: সকাল / বিকাল / সন্ধ্যা" />
          </Field>
        </div>
      </fieldset>

      <button
        type="submit"
        className="w-full rounded-sm bg-ink py-3.5 text-sm font-medium text-paper transition-colors hover:bg-gold-deep sm:w-auto sm:px-10"
      >
        আবেদন জমা দিন
      </button>
    </form>
  );
}
