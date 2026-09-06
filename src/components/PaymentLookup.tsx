"use client";

import { useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { AlertCircle, Loader2, Printer, Search } from "lucide-react";
import { withTimeout } from "@/lib/withTimeout";
import PaymentVoucherCard, { type VoucherData } from "@/components/PaymentVoucherCard";
import { printIsolated } from "@/lib/printReceipt";

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

type FoundRecord = {
  id: string;
  studentNameBn?: string;
  studentNameEn?: string;
  mobile?: string;
  className?: string;
  group?: string;
  program?: string;
  totalFee?: number;
  totalPaid?: number;
  due?: number;
};

function todayBn() {
  return new Date().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

export default function PaymentLookup() {
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "found" | "not-found" | "error">("idle");
  const [record, setRecord] = useState<FoundRecord | null>(null);

  const [payChoice, setPayChoice] = useState<"full" | "partial" | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("ক্যাশ (হাতে হাতে)");
  const [payStatus, setPayStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [voucher, setVoucher] = useState<VoucherData | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupStatus("loading");
    setRecord(null);
    try {
      const q = query(
        collection(getFirebaseDb(), "admissions"),
        where("mobile", "==", mobile.trim()),
        where("shortId", "==", code.trim().toUpperCase())
      );
      const snapshot = await withTimeout(getDocs(q));
      if (snapshot.empty) {
        setLookupStatus("not-found");
        return;
      }
      const d = snapshot.docs[0];
      setRecord({ id: d.id, ...d.data() } as FoundRecord);
      setLookupStatus("found");
    } catch {
      setLookupStatus("error");
    }
  }

  async function handleAdmissionPayment() {
    if (!record) return;
    const fee = record.totalFee || 0;
    const alreadyPaid = record.totalPaid || 0;
    const due = record.due ?? fee - alreadyPaid;
    const amount = payChoice === "full" ? due : Math.min(Math.max(Math.round(Number(payAmount) || 0), 0), due);
    if (amount <= 0) return;

    setPayStatus("processing");
    try {
      const newTotalPaid = alreadyPaid + amount;
      const newDue = fee - newTotalPaid;
      await withTimeout(
        addDoc(collection(getFirebaseDb(), "admissions", record.id, "payments"), {
          amount,
          method: payMethod,
          monthOrPurpose: "ভর্তি ফি (কিস্তি)",
          paidAt: serverTimestamp(),
        })
      );
      await withTimeout(
        updateDoc(doc(getFirebaseDb(), "admissions", record.id), {
          totalPaid: newTotalPaid,
          due: newDue,
        })
      );
      setVoucher({
        studentNameBn: record.studentNameBn,
        studentNameEn: record.studentNameEn,
        applicationId: code.trim().toUpperCase(),
        className: record.className,
        group: record.group,
        program: record.program,
        mobile: record.mobile,
        voucherId: record.id.slice(0, 6).toUpperCase() + "-V" + Math.ceil(newTotalPaid / Math.max(amount, 1)),
        paymentDate: todayBn(),
        amountPaidNow: amount,
        method: payMethod,
        monthOrPurpose: "ভর্তি ফি (কিস্তি)",
        totalFee: fee,
        totalPaid: newTotalPaid,
        due: newDue,
      });
      setPayStatus("done");
    } catch {
      setPayStatus("error");
    }
  }

  if (payStatus === "done" && voucher) {
    return (
      <div>
        <div className="text-center print:hidden">
          <button
            type="button"
            onClick={() => printIsolated("printable-voucher")}
            className="mx-auto flex items-center gap-2 rounded-sm bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-gold-deep"
          >
            <Printer size={16} /> ভাউচার প্রিন্ট করুন
          </button>
        </div>
        <div className="mt-4">
          <PaymentVoucherCard data={voucher} />
        </div>
      </div>
    );
  }

  if (lookupStatus === "found" && record) {
    const fee = record.totalFee || 0;
    const due = record.due ?? fee - (record.totalPaid || 0);
    return (
      <div className="rounded-sm border border-line bg-paper p-6">
        <p className="text-sm text-ink-soft">শিক্ষার্থী</p>
        <p className="font-display-bn text-xl text-ink">{record.studentNameBn || record.studentNameEn}</p>
        <p className="text-sm text-ink-soft">{record.program} {record.className ? `· ${record.className}` : ""}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-sm border border-line bg-paper-raised p-3 text-center">
          <div>
            <p className="text-xs text-ink-soft/60">মোট ফি</p>
            <p className="text-base font-bold text-ink">৳{fee.toLocaleString("bn-BD")}</p>
          </div>
          <div className="border-x border-line">
            <p className="text-xs text-ink-soft/60">পরিশোধিত</p>
            <p className="text-base font-bold text-teal-deep">৳{(record.totalPaid || 0).toLocaleString("bn-BD")}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft/60">বকেয়া</p>
            <p className={`text-base font-bold ${due > 0 ? "text-clay" : "text-teal-deep"}`}>
              ৳{Math.max(due, 0).toLocaleString("bn-BD")}
            </p>
          </div>
        </div>

        {due <= 0 ? (
          <p className="mt-4 rounded-sm border border-teal/30 bg-teal-soft px-3 py-2 text-sm text-teal-deep">
            ভর্তি ফি সম্পূর্ণ পরিশোধ হয়ে গেছে — এই মুহূর্তে কোনো বকেয়া নেই।
          </p>
        ) : (
          <div className="mt-5">
            {payStatus === "error" && (
              <div className="mb-3 flex items-start gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
                <AlertCircle size={15} className="mt-0.5 shrink-0" /> পেমেন্ট সেভ করা যায়নি — আবার চেষ্টা করুন।
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setPayChoice("full"); setPayAmount(String(due)); }}
                className={`rounded-sm border px-4 py-2 text-sm ${payChoice === "full" ? "border-ink bg-ink text-paper" : "border-line text-ink-soft"}`}
              >
                সম্পূর্ণ বকেয়া পরিশোধ করুন (৳{due.toLocaleString("bn-BD")})
              </button>
              <button
                type="button"
                onClick={() => { setPayChoice("partial"); setPayAmount(""); }}
                className={`rounded-sm border px-4 py-2 text-sm ${payChoice === "partial" ? "border-ink bg-ink text-paper" : "border-line text-ink-soft"}`}
              >
                আংশিক পরিশোধ করুন
              </button>
            </div>

            {payChoice === "partial" && (
              <input
                type="number"
                min={1}
                max={due}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="কত টাকা দিচ্ছেন লিখুন"
                className={`mt-3 sm:w-64 ${inputClass}`}
              />
            )}

            {payChoice && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                >
                  <option>ক্যাশ (হাতে হাতে)</option>
                  <option>বিকাশ</option>
                  <option>নগদ (Nagad)</option>
                  <option>রকেট</option>
                  <option>ব্যাংক ট্রান্সফার</option>
                  <option>অন্যান্য</option>
                </select>
                <button
                  type="button"
                  onClick={handleAdmissionPayment}
                  disabled={payStatus === "processing" || (payChoice === "partial" && (!payAmount || Number(payAmount) <= 0))}
                  className="flex items-center gap-2 rounded-sm bg-teal-deep px-6 py-2.5 text-sm font-medium text-paper hover:opacity-90 disabled:opacity-50"
                >
                  {payStatus === "processing" && <Loader2 size={14} className="animate-spin" />}
                  পেমেন্ট নিশ্চিত করুন
                </button>
              </div>
            )}
          </div>
        )}

        <p className="mt-6 border-t border-line pt-4 text-xs text-ink-soft/60">
          প্রতি মাসের বেতন দেখতে/পরিশোধ করতে আপনার স্টুডেন্ট বা গার্ডিয়ান লগইন অ্যাকাউন্ট দিয়ে ড্যাশবোর্ডে যান।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleLookup} className="space-y-5 rounded-sm border border-line bg-paper p-6">
      <div>
        <label className="block text-sm font-medium text-ink">মোবাইল নম্বর</label>
        <input
          required
          type="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="01XXXXXXXXX"
          className={`mt-1.5 ${inputClass}`}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink">আবেদন আইডি</label>
        <input
          required
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="যেমন: 5LOJLXYO"
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      {lookupStatus === "not-found" && (
        <p className="text-sm text-clay">এই তথ্যে কোনো আবেদন পাওয়া যায়নি — মোবাইল ও আইডি আবার মিলিয়ে দেখুন।</p>
      )}
      {lookupStatus === "error" && (
        <p className="text-sm text-clay">তথ্য আনতে সমস্যা হয়েছে — আবার চেষ্টা করুন।</p>
      )}

      <button
        type="submit"
        disabled={lookupStatus === "loading"}
        className="flex items-center gap-2 rounded-sm bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
      >
        {lookupStatus === "loading" ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
        খুঁজুন
      </button>
    </form>
  );
}
