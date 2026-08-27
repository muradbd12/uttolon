"use client";

import { Wallet } from "lucide-react";
import { useFees } from "@/lib/useFees";

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

export default function FeeSummary({ studentUid }: { studentUid: string | null | undefined }) {
  const fees = useFees(studentUid);

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
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-ink-soft">{fees[0].month}</span>
            <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${statusClass[fees[0].status]}`}>
              {statusLabel[fees[0].status]}
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
              <div className="mt-2 space-y-1.5">
                {fees.slice(1).map((f) => (
                  <div key={f.month} className="flex justify-between text-xs text-ink-soft">
                    <span>{f.month}</span>
                    <span>{statusLabel[f.status]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
