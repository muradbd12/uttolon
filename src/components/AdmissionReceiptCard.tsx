"use client";

import React, { useRef, useEffect } from "react";

export type ReceiptData = {
  studentNameBn?: string;
  studentNameEn?: string;
  dob?: string;
  gender?: string;
  className?: string;
  admissionClass?: string;
  group?: string;
  rollNumber?: string;
  studentIdNumber?: string;
  studentId?: string;
  religion?: string;
  nationality?: string;
  mobile?: string;
  studentMobile?: string;
  email?: string;
  studentEmail?: string;

  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  guardianMobile?: string;
  guardianOccupation?: string;
  guardianProfession?: string;
  monthlyIncome?: string;

  address?: string;
  thana?: string;
  district?: string;
  postCode?: string;

  previousInstitution?: string;
  previousInstitute?: string;
  examName?: string;
  passingYear?: string;
  previousResult?: string;
  previousGpa?: string;
  weakSubjects?: string;
  specialComments?: string;

  program?: string;
  batch?: string;
  preferredSubject?: string;
  preferredSubjects?: string;
  classSchedule?: string;
  schedule?: string;

  referralSource?: string;
  referral?: string;
  referralOther?: string;
};

interface AdmissionReceiptCardProps {
  data: ReceiptData;
  applicationId?: string;
  dateLabel?: string;
  onClose?: () => void;
}

function Item({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-[2.5px] text-[9.5px]">
      <span className="text-gray-500">{label}:</span>
      <span className="font-semibold text-gray-900 text-right truncate max-w-[150px]">
        {value && value.trim() !== "" ? value : "—"}
      </span>
    </div>
  );
}

function SectionBar({ title, color = "bg-emerald-800" }: { title: string; color?: string }) {
  return (
    <div className={`mt-1 rounded px-2 py-[2.5px] text-[9px] font-bold text-white ${color}`}>
      {title}
    </div>
  );
}

