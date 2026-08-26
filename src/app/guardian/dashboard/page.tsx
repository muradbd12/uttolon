import type { Metadata } from "next";
import {
  ClipboardList,
  Bell,
  UserRound,
  Sparkles,
  MessageSquareText,
  CalendarClock,
  Wallet,
} from "lucide-react";
import ProgressRow from "@/components/ProgressRow";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import {
  demoGuardian,
  demoAttendance,
  demoAssessmentSummary,
  demoTeacherComments,
  demoUpcomingExams,
  demoNotices,
} from "@/content/guardian-demo";

export const metadata: Metadata = {
  title: "গার্ডিয়ান ড্যাশবোর্ড | Uttolon",
  robots: { index: false, follow: false },
};

export default function GuardianDashboardPage() {
  return (
    <RequireRoleAuth role="guardian" loginPath="/guardian/login">
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        {/* Preview notice — this is not a live feature yet */}
        <div className="flex items-start gap-3 rounded-sm border border-gold/30 bg-gold-soft/40 p-4">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-gold-deep" />
          <p className="text-sm leading-relaxed text-ink">
            এটি Guardian Dashboard-এর একটি <span className="font-medium">ডিজাইন প্রিভিউ</span> —
            লগইন এখন real, কিন্তু নিচের সব তথ্য এখনো নমুনা (demo) ডেটা, আপনার
            সন্তানের প্রকৃত তথ্য নয়। এই অংশটুকু real ডেটার সাথে যুক্ত হওয়া বাকি আছে।
          </p>
        </div>

        {/* Welcome header */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">
              Guardian Dashboard
            </p>
            <h1 className="mt-2 font-display-bn text-2xl text-ink sm:text-3xl">
              স্বাগতম, {demoGuardian.name}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              সন্তান: {demoGuardian.child.name} · {demoGuardian.child.className} ·{" "}
              {demoGuardian.child.program}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-line bg-paper px-4 py-2 text-sm text-ink-soft">
            <UserRound size={15} className="text-gold-deep" />
            {demoGuardian.child.studentId}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Assessment summary */}
            <div className="rounded-sm border border-line bg-paper p-6">
              <div className="flex items-center gap-2">
                <ClipboardList size={17} className="text-gold-deep" />
                <h2 className="font-display-bn text-lg text-ink">অগ্রগতি সারাংশ</h2>
              </div>
              <div className="mt-5 space-y-5">
                {demoAssessmentSummary.map((a) => (
                  <div key={a.subject}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-[15px] font-medium text-ink">{a.subject}</h3>
                      {a.recoveryActive ? (
                        <span className="rounded-sm bg-teal-soft px-2 py-0.5 text-xs font-medium text-teal-deep">
                          Recovery: Active
                        </span>
                      ) : (
                        <span className="rounded-sm bg-line px-2 py-0.5 text-xs text-ink-soft">
                          On Track
                        </span>
                      )}
                    </div>
                    <div className="mt-2.5">
                      <ProgressRow label="সর্বশেষ মূল্যায়ন" value={a.assessment} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher comments */}
            <div className="rounded-sm border border-line bg-paper p-6">
              <div className="flex items-center gap-2">
                <MessageSquareText size={17} className="text-gold-deep" />
                <h2 className="font-display-bn text-lg text-ink">শিক্ষকের মন্তব্য</h2>
              </div>
              <div className="mt-4 space-y-4">
                {demoTeacherComments.map((c) => (
                  <div key={c.subject} className="border-b border-line pb-4 last:border-0 last:pb-0">
                    <p className="font-label text-[11px] uppercase tracking-wide text-ink-soft/60">
                      {c.subject}
                    </p>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{c.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming exams */}
            <div className="rounded-sm border border-line bg-paper p-6">
              <div className="flex items-center gap-2">
                <CalendarClock size={17} className="text-gold-deep" />
                <h2 className="font-display-bn text-lg text-ink">আসন্ন পরীক্ষা</h2>
              </div>
              <div className="mt-4 space-y-3">
                {demoUpcomingExams.map((e) => (
                  <div
                    key={e.title}
                    className="flex items-center justify-between rounded-sm border border-line px-4 py-3"
                  >
                    <p className="text-[15px] text-ink">{e.title}</p>
                    <span className="text-xs text-ink-soft">{e.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Attendance */}
            <div className="rounded-sm border border-line bg-paper p-6">
              <h2 className="font-display-bn text-lg text-ink">উপস্থিতি</h2>
              <p className="mt-4 font-display-en text-4xl text-ink">
                {demoAttendance.thisMonthPercent}%
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                এই মাসে {demoAttendance.presentDays}/{demoAttendance.totalDays} দিন উপস্থিত
              </p>
            </div>

            {/* Fees */}
            <div className="rounded-sm border border-line bg-paper p-6">
              <div className="flex items-center gap-2">
                <Wallet size={17} className="text-gold-deep" />
                <h2 className="font-display-bn text-lg text-ink">ফি</h2>
              </div>
              <p className="mt-3 text-sm text-ink-soft/60">
                ফি ব্যবস্থাপনা সিস্টেম শীঘ্রই যুক্ত হবে।
              </p>
            </div>

            {/* Notices */}
            <div className="rounded-sm border border-line bg-paper p-6">
              <div className="flex items-center gap-2">
                <Bell size={17} className="text-gold-deep" />
                <h2 className="font-display-bn text-lg text-ink">নোটিশ</h2>
              </div>
              <div className="mt-4 space-y-3">
                {demoNotices.map((n) => (
                  <div key={n.title} className="border-b border-line pb-3 last:border-0 last:pb-0">
                    <p className="text-sm text-ink">{n.title}</p>
                    <p className="mt-1 text-xs text-ink-soft/60">{n.category}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </RequireRoleAuth>
  );
}
