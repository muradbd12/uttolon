"use client";

import { AlertTriangle, Wallet, CheckCircle2 } from "lucide-react";
import { useRecentAbsences } from "@/lib/useRecentAbsences";
import { useFees } from "@/lib/useFees";

function formatDateBn(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("bn-BD", { day: "numeric", month: "long" });
  } catch {
    return dateStr;
  }
}

// Guardian ও Student — দুই dashboard-এই ব্যবহার হয়। এটা কোনো
// SMS/push notification না (সেটার জন্য টাকা লাগে) — dashboard-এ
// ঢুকলেই যেন গুরুত্বপূর্ণ বিষয়গুলো (অনুপস্থিতি, বাকি ফি) সাথে সাথে
// চোখে পড়ে, সেই ব্যবস্থা।
export default function DashboardAlerts({
  studentUid,
  subjectLabel = "",
}: {
  studentUid: string | null | undefined;
  subjectLabel?: string;
}) {
  const absences = useRecentAbsences(studentUid);
  const fees = useFees(studentUid);

  if (!studentUid || absences === null || fees === null) return null;

  const latestFee = fees[0];
  const feeDue = latestFee && (latestFee.status === "due" || latestFee.status === "partial");
  const hasAbsence = absences.count > 0;

  if (!feeDue && !hasAbsence) {
    return (
      <div className="flex items-center gap-2 rounded-sm border border-teal/30 bg-teal-soft px-4 py-3 text-sm text-teal-deep">
        <CheckCircle2 size={16} className="shrink-0" />
        <span>উপস্থিতি ও ফি — বর্তমানে {subjectLabel} নিয়ে জানানোর মতো কিছু নেই।</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {hasAbsence && (
        <div className="flex items-start gap-2 rounded-sm border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            গত ৭ দিনে {subjectLabel} <span className="font-medium">{absences.count} দিন অনুপস্থিত</span> ছিল
            {absences.mostRecentDate ? ` — সর্বশেষ ${formatDateBn(absences.mostRecentDate)}` : ""}।
          </span>
        </div>
      )}
      {feeDue && (
        <div className="flex items-start gap-2 rounded-sm border border-gold/40 bg-gold-soft/50 px-4 py-3 text-sm text-gold-deep">
          <Wallet size={16} className="mt-0.5 shrink-0" />
          <span>
            {latestFee.month}-এর ফি এখনো {latestFee.status === "partial" ? "আংশিক" : "সম্পূর্ণ"} বাকি —
            পরিশোধিত {latestFee.amountPaid}, বকেয়া {latestFee.amountDue - latestFee.discount + latestFee.fine}।
          </span>
        </div>
      )}
    </div>
  );
}
