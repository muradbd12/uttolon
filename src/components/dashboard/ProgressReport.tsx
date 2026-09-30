"use client";

import { useAssessments } from "@/lib/useAssessments";
import { useAttendanceSummary } from "@/lib/useAttendanceSummary";
import { useFees } from "@/lib/useFees";
import { useAdmissionFee } from "@/lib/useAdmissionFee";
import { printIsolated } from "@/lib/printReceipt";
import { Printer, GraduationCap } from "lucide-react";

function todayBn() {
  return new Date().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

function toBn(n: number) {
  const digits: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(n).split("").map((c) => digits[c] ?? c).join("");
}

export default function ProgressReport({
  studentUid,
  studentName,
  className,
}: {
  studentUid: string | null | undefined;
  studentName?: string | null;
  className?: string | null;
}) {
  const assessments = useAssessments(studentUid);
  const attendance = useAttendanceSummary(studentUid);
  const fees = useFees(studentUid);
  const admissionFee = useAdmissionFee(studentUid);

  const printId = `printable-progress-report-${studentUid || "x"}`;

  const overallAvg =
    assessments && assessments.length > 0
      ? Math.round(
          assessments.reduce((sum, a) => sum + (a.concept + a.practice + a.assessment) / 3, 0) /
            assessments.length
        )
      : null;

  const recoveryCount = assessments ? assessments.filter((a) => a.recoveryActive).length : 0;
  const latestFee = fees && fees.length > 0 ? fees[0] : null;

  return (
    <div className="rounded-sm border border-line bg-paper p-6">
      <div className="flex items-center justify-between print:hidden">
        <h2 className="font-display-bn text-lg text-ink">প্রগ্রেস রিপোর্ট</h2>
        <button
          type="button"
          onClick={() => printIsolated(printId)}
          className="flex items-center gap-2 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold-deep"
        >
          <Printer size={15} /> প্রিন্ট করুন
        </button>
      </div>

      <div id={printId} className="mt-5 rounded-sm border border-line p-5 text-[13px] print:border-none print:p-0">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <img src="/uttolon-logo.png" alt="উত্তোলন" className="h-10 w-10 object-contain" />
          <div>
            <p className="font-display-bn text-lg text-ink">উত্তোলন — প্রগ্রেস রিপোর্ট</p>
            <p className="text-xs text-ink-soft/60">তৈরি হয়েছে: {todayBn()}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <p><span className="text-ink-soft">শিক্ষার্থীর নাম:</span> <span className="text-ink">{studentName || "—"}</span></p>
          <p><span className="text-ink-soft">শ্রেণি:</span> <span className="text-ink">{className || "—"}</span></p>
        </div>

        <div className="mt-5">
          <h3 className="font-display-bn text-[15px] text-ink">উপস্থিতি</h3>
          {attendance ? (
            <p className="mt-1.5 text-sm text-ink-soft">
              মোট {toBn(attendance.totalDays)} দিনের মধ্যে উপস্থিত {toBn(attendance.presentDays)} দিন —{" "}
              <span className="font-medium text-ink">{toBn(attendance.percent)}%</span>
            </p>
          ) : (
            <p className="mt-1.5 text-sm text-ink-soft/60">তথ্য নেই</p>
          )}
        </div>

        <div className="mt-5">
          <h3 className="font-display-bn text-[15px] text-ink">বিষয়ভিত্তিক ফলাফল</h3>
          {!assessments || assessments.length === 0 ? (
            <p className="mt-1.5 text-sm text-ink-soft/60">এখনো কোনো মূল্যায়ন যোগ করা হয়নি।</p>
          ) : (
            <>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[420px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-ink-soft">
                      <th className="py-1.5 pr-3 font-normal">বিষয়</th>
                      <th className="py-1.5 pr-3 font-normal">Concept</th>
                      <th className="py-1.5 pr-3 font-normal">Practice</th>
                      <th className="py-1.5 pr-3 font-normal">Assessment</th>
                      <th className="py-1.5 pr-3 font-normal">গড়</th>
                      <th className="py-1.5 font-normal">Recovery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((a) => {
                      const avg = Math.round((a.concept + a.practice + a.assessment) / 3);
                      return (
                        <tr key={a.subject} className="border-b border-line/60">
                          <td className="py-1.5 pr-3 text-ink">{a.subject}</td>
                          <td className="py-1.5 pr-3 text-ink-soft">{a.concept}%</td>
                          <td className="py-1.5 pr-3 text-ink-soft">{a.practice}%</td>
                          <td className="py-1.5 pr-3 text-ink-soft">{a.assessment}%</td>
                          <td className="py-1.5 pr-3 font-medium text-ink">{avg}%</td>
                          <td className="py-1.5">
                            {a.recoveryActive ? (
                              <span className="rounded-full bg-clay-soft px-2 py-0.5 text-[11px] text-clay">Active</span>
                            ) : (
                              <span className="text-ink-soft/50">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-ink-soft">
                সামগ্রিক গড়: <span className="font-medium text-ink">{overallAvg}%</span>
                {recoveryCount > 0 && (
                  <> · <span className="text-clay">{toBn(recoveryCount)}টি বিষয়ে Recovery প্রয়োজন</span></>
                )}
              </p>
              {assessments.some((a) => a.comment) && (
                <div className="mt-3 space-y-1">
                  {assessments
                    .filter((a) => a.comment)
                    .map((a) => (
                      <p key={a.subject} className="text-xs text-ink-soft">
                        <span className="font-medium text-ink">{a.subject}:</span> {a.comment}
                      </p>
                    ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-5">
          <h3 className="font-display-bn text-[15px] text-ink">ফি অবস্থা</h3>
          <div className="mt-1.5 space-y-1 text-sm text-ink-soft">
            {admissionFee && (
              <p>
                ভর্তি ফি — মোট ৳{admissionFee.totalFee.toLocaleString("bn-BD")}, পরিশোধিত ৳
                {admissionFee.totalPaid.toLocaleString("bn-BD")}
                {admissionFee.due > 0 ? (
                  <span className="text-clay"> (বকেয়া ৳{admissionFee.due.toLocaleString("bn-BD")})</span>
                ) : (
                  <span className="text-teal-deep"> (সম্পূর্ণ পরিশোধিত)</span>
                )}
              </p>
            )}
            {latestFee ? (
              <p>
                সর্বশেষ মাস ({latestFee.month}) —{" "}
                {latestFee.status === "paid" ? (
                  <span className="text-teal-deep">পরিশোধিত</span>
                ) : latestFee.status === "partial" ? (
                  <span className="text-gold-deep">আংশিক পরিশোধিত</span>
                ) : (
                  <span className="text-clay">বকেয়া</span>
                )}
              </p>
            ) : (
              <p className="text-ink-soft/60">মাসিক ফি-এর তথ্য নেই</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
