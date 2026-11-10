"use client";

import { useState } from "react";
import { Wallet, Receipt, Printer, X } from "lucide-react";
import { useFees, type FeeEntry } from "@/lib/useFees";
import PaymentVoucherCard from "@/components/PaymentVoucherCard";
import { buildMonthlyReceipt } from "@/lib/monthlyReceipt";
import { printIsolated } from "@/lib/printReceipt";

const statusLabel: Record<string, string> = {
  paid: "পরিশোধিত",
  partial: "আংশিক পরিশোধিত",
  due: "বাকি",
};

const statusClass: Record<string, string> = {
  paid: "bg-teal-soft text-teal-deep",
  partial: "bg-gold-soft text-gold-deep",
  due: "bg-clay-soft text-clay",
};

const RECEIPT_ID = "printable-monthly-receipt";

export default function FeeSummary({
  studentUid,
  studentName,
  className,
  studentId,
}: {
  studentUid: string | null | undefined;
  studentName?: string | null;
  className?: string | null;
  studentId?: string | null;
}) {
  const fees = useFees(studentUid);
  const [receipt, setReceipt] = useState<FeeEntry | null>(null);

  const receiptButton = (f: FeeEntry) =>
    f.amountPaid > 0 ? (
      <button
        type="button"
        onClick={() => setReceipt(f)}
        className="flex items-center gap-1 rounded-sm border border-ink px-2 py-0.5 text-[11px] font-medium text-ink hover:bg-ink hover:text-paper"
      >
        <Receipt size={11} /> রশিদ
      </button>
    ) : null;

  return (
    <div className="rounded-sm border border-line bg-paper p-6">
      <div className="flex items-center gap-2">
        <Wallet size={17} className="text-gold-deep" />
        <h2 className="font-display-bn text-lg text-ink">ফি</h2>
      </div>

      {fees === null ? (
        <p className="mt-3 text-sm text-ink-soft/60">লোড হচ্ছে...</p>
      ) : fees.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft/60">এখনো কোনো ফি রেকর্ড যোগ করা হয়নি।</p>
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="text-sm text-ink-soft">{fees[0].month}</span>
            <span className="flex items-center gap-2">
              {receiptButton(fees[0])}
              <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${statusClass[fees[0].status]}`}>
                {statusLabel[fees[0].status]}
              </span>
            </span>
          </div>
          <div className="mt-3 space-y-1.5 text-sm text-ink-soft">
            <div className="flex justify-between">
              <span>বকেয়া</span>
              <span className="text-ink">{fees[0].amountDue}</span>
            </div>
            {fees[0].discount > 0 && (
              <div className="flex justify-between">
                <span>ছাড়</span>
                <span className="text-ink">{fees[0].discount}</span>
              </div>
            )}
            {fees[0].fine > 0 && (
              <div className="flex justify-between">
                <span>জরিমানা</span>
                <span className="text-ink">{fees[0].fine}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-line pt-1.5">
              <span>পরিশোধিত</span>
              <span className="text-ink">{fees[0].amountPaid}</span>
            </div>
          </div>

          {fees.length > 1 && (
            <div className="mt-4 border-t border-line pt-4">
              <p className="font-label text-[11px] uppercase tracking-wide text-ink-soft/60">
                পূর্বের রেকর্ড
              </p>
              <div className="mt-2 space-y-2">
                {fees.slice(1).map((f) => (
                  <div key={f.month} className="flex items-center justify-between gap-2 text-xs text-ink-soft">
                    <span>{f.month}</span>
                    <span className="flex items-center gap-2">
                      {receiptButton(f)}
                      <span>{statusLabel[f.status]}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {receipt && (
        <div className="mt-5 border-t border-line pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <Receipt size={14} /> মাসিক ফি রশিদ — {receipt.month}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => printIsolated(RECEIPT_ID)}
                className="flex items-center gap-1.5 rounded-sm bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-gold-deep"
              >
                <Printer size={13} /> প্রিন্ট করুন
              </button>
              <button
                type="button"
                onClick={() => setReceipt(null)}
                className="flex items-center gap-1 rounded-sm border border-line px-2.5 py-1.5 text-xs text-ink-soft hover:border-ink"
              >
                <X size={13} /> বন্ধ করুন
              </button>
            </div>
          </div>
          <div className="mt-3">
            <PaymentVoucherCard
              id={RECEIPT_ID}
              data={buildMonthlyReceipt(receipt, {
                uid: studentUid,
                name: studentName,
                className,
                studentId,
              })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
