"use client";

import { useState } from "react";
import { GraduationCap, Loader2, Printer, AlertCircle } from "lucide-react";
import { useAdmissionFee } from "@/lib/useAdmissionFee";
import { toEnglishDigits } from "@/lib/numberInput";
import { getFirebaseAuth } from "@/lib/firebase";
import { withTimeout } from "@/lib/withTimeout";
import { printIsolated } from "@/lib/printReceipt";
import PaymentVoucherCard, { type VoucherData } from "@/components/PaymentVoucherCard";

function todayBn() {
  return new Date().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

export default function AdmissionFeeSummary({ studentUid }: { studentUid: string | null | undefined }) {
  const admission = useAdmissionFee(studentUid);

  const [payChoice, setPayChoice] = useState<"full" | "partial" | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("ক্যাশ (হাতে হাতে)");
  const [payStatus, setPayStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [voucher, setVoucher] = useState<VoucherData | null>(null);

  async function handlePay() {
    if (!admission || !studentUid) return;
    const due = admission.due;
    const amount =
      payChoice === "full" ? due : Math.min(Math.max(Math.round(Number(payAmount) || 0), 0), due);
    if (amount <= 0) return;

    setPayStatus("processing");
    try {
      const authInstance = getFirebaseAuth();
      const token = await authInstance.currentUser?.getIdToken();
      if (!token) throw new Error("unauthorized");

      const res = await withTimeout(
        fetch("/api/student/pay-admission-fee", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ studentUid, amount, method: payMethod }),
        })
      );
      if (!res.ok) throw new Error("payment_failed");
      const data = await res.json();
      setVoucher({
        studentNameBn: data.studentNameBn,
        studentNameEn: data.studentNameEn,
        applicationId: data.shortId || "",
        className: data.className,
        group: data.group,
        program: data.program,
        mobile: data.mobile,
        voucherId: (data.shortId || "").slice(0, 6) + "-V" + Math.ceil(data.totalPaid / Math.max(data.amount, 1)),
        paymentDate: todayBn(),
        amountPaidNow: data.amount,
        method: payMethod,
        monthOrPurpose: "ভর্তি ফি (কিস্তি)",
        totalFee: data.totalFee,
        totalPaid: data.totalPaid,
        due: data.due,
      });
      setPayStatus("done");
    } catch {
      setPayStatus("error");
    }
  }

  if (payStatus === "done" && voucher) {
    return (
      <div className="rounded-sm border border-line bg-paper p-6">
        <div className="text-center print:hidden">
          <button
            type="button"
            onClick={() => printIsolated("printable-admission-fee-voucher")}
            className="mx-auto flex items-center gap-2 rounded-sm bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-gold-deep"
          >
            <Printer size={16} /> ভাউচার প্রিন্ট করুন
          </button>
        </div>
        <div className="mt-4">
          <PaymentVoucherCard data={voucher} id="printable-admission-fee-voucher" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-line bg-paper p-6">
      <div className="flex items-center gap-2">
        <GraduationCap size={17} className="text-gold-deep" />
        <h2 className="font-display-bn text-lg text-ink">ভর্তি ফি</h2>
      </div>

      {admission === undefined ? (
        <p className="mt-3 text-sm text-ink-soft/60">লোড হচ্ছে...</p>
      ) : admission === null ? (
        <p className="mt-3 text-sm text-ink-soft/60">এখনো কোনো ভর্তি ফি রেকর্ড পাওয়া যায়নি।</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-sm border border-line bg-paper-raised p-3 text-center">
            <div>
              <p className="text-xs text-ink-soft/60">মোট ফি</p>
              <p className="text-base font-bold text-ink">৳{admission.totalFee.toLocaleString("bn-BD")}</p>
            </div>
            <div className="border-x border-line">
              <p className="text-xs text-ink-soft/60">পরিশোধিত</p>
              <p className="text-base font-bold text-teal-deep">৳{admission.totalPaid.toLocaleString("bn-BD")}</p>
            </div>
            <div>
              <p className="text-xs text-ink-soft/60">বকেয়া</p>
              <p className={`text-base font-bold ${admission.due > 0 ? "text-clay" : "text-teal-deep"}`}>
                ৳{Math.max(admission.due, 0).toLocaleString("bn-BD")}
              </p>
            </div>
          </div>

          {admission.due <= 0 ? (
            <p className="mt-4 rounded-sm border border-teal/30 bg-teal-soft px-3 py-2 text-sm text-teal-deep">
              ভর্তি ফি সম্পূর্ণ পরিশোধ হয়ে গেছে।
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
                  onClick={() => { setPayChoice("full"); setPayAmount(String(admission.due)); }}
                  className={`rounded-sm border px-3.5 py-2 text-sm ${payChoice === "full" ? "border-ink bg-ink text-paper" : "border-line text-ink-soft"}`}
                >
                  সম্পূর্ণ বকেয়া পরিশোধ করুন
                </button>
                <button
                  type="button"
                  onClick={() => { setPayChoice("partial"); setPayAmount(""); }}
                  className={`rounded-sm border px-3.5 py-2 text-sm ${payChoice === "partial" ? "border-ink bg-ink text-paper" : "border-line text-ink-soft"}`}
                >
                  আংশিক পরিশোধ করুন
                </button>
              </div>

              {payChoice === "partial" && (
                <input
                  type="text"
                  inputMode="numeric"
                  value={payAmount}
                  onChange={(e) => setPayAmount(toEnglishDigits(e.target.value))}
                  placeholder="কত টাকা দিচ্ছেন লিখুন"
                  className="mt-3 w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
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
                    onClick={handlePay}
                    disabled={payStatus === "processing" || (payChoice === "partial" && (!payAmount || Number(payAmount) <= 0))}
                    className="flex items-center gap-2 rounded-sm bg-teal-deep px-5 py-2 text-sm font-medium text-paper hover:opacity-90 disabled:opacity-50"
                  >
                    {payStatus === "processing" && <Loader2 size={14} className="animate-spin" />}
                    পেমেন্ট নিশ্চিত করুন
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
