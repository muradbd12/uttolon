"use client";

import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Bell,
  UserRound,
  Sparkles,
} from "lucide-react";
import ProgressRow from "@/components/ProgressRow";
import { useUserProfile } from "@/lib/useUserProfile";
import { useAttendanceSummary } from "@/lib/useAttendanceSummary";
import { useAssessments } from "@/lib/useAssessments";
import {
  demoClassesToday,
  demoHomework,
  demoNotices,
} from "@/content/student-demo";

export default function StudentDashboardContent() {
  const profile = useUserProfile();
  const attendance = useAttendanceSummary(profile?.uid);
  const assessments = useAssessments(profile?.uid);

  return (
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        {/* Preview notice — this is not a live feature yet */}
        <div className="flex items-start gap-3 rounded-sm border border-gold/30 bg-gold-soft/40 p-4">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-gold-deep" />
          <p className="text-sm leading-relaxed text-ink">
            লগইন, প্রোফাইল, উপস্থিতি ও Assessment এখন <span className="font-medium">real</span> —
            ক্লাস/হোমওয়ার্ক অংশ এখনো নমুনা (demo) ডেটা, পরের ধাপে real হবে।
          </p>
        </div>

        {/* Welcome header */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">
              Student Dashboard
            </p>
            <h1 className="mt-2 font-display-bn text-2xl text-ink sm:text-3xl">
              স্বাগতম, {profile?.name || "..."}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">{profile?.className || "ক্লাস যুক্ত হয়নি"}</p>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-line bg-paper px-4 py-2 text-sm text-ink-soft">
            <UserRound size={15} className="text-gold-deep" />
            {profile?.identifier || "Student"}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Today's classes */}
            <div className="rounded-sm border border-line bg-paper p-6">
              <div className="flex items-center gap-2">
                <CalendarDays size={17} className="text-gold-deep" />
                <h2 className="font-display-bn text-lg text-ink">আজকের ক্লাস (নমুনা)</h2>
              </div>
              <div className="mt-4 space-y-3">
                {demoClassesToday.map((c) => (
                  <div
                    key={c.subject}
                    className="flex items-center justify-between rounded-sm border border-line px-4 py-3"
                  >
                    <div>
                      <p className="text-[15px] text-ink">{c.subject}</p>
                      <p className="text-xs text-ink-soft/70">{c.teacher}</p>
                    </div>
                    <span className="text-xs text-ink-soft">{c.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment & Recovery — real */}
            <div className="rounded-sm border border-line bg-paper p-6">
              <div className="flex items-center gap-2">
                <ClipboardList size={17} className="text-gold-deep" />
                <h2 className="font-display-bn text-lg text-ink">Assessment &amp; Recovery</h2>
              </div>
              {assessments === null ? (
                <p className="mt-4 text-sm text-ink-soft/60">লোড হচ্ছে...</p>
              ) : assessments.length === 0 ? (
                <p className="mt-4 text-sm text-ink-soft/60">এখনো কোনো মূল্যায়ন যোগ করা হয়নি।</p>
              ) : (
                <div className="mt-5 space-y-6">
                  {assessments.map((a) => (
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
                      <div className="mt-3 space-y-2.5">
                        <ProgressRow label="Concept" value={a.concept} />
                        <ProgressRow label="Practice" value={a.practice} />
                        <ProgressRow label="Assessment" value={a.assessment} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Homework */}
            <div className="rounded-sm border border-line bg-paper p-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-gold-deep" />
                <h2 className="font-display-bn text-lg text-ink">হোমওয়ার্ক (নমুনা)</h2>
              </div>
              <div className="mt-4 space-y-3">
                {demoHomework.map((h) => (
                  <div key={h.title} className="rounded-sm border border-line px-4 py-3">
                    <p className="font-label text-[11px] uppercase tracking-wide text-ink-soft/60">
                      {h.subject}
                    </p>
                    <p className="mt-1 text-[15px] text-ink">{h.title}</p>
                    <p className="mt-1 text-xs text-gold-deep">জমা দেওয়ার সময়: {h.due}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Attendance — real */}
            <div className="rounded-sm border border-line bg-paper p-6">
              <h2 className="font-display-bn text-lg text-ink">উপস্থিতি</h2>
              {attendance === null ? (
                <p className="mt-4 text-sm text-ink-soft/60">লোড হচ্ছে...</p>
              ) : attendance.totalDays === 0 ? (
                <p className="mt-4 text-sm text-ink-soft/60">এখনো কোনো উপস্থিতি রেকর্ড করা হয়নি।</p>
              ) : (
                <>
                  <p className="mt-4 font-display-en text-4xl text-ink">{attendance.percent}%</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    মোট {attendance.presentDays}/{attendance.totalDays} দিন উপস্থিত
                  </p>
                </>
              )}
            </div>

            {/* Notices */}
            <div className="rounded-sm border border-line bg-paper p-6">
              <div className="flex items-center gap-2">
                <Bell size={17} className="text-gold-deep" />
                <h2 className="font-display-bn text-lg text-ink">নোটিশ (নমুনা)</h2>
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
  );
}