export default function AdmissionReceiptCard({
  data,
  applicationId = "OWPL2MYX",
  dateLabel = "৩ সেপ্টেম্বর, ২০২৬",
  onClose,
}: AdmissionReceiptCardProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  // প্রিন্টের সময় ব্যাকগ্রাউন্ডের সব কনটেন্ট আলাদা করার লজিক
  const preparePrint = () => {
    if (typeof document === "undefined") return;
    if (document.getElementById("print-isolated-root")) return;

    const receiptEl = document.getElementById("printable-receipt");
    if (!receiptEl) return;

    const printArea = document.createElement("div");
    printArea.id = "print-isolated-root";
    const clone = receiptEl.cloneNode(true) as HTMLElement;

    // ক্লোন থেকে বাড়তি বাটন দূর করা
    const noPrints = clone.querySelectorAll(".no-print");
    noPrints.forEach((el) => el.remove());

    printArea.appendChild(clone);
    document.body.appendChild(printArea);
    document.body.classList.add("printing-receipt-mode");
  };

  const cleanupPrint = () => {
    if (typeof document === "undefined") return;
    document.body.classList.remove("printing-receipt-mode");
    const el = document.getElementById("print-isolated-root");
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  };

  useEffect(() => {
    window.addEventListener("beforeprint", preparePrint);
    window.addEventListener("afterprint", cleanupPrint);
    window.addEventListener("focus", cleanupPrint);

    return () => {
      window.removeEventListener("beforeprint", preparePrint);
      window.removeEventListener("afterprint", cleanupPrint);
      window.removeEventListener("focus", cleanupPrint);
      cleanupPrint();
    };
  }, []);

  const handlePrint = async () => {
    if (typeof window !== "undefined" && "fonts" in document) {
      await document.fonts.ready;
    }
    preparePrint();
    window.print();
  };

  const studentNameBn = data?.studentNameBn || "";
  const studentNameEn = data?.studentNameEn || "";
  const studentIdVal = data?.studentIdNumber || data?.studentId || "১০৪৪৪২";
  const mobileVal = data?.mobile || data?.studentMobile || "—";
  const classVal = `${data?.className || data?.admissionClass || ""}${
    data?.group ? " / " + data?.group : ""
  }`;
  const guardianMobileVal = data?.guardianMobile || "—";
  const programVal = data?.program || "—";
  const batchVal = data?.batch || "—";

  return (
    <div className="relative w-full">
      {/* অ্যাকশন বাটন বার */}
      <div className="no-print mb-2 flex items-center justify-end gap-2 print:hidden">
        <button
          onClick={handlePrint}
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-800 active:scale-95 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          প্রিন্ট / PDF ডাউনলোড
        </button>
        {onClose && (
          <button
            onClick={onClose}
            type="button"
            className="inline-flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-gray-800 active:scale-95 transition"
          >
            ✕ বন্ধ করুন
          </button>
        )}
      </div>

      {/* মূল রসিদ কন্টেইনার */}
      <div
        id="printable-receipt"
        ref={receiptRef}
        className="mx-auto w-full max-w-[210mm] bg-white p-3.5 text-gray-900 border border-gray-200 rounded-lg shadow-sm text-[10px] leading-tight"
      >
        {/* ===== ১. অফিস কপি (OFFICE COPY) ===== */}
        <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-emerald-700 text-sm font-black text-white shadow-sm">
              উ
            </div>
            <div>
              <p className="text-sm font-black leading-none text-emerald-900">উত্তোলন</p>
              <p className="text-[8.5px] font-semibold text-gray-500">Uttolon Learning System</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[8.5px] font-bold text-amber-900 uppercase">
              অফিস কপি (OFFICE COPY)
            </span>
            <p className="mt-0.5 text-[9px] text-gray-600">
              আইডি: <strong className="text-gray-900">{applicationId}</strong> · জমা: {dateLabel}
            </p>
          </div>
        </div>

        {/* শিক্ষার্থীর তথ্য */}
        <SectionBar title="১. শিক্ষার্থীর তথ্য" color="bg-emerald-800" />
        <div className="grid grid-cols-2 gap-x-4 border border-t-0 border-gray-200 p-1.5 bg-gray-50/40">
          <div>
            <Item label="নাম (বাংলায়)" value={studentNameBn} />
            <Item label="জন্ম তারিখ" value={data?.dob} />
            <Item label="শ্রেণি / গ্রুপ" value={classVal} />
            <Item label="ছাত্র/ছাত্রী আইডি" value={studentIdVal} />
            <Item label="মোবাইল" value={mobileVal} />
          </div>
          <div>
            <Item label="নাম (ইংরেজি)" value={studentNameEn} />
            <Item label="লিঙ্গ" value={data?.gender} />
            <Item label="রোল নম্বর" value={data?.rollNumber} />
            <Item
              label="ধর্ম / জাতীয়তা"
              value={`${data?.religion || "—"} / ${data?.nationality || "—"}`}
            />
            <Item label="ইমেইল" value={data?.email || data?.studentEmail} />
          </div>
        </div>

        {/* অভিভাবক ও যোগাযোগের তথ্য */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <SectionBar title="২. পিতা-মাতা / অভিভাবকের তথ্য" color="bg-orange-600" />
            <div className="border border-t-0 border-gray-200 p-1.5 bg-gray-50/40">
              <Item label="পিতার নাম" value={data?.fatherName} />
              <Item label="মাতার নাম" value={data?.motherName} />
              <Item label="অভিভাবকের নাম" value={data?.guardianName} />
              <Item label="অভিভাবকের মোবাইল" value={guardianMobileVal} />
              <Item
                label="অভিভাবকের পেশা"
                value={data?.guardianOccupation || data?.guardianProfession}
              />
              <Item
                label="মাসিক আয় (প্রায়)"
                value={data?.monthlyIncome ? `${data.monthlyIncome} ৳` : "—"}
              />
            </div>
          </div>
          <div>
            <SectionBar title="৩. যোগাযোগের তথ্য" color="bg-emerald-800" />
            <div className="border border-t-0 border-gray-200 p-1.5 bg-gray-50/40">
              <Item label="ঠিকানা" value={data?.address} />
              <Item label="থানা/উপজেলা" value={data?.thana} />
              <Item label="জেলা" value={data?.district} />
              <Item label="পোস্ট কোড" value={data?.postCode} />
            </div>
          </div>
        </div>

        {/* একাডেমিক ও প্রোগ্রাম তথ্য */}
        <SectionBar title="৪. একাডেমিক ও প্রোগ্রাম তথ্য" color="bg-emerald-800" />
        <div className="grid grid-cols-2 gap-x-4 border border-t-0 border-gray-200 p-1.5 bg-gray-50/40">
          <div>
            <Item
              label="পূর্ববর্তী প্রতিষ্ঠান"
              value={data?.previousInstitution || data?.previousInstitute}
            />
            <Item
              label="পরীক্ষা / পাশের সাল"
              value={`${data?.examName || "—"} / ${data?.passingYear || "—"}`}
            />
            <Item
              label="প্রাপ্ত ফলাফল (GPA)"
              value={data?.previousResult || data?.previousGpa}
            />
            <Item label="দুর্বল বিষয়" value={data?.weakSubjects} />
          </div>
          <div>
            <Item label="প্রোগ্রাম" value={programVal} />
            <Item label="ব্যাচ" value={batchVal} />
            <Item
              label="পছন্দের বিষয়"
              value={data?.preferredSubject || data?.preferredSubjects}
            />
            <Item
              label="ক্লাস শিডিউল"
              value={data?.classSchedule || data?.schedule}
            />
            <Item
              label="কিভাবে জানলেন"
              value={
                data?.referralSource === "অন্যান্য"
                  ? data?.referralOther
                  : data?.referralSource || data?.referral
              }
            />
          </div>
        </div>

        {/* অঙ্গীকারনামা */}
        <div className="mt-1 rounded border border-amber-200 bg-amber-50/50 p-1 text-[8.5px] text-gray-700 flex justify-between items-center">
          <p className="max-w-[70%] leading-snug">
            <strong>অঙ্গীকারনামা:</strong> বর্ণিত সকল তথ্য সঠিক ও নির্ভুল। কোর্স চলাকালীন সময়ে কর্তৃপক্ষের যাবতীয় নিয়ম-শৃঙ্খলা মানিয়া চলিব এবং নির্ধারিত ফি পরিশোধে বাধ্য থাকিব।
          </p>
          <div className="text-center pt-2">
            <span className="border-t border-gray-400 px-4 pt-0.5 text-[8px] font-medium text-gray-700 block">
              ছাত্র/ছাত্রী বা অভিভাবকের স্বাক্ষর
            </span>
          </div>
        </div>

        {/* অফিসিয়াল ব্যবহারের জন্য */}
        <div className="mt-1 border border-gray-300 rounded p-1.5 bg-gray-50/60">
          <div className="bg-gray-800 text-white text-center font-bold text-[8.5px] py-0.5 rounded-sm">
            অফিসিয়াল ব্যবহারের জন্য (OFFICIAL USE ONLY)
          </div>
          <div className="grid grid-cols-4 gap-2 text-[8.5px] py-1 border-b border-gray-200">
            <div>Batch: ....................</div>
            <div>Roll/ID: ................</div>
            <div>Shift: ....................</div>
            <div>ভর্তির তারিখ: ............</div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[8.5px] py-1 border-b border-gray-200">
            <span className="font-semibold text-gray-700">Course:</span>
            <label className="flex items-center gap-1"><input type="checkbox" className="w-2.5 h-2.5" /> Science</label>
            <label className="flex items-center gap-1"><input type="checkbox" className="w-2.5 h-2.5" /> Commerce</label>
            <label className="flex items-center gap-1"><input type="checkbox" className="w-2.5 h-2.5" /> Combined</label>
            <label className="flex items-center gap-1"><input type="checkbox" className="w-2.5 h-2.5" /> Only Exam</label>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[8.5px] py-1 border-b border-gray-200">
            <div>Total Fee: ....................</div>
            <div>Concession: ................</div>
            <div>Reference: ....................</div>
          </div>

          {/* পেমেন্ট টেবিল */}
          <table className="w-full border-collapse border border-gray-300 bg-white text-center text-[7.5px] mt-1">
            <thead>
              <tr className="bg-emerald-800 text-white">
                <th className="border border-gray-300 p-0.5">Date</th>
                <th className="border border-gray-300 p-0.5">Payment</th>
                <th className="border border-gray-300 p-0.5">Due</th>
                <th className="border border-gray-300 p-0.5">Receiver&apos;s Sign</th>
                <th className="border border-gray-300 p-0.5">Next Payment Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-1">&nbsp;</td>
                <td className="border border-gray-300 p-1"></td>
                <td className="border border-gray-300 p-1"></td>
                <td className="border border-gray-300 p-1"></td>
                <td className="border border-gray-300 p-1"></td>
              </tr>
            </tbody>
          </table>

          <div className="flex items-center justify-between text-[8px] pt-1.5">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-0.5"><input type="checkbox" className="w-2.5 h-2.5" /> ID Card</label>
              <label className="flex items-center gap-0.5"><input type="checkbox" className="w-2.5 h-2.5" /> Admit Card</label>
              <label className="flex items-center gap-0.5"><input type="checkbox" className="w-2.5 h-2.5" /> Suggestion</label>
              <label className="flex items-center gap-0.5"><input type="checkbox" className="w-2.5 h-2.5" /> Gift</label>
            </div>
            <div className="flex items-center gap-6 text-[8px]">
              <span className="border-t border-gray-400 px-2">Co-ordinator</span>
              <span className="border-t border-gray-400 px-2">Executive Director</span>
            </div>
          </div>
        </div>

        {/* ফুটার */}
        <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-1 text-[8px] text-gray-500">
          <span>কাতারী টাওয়ার, কলেজ রোড, আমিশাপাড়া, সোনাইমুড়ী, নোয়াখালী</span>
          <span className="font-semibold text-emerald-800">www.uttolonbd.com</span>
          <span>info@uttolonbd.com</span>
        </div>

        {/* ===== কাটার লাইন ===== */}
        <div className="my-1.5 border-t border-dashed border-gray-400 text-center relative">
          <span className="bg-white px-2 text-[7.5px] text-gray-500 absolute -top-1.5 left-1/2 -translate-x-1/2 font-semibold">
            ✂ ----------------- এখান থেকে কেটে নিন / শিক্ষার্থীর কপি ----------------- ✂
          </span>
        </div>

        {/* ===== ২. শিক্ষার্থীর কপি (STUDENT COPY) ===== */}
        <div className="border border-gray-300 rounded p-1.5 bg-gray-50/40">
          <div className="flex items-center justify-between border-b border-gray-200 pb-0.5 mb-1">
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-tr from-amber-500 to-emerald-700 text-[10px] font-black text-white">
                উ
              </div>
              <span className="font-bold text-[9.5px] text-emerald-900">
                উত্তোলন — শিক্ষার্থীর কপি (Student Copy)
              </span>
            </div>
            <span className="text-[8px] text-gray-600">
              আইডি: <strong>{applicationId}</strong> · জমা: {dateLabel}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 text-[8.5px]">
            <div>নাম: <strong>{studentNameBn || studentNameEn}</strong></div>
            <div>শ্রেণি: {classVal || "—"}</div>
            <div>প্রোগ্রাম: {programVal}</div>
            <div>ব্যাচ: {batchVal}</div>
            <div>অভিভাবকের মোবাইল: {guardianMobileVal}</div>
            <div>মোবাইল: {mobileVal}</div>
          </div>
          <p className="mt-1 text-center text-[7.5px] text-gray-500">
            এই কপিটি নিজের কাছে সংরক্ষণ করুন — ভর্তি সংক্রান্ত যেকোনো যোগাযোগে এই আইডি প্রয়োজন হবে।
          </p>
        </div>
      </div>

      {/* ত্রুটিমুক্ত আইসোলেটেড প্রিন্ট সিএসএস */}
      <style jsx global>{`
        @media print {
          /* ১. প্রিন্টের সময় ব্যাকগ্রাউন্ডের মূল সাইট ও অ্যাডমিন বার পুরোপুরি হাইড */
          body.printing-receipt-mode > *:not(#print-isolated-root) {
            display: none !important;
          }

          /* ২. আইসোলেটেড রুটকে নরমাল ফ্লোতে একদম উপরে রাখা */
          #print-isolated-root {
            display: block !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          #print-isolated-root #printable-receipt {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 4mm 6mm !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            font-family: 'Hind Siliguri', 'Noto Serif Bengali', sans-serif !important;
          }

          /* ৩. ব্যাকগ্রাউন্ড গ্রাফিক্স ও পেপার সাইজ লক করা */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: A4 portrait;
            margin: 0mm;
          }
        }
      `}</style>
    </div>
  );
}