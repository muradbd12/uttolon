"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { CheckCircle2, AlertCircle, Loader2, Printer, Check } from "lucide-react";
import { withTimeout } from "@/lib/withTimeout";
import AdmissionReceiptCard from "@/components/AdmissionReceiptCard";
import { printIsolated } from "@/lib/printReceipt";

const classes = [
  "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8",
  "Class 9", "Class 10", "SSC", "Dakhil", "University Admission",
];

const groups = ["General / প্রযোজ্য নয়", "Science", "Business Studies", "Humanities"];

const genders = ["ছেলে", "মেয়ে", "অন্যান্য"];
const religions = ["ইসলাম", "হিন্দু", "খ্রিস্টান", "বৌদ্ধ", "অন্যান্য"];
const nationalities = ["বাংলাদেশী", "অন্যান্য"];

const districts = [
  "বাগেরহাট", "বান্দরবান", "বরগুনা", "বরিশাল", "ভোলা", "বগুড়া", "ব্রাহ্মণবাড়িয়া",
  "চাঁদপুর", "চাঁপাইনবাবগঞ্জ", "চট্টগ্রাম", "চুয়াডাঙ্গা", "কুমিল্লা", "কক্সবাজার",
  "ঢাকা", "দিনাজপুর", "ফরিদপুর", "ফেনী", "গাইবান্ধা", "গাজীপুর", "গোপালগঞ্জ",
  "হবিগঞ্জ", "জামালপুর", "যশোর", "ঝালকাঠি", "ঝিনাইদহ", "জয়পুরহাট", "খাগড়াছড়ি",
  "খুলনা", "কিশোরগঞ্জ", "কুড়িগ্রাম", "কুষ্টিয়া", "লক্ষ্মীপুর", "লালমনিরহাট",
  "মাদারীপুর", "মাগুরা", "মানিকগঞ্জ", "মেহেরপুর", "মৌলভীবাজার", "মুন্সিগঞ্জ",
  "ময়মনসিংহ", "নওগাঁ", "নড়াইল", "নারায়ণগঞ্জ", "নরসিংদী", "নাটোর", "নেত্রকোণা",
  "নীলফামারী", "নোয়াখালী", "পাবনা", "পঞ্চগড়", "পটুয়াখালী", "পিরোজপুর",
  "রাজবাড়ী", "রাজশাহী", "রাঙ্গামাটি", "রংপুর", "সাতক্ষীরা", "শরীয়তপুর",
  "শেরপুর", "সিরাজগঞ্জ", "সুনামগঞ্জ", "সিলেট", "টাঙ্গাইল", "ঠাকুরগাঁও",
];

const examNames = ["জেএসসি (JSC)", "জেডিসি (JDC)", "এসএসসি (SSC)", "দাখিল (Dakhil)", "এইচএসসি (HSC)", "আলিম (Alim)", "প্রযোজ্য নয়", "অন্যান্য"];

const programs = [
  "Regular Academic Program", "Revision Batch", "Recovery Batch",
  "Final Preparation Batch", "SSC / Dakhil Program", "University Admission Program",
];

const batchOptions = ["সকাল ব্যাচ", "দুপুর ব্যাচ", "বিকাল ব্যাচ", "সন্ধ্যা ব্যাচ", "উইকেন্ড ব্যাচ"];
const preferredSubjects = ["সকল বিষয়", "গণিত", "পদার্থবিজ্ঞান", "রসায়ন", "জীববিজ্ঞান", "ইংরেজি", "বাংলা", "আইসিটি", "হিসাববিজ্ঞান", "অন্যান্য"];
const classSchedules = ["সকাল", "বিকাল", "সন্ধ্যা", "যেকোনো সময়"];
const referralOptions = ["বন্ধু/আত্মীয়", "শিক্ষক/গাইড", "ফেসবুক/সোশ্যাল মিডিয়া", "পোস্টার/ব্যানার", "ওয়েবসাইট", "অন্যান্য"];

const requiredDocs = [
  "সম্প্রতি তোলা ১ কপি পাসপোর্ট সাইজ ছবি",
  "পূর্ববর্তী পরীক্ষার রেজাল্ট শীট / মার্কশিট (যদি থাকে)",
  "জন্ম সনদ / জাতীয় পরিচয়পত্র (যদি থাকে)",
  "অভিভাবকের NID কপি (যদি প্রয়োজন হয়)",
];

