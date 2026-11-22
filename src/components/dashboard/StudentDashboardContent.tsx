"use client";

import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
} from "lucide-react";
import ProgressRow from "@/components/ProgressRow";
import { useUserProfile } from "@/lib/useUserProfile";
import { useAttendanceSummary } from "@/lib/useAttendanceSummary";
import { useAssessments } from "@/lib/useAssessments";
import { useTodaySchedule } from "@/lib/useTodaySchedule";
import RecentNotices from "@/components/dashboard/RecentNotices";
import FeeSummary from "@/components/dashboard/FeeSummary";
import AdmissionFeeSummary from "@/components/dashboard/AdmissionFeeSummary";
import ProgressReport from "@/components/dashboard/ProgressReport";
import StudentHomework from "@/components/dashboard/StudentHomework";
import QuranProgressCard from "@/components/dashboard/QuranProgressCard";
import CertificatesCard from "@/components/dashboard/CertificatesCard";
import ProgressTrend from "@/components/dashboard/ProgressTrend";
import RoleWelcome from "@/components/dashboard/RoleWelcome";
import DashboardAlerts from "@/components/dashboard/DashboardAlerts";

export default function StudentDashboardContent() {
  const profile = useUserProfile();
  const attendance = useAttendanceSummary(profile?.uid);
  const assessments = useAssessments(profile?.uid);
  const todaySchedule = useTodaySchedule({ field: "className", value: profile?.className });

  return (
    <section style={{ background: "linear-gradient(180deg, #eaf3f6 0%, #f4f7fb 38%, #fbfbf7 100%)" }}>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <RoleWelcome
          role="student"
          name={profile?.name}
          line={profile?.className ? `${profile.className}${profile.studentId ? ` · ID: ${profile.studentId}` : ""}` : "ক্লাস যুক্ত হয়নি"}
          chip={profile?.identifier || "Student"}
        />

        {/* সতর্কতা — অনুপস্থিতি ও ফি বাকি থাকলে */}
        <div className="mt-6">
          <DashboardAlerts studentUid={profile?.uid} subjectLabel="তুমি" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Today's classes — real */}
            <div className="rounded-xl border border-line bg-white p-6 shadow-sm" style={{ borderTop: "4px solid #3b82f6" }}>
              <div className="flex items-center gap-2">
                <CalendarDays size={17} className="text-gold-deep" />
                <h2 className="font-display-bn text-lg text-ink">আজকের ক্লাস</h2>
              </div>
              {todaySchedule === null ? (
                <p className="mt-4 text-sm text-ink-soft/60">লোড হচ্ছে...</p>
              ) : todaySchedule.length === 0 ? (
                <p className="mt-4 text-sm text-ink-soft/60">আজকে কোনো ক্লাস নির্ধারিত নেই।</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {todaySchedule.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-sm border border-line px-4 py-3"
                    >
                      <div>
                        <p className="text-[15px] text-ink">{c.subject}</p>
                        <p className="text-xs text-ink-soft/70">
                          {c.teacherName} {c.room ? `— ${c.room}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-xs text-ink-soft">
                          {c.startTime}–{c.endTime}
                        </span>
                        {c.meetingLink && (
                          <a
                            href={c.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-teal-deep px-3 py-1 text-xs font-semibold text-paper hover:opacity-90"
                          >
                            ক্লাসে যোগ দিন
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assessment & Recovery — real */}
            <div className="rounded-xl border border-line bg-white p-6 shadow-sm" style={{ borderTop: "4px solid #10b981" }}>
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

            {/* Homework — real */}
            <Link
              href="/student/quizzes"
              className="flex items-center justify-between rounded-sm border border-gold bg-gold-soft/40 px-5 py-4 text-[15px] font-semibold text-ink hover:bg-gold-soft/70"
            >
              অনলাইন টেস্ট দাও — স্কোর সাথে সাথে দেখো
              <span aria-hidden>→</span>
            </Link>

            <StudentHomework className={profile?.className} studentUid={profile?.uid} studentName={profile?.name} />

            <QuranProgressCard studentUid={profile?.uid} />

            <CertificatesCard studentUid={profile?.uid} />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Attendance — real */}
            <div className="rounded-xl border border-line bg-white p-6 shadow-sm" style={{ borderTop: "4px solid #f59e0b" }}>
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

            <FeeSummary studentUid={profile?.uid} studentName={profile?.name} className={profile?.className} studentId={profile?.studentId} />
            <AdmissionFeeSummary studentUid={profile?.uid} />

            <RecentNotices />
          </div>

          <div className="mt-6">
            <ProgressTrend studentUid={profile?.uid} />
          </div>

          <div className="mt-6">
            <ProgressReport
              studentUid={profile?.uid}
              studentName={profile?.name}
              studentId={profile?.studentId}
              className={profile?.className}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