type AdmissionData = {
  studentNameBn: string;
  studentNameEn: string;
  dob: string;
  gender: string;
  className: string;
  group: string;
  rollNumber: string;
  studentIdNumber: string;
  religion: string;
  nationality: string;
  mobile: string;
  email: string;

  fatherName: string;
  motherName: string;
  guardianName: string;
  guardianMobile: string;
  guardianOccupation: string;
  monthlyIncome: string;

  address: string;
  thana: string;
  district: string;
  postCode: string;

  previousInstitution: string;
  examName: string;
  passingYear: string;
  previousResult: string;
  weakSubjects: string;
  specialComments: string;

  program: string;
  batch: string;
  preferredSubject: string;
  classSchedule: string;

  referralSource: string;
  referralOther: string;
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">
        {label} {required && <span className="text-clay">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-1 flex items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-deep text-xs font-bold text-paper">
        {number}
      </span>
      <h3 className="font-display-bn text-base text-ink">{title}</h3>
    </div>
  );
}

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

function todayBn() {
  return new Date().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

export default function AdmissionForm() {
  const [status, setStatus] = useState<"idle" | "review" | "loading" | "success" | "error">("idle");
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<AdmissionData | null>(null);
  const [pendingData, setPendingData] = useState<AdmissionData | null>(null);

  function handleReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (name: string) => (form.get(name) as string) || "";

    const data: AdmissionData = {
      studentNameBn: get("studentNameBn"),
      studentNameEn: get("studentNameEn"),
      dob: get("dob"),
      gender: get("gender"),
      className: get("className"),
      group: get("group"),
      rollNumber: get("rollNumber"),
      studentIdNumber: get("studentIdNumber"),
      religion: get("religion"),
      nationality: get("nationality"),
      mobile: get("mobile"),
      email: get("email"),

      fatherName: get("fatherName"),
      motherName: get("motherName"),
      guardianName: get("guardianName"),
      guardianMobile: get("guardianMobile"),
      guardianOccupation: get("guardianOccupation"),
      monthlyIncome: get("monthlyIncome"),

      address: get("address"),
      thana: get("thana"),
      district: get("district"),
      postCode: get("postCode"),

      previousInstitution: get("previousInstitution"),
      examName: get("examName"),
      passingYear: get("passingYear"),
      previousResult: get("previousResult"),
      weakSubjects: get("weakSubjects"),
      specialComments: get("specialComments"),

      program: get("program"),
      batch: get("batch"),
      preferredSubject: get("preferredSubject"),
      classSchedule: get("classSchedule"),

      referralSource: get("referralSource"),
      referralOther: get("referralOther"),
    };

    setPendingData(data);
    setStatus("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBackToEdit() {
    setStatus("idle");
  }

  async function handleConfirmSubmit() {
    if (!pendingData) return;
    setStatus("loading");
    try {
      const docRef = await withTimeout(
        addDoc(collection(getFirebaseDb(), "admissions"), {
          ...pendingData,
          status: "new",
          submittedAt: serverTimestamp(),
        })
      );
      setApplicationId(docRef.id);
      setSubmitted(pendingData);
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
            নিচের রশিদটি প্রিন্ট করে বা ছবি তুলে সাথে রাখুন — ভর্তি নিশ্চিত করতে ও
            অফিসে যোগাযোগের জন্য এই আইডি প্রয়োজন হবে।
          </p>
          <button
            type="button"
            onClick={() => printIsolated("printable-receipt")}
            className="mx-auto mt-5 flex items-center gap-2 rounded-sm bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-gold-deep"
          >
            <Printer size={16} /> রশিদ প্রিন্ট করুন
          </button>
        </div>

        <AdmissionReceiptCard data={submitted} applicationId={shortId} dateLabel={todayBn()} />
      </div>
    );
  }

  return (
    <form onSubmit={handleReview} className="space-y-10">
      <div className={status === "idle" ? "space-y-10" : "hidden"}>
      <fieldset className="space-y-5">
        <SectionHeader number="০১" title="শিক্ষার্থীর তথ্য" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="শিক্ষার্থীর পূর্ণ নাম" required>
            <input required name="studentNameBn" type="text" className={inputClass} placeholder="এখানে লিখুন" />
          </Field>
          <Field label="নাম (ইংরেজিতে)" required>
            <input required name="studentNameEn" type="text" className={inputClass} placeholder="Enter full name" />
          </Field>
          <Field label="জন্ম তারিখ" required>
            <input required name="dob" type="date" className={inputClass} />
          </Field>
          <Field label="লিঙ্গ" required>
            <select required name="gender" className={inputClass} defaultValue="">
              <option value="" disabled>নির্বাচন করুন</option>
              {genders.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="বর্তমান শ্রেণি" required>
            <select required name="className" className={inputClass} defaultValue="">
              <option value="" disabled>নির্বাচন করুন</option>
              {classes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="গ্রুপ / বিভাগ">
            <select name="group" className={inputClass} defaultValue="">
              <option value="" disabled>নির্বাচন করুন</option>
              {groups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="রোল নম্বর (যদি থাকে)">
            <input name="rollNumber" type="text" className={inputClass} placeholder="রোল নম্বর লিখুন" />
          </Field>
          <Field label="ছাত্র/ছাত্রী আইডি (যদি থাকে)">
            <input name="studentIdNumber" type="text" className={inputClass} placeholder="আইডি লিখুন" />
          </Field>
          <Field label="ধর্ম" required>
            <select required name="religion" className={inputClass} defaultValue="">
              <option value="" disabled>নির্বাচন করুন</option>
              {religions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="জাতীয়তা" required>
            <select required name="nationality" className={inputClass} defaultValue="বাংলাদেশী">
              {nationalities.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="মোবাইল নম্বর" required>
            <input required name="mobile" type="tel" className={inputClass} placeholder="01XXXXXXXXX" />
          </Field>
          <Field label="ইমেইল (যদি থাকে)">
            <input name="email" type="email" className={inputClass} placeholder="example@email.com" />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5 border-t border-line pt-8">
        <SectionHeader number="০২" title="পিতা-মাতার / অভিভাবকের তথ্য" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="পিতার নাম" required>
            <input required name="fatherName" type="text" className={inputClass} />
          </Field>
          <Field label="মাতার নাম" required>
            <input required name="motherName" type="text" className={inputClass} />
          </Field>
          <Field label="অভিভাবকের নাম" required>
            <input required name="guardianName" type="text" className={inputClass} />
          </Field>
          <Field label="অভিভাবকের মোবাইল" required>
            <input required name="guardianMobile" type="tel" className={inputClass} placeholder="01XXXXXXXXX" />
          </Field>
          <Field label="অভিভাবকের পেশা">
            <input name="guardianOccupation" type="text" className={inputClass} />
          </Field>
          <Field label="মাসিক আয় (প্রায়)">
            <input name="monthlyIncome" type="text" className={inputClass} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5 border-t border-line pt-8">
        <SectionHeader number="০৩" title="যোগাযোগের তথ্য" />
        <Field label="বর্তমান ঠিকানা" required>
          <textarea required name="address" rows={2} className={inputClass} placeholder="সম্পূর্ণ ঠিকানা লিখুন" />
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="থানা / উপজেলা" required>
            <input required name="thana" type="text" className={inputClass} />
          </Field>
          <Field label="জেলা" required>
            <select required name="district" className={inputClass} defaultValue="">
              <option value="" disabled>নির্বাচন করুন</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="পোস্ট কোড (যদি থাকে)">
            <input name="postCode" type="text" className={inputClass} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5 border-t border-line pt-8">
        <SectionHeader number="০৪" title="একাডেমিক তথ্য" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="পূর্ববর্তী প্রতিষ্ঠান" required>
            <input required name="previousInstitution" type="text" className={inputClass} />
          </Field>
          <Field label="পরীক্ষার নাম">
            <select name="examName" className={inputClass} defaultValue="">
              <option value="" disabled>নির্বাচন করুন</option>
              {examNames.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </Field>
          <Field label="পাশের সাল">
            <input name="passingYear" type="text" className={inputClass} placeholder="yyyy" />
          </Field>
          <Field label="প্রাপ্ত জিপিএ / ফলাফল">
            <input name="previousResult" type="text" className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="দুর্বল বিষয় (যদি থাকে)">
            <input name="weakSubjects" type="text" className={inputClass} placeholder="যেমন: গণিত, পদার্থ, ইংরেজি" />
          </Field>
          <Field label="বিশেষ মন্তব্য (যদি থাকে)">
            <input name="specialComments" type="text" className={inputClass} />
          </Field>
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-8 border-t border-line pt-8 sm:grid-cols-2">
        <fieldset className="space-y-5">
          <SectionHeader number="০৫" title="প্রোগ্রাম ও ব্যাচ নির্বাচন" />
          <Field label="প্রোগ্রাম" required>
            <select required name="program" className={inputClass} defaultValue="">
              <option value="" disabled>নির্বাচন করুন</option>
              {programs.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="ব্যাচ" required>
            <select required name="batch" className={inputClass} defaultValue="">
              <option value="" disabled>নির্বাচন করুন</option>
              {batchOptions.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="পছন্দের বিষয়">
            <select name="preferredSubject" className={inputClass} defaultValue="">
              <option value="" disabled>নির্বাচন করুন</option>
              {preferredSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="ক্লাস শিডিউল (পছন্দে)">
            <select name="classSchedule" className={inputClass} defaultValue="">
              <option value="" disabled>নির্বাচন করুন</option>
              {classSchedules.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </fieldset>

        <fieldset className="space-y-3">
          <SectionHeader number="০৬" title="কিভাবে আমাদের সম্পর্কে জানলেন?" />
          <div className="space-y-2 text-sm text-ink">
            {referralOptions.map((r) => (
              <label key={r} className="flex items-center gap-2">
                <input required name="referralSource" type="radio" value={r} className="accent-ink" /> {r}
              </label>
            ))}
          </div>
          <input name="referralOther" type="text" className={inputClass} placeholder="অন্যান্য হলে লিখুন" />
        </fieldset>
      </div>

      <div className="grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-2">
        <div>
          <h4 className="font-display-bn text-base text-ink">প্রয়োজনীয় ডকুমেন্ট</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            {requiredDocs.map((d) => (
              <li key={d} className="flex items-start gap-2">
                <Check size={15} className="mt-0.5 shrink-0 text-teal-deep" /> {d}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display-bn text-base text-ink">শর্তাবলী</h4>
          <label className="mt-3 flex items-start gap-2 text-sm text-ink-soft">
            <input required name="termsAccepted" type="checkbox" className="mt-1" />
            <span>
              আমি ঘোষণা করছি যে উপরোক্ত তথ্যগুলো সঠিক। ভুল তথ্য প্রদান করলে আমার
              ভর্তি বাতিল হতে পারে।
            </span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-sm bg-ink py-3.5 text-sm font-medium text-paper transition-colors hover:bg-gold-deep sm:w-auto sm:px-10"
      >
        পর্যালোচনা করুন
      </button>
      </div>

      {status !== "idle" && pendingData && (
        <div>
          {status === "error" && (
            <div className="mb-4 flex items-start gap-2 rounded-sm border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>আবেদন জমা দেওয়া যায়নি — ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।</span>
            </div>
          )}
          <div className="rounded-sm border border-gold/40 bg-gold-soft/30 px-4 py-3 text-sm text-ink-soft">
            নিচে আপনার দেওয়া তথ্য যাচাই করুন। ভুল থাকলে <strong className="text-ink">&quot;সম্পাদনা করুন&quot;</strong> চেপে ঠিক করুন —
            একবার নিশ্চিত করে জমা দিলে আপনি নিজে আর পরিবর্তন করতে পারবেন না।
          </div>
          <div className="mt-4">
            <AdmissionReceiptCard data={pendingData} dateLabel={todayBn()} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleBackToEdit}
              disabled={status === "loading"}
              className="rounded-sm border border-line px-6 py-3 text-sm font-medium text-ink-soft hover:border-ink hover:text-ink disabled:opacity-50"
            >
              সম্পাদনা করুন
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 rounded-sm bg-ink px-8 py-3 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
            >
              {status === "loading" && <Loader2 size={15} className="animate-spin" />}
              {status === "loading" ? "জমা হচ্ছে..." : "নিশ্চিত করে জমা দিন"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
