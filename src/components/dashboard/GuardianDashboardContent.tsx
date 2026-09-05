"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import {
  ClipboardList,
  UserRound,
  Sparkles,
  MessageSquareText,
  CalendarClock,
} from "lucide-react";
import ProgressRow from "@/components/ProgressRow";
import { useUserProfile } from "@/lib/useUserProfile";
import { useAttendanceSummary } from "@/lib/useAttendanceSummary";
import { useAssessments } from "@/lib/useAssessments";
import { getFirebaseDb } from "@/lib/firebase";
import RecentNotices from "@/components/dashboard/RecentNotices";
import FeeSummary from "@/components/dashboard/FeeSummary";
import DashboardAlerts from "@/components/dashboard/DashboardAlerts";
import { demoUpcomingExams } from "@/content/guardian-demo";

type ChildProfile = { name?: string; className?: string; identifier?: string };

export default function GuardianDashboardContent() {
  const profile = useUserProfile();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const attendance = useAttendanceSummary(profile?.linkedStudentUid);
  const assessments = useAssessments(profile?.linkedStudentUid);

  useEffect(() => {
    if (!profile?.linkedStudentUid) return;
    async function loadChild() {
      try {
        const snap = await getDoc(doc(getFirebaseDb(), "users", profile!.linkedStudentUid!));
        setChild(snap.exists() ? (snap.data() as ChildProfile) : null);
      } catch {
        setChild(null);
      }
    }
    loadChild();
  }, [profile?.linkedStudentUid]);

  return (
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        {/* Preview notice — this is not a live feature yet */}
        <div className="flex items-start gap-3 rounded-sm border border-gold/30 bg-gold-soft/40 p-4">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-gold-deep" />
          <p className="text-sm leading-relaxed text-ink">
            লগইন, প্রোফাইল, উপস্থিতি, Assessment ও ফি এখন <span className="font-medium">real</span> —
            শুধু আসন্ন পরীক্ষার তথ্য এখনো নমুনা (demo) ডেটা।
          </p>
        </div>

        {/* Welcome header */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">
              Guardian Dashboard
            </p>
            <h1 className="mt-2 font-display-bn text-2xl text-ink sm:text-3xl">
              স্বাগতম, {profile?.name || "..."}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              সন্তান: {child?.name || "..."} {child?.className ? `· ${child.className}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-line bg-paper px-4 py-2 text-sm text-ink-soft">
            <UserRound size={15} className="text-gold-deep" />
            {child?.identifier || "Student"}
          </div>
        </div>

        {/* সতর্কতা — অনুপস্থিতি ও ফি বাকি থাকলে */}
        <div className="mt-6">
          <DashboardAlerts studentUid={profile?.linkedStudentUid} subjectLabel="সন্তান" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Assessment summary — real */}
            <div className="rounded-sm border border-line bg-paper p-6">
              <div className="flex items-center gap-2">
                <ClipboardList size={17} className="text-gold-deep" />
                <h2 className="font-display-bn text-lg text-ink">অগ্রগতি সারাংশ</h2>
              </div>
              {assessments === null ? (
                <p className="mt-4 text-sm text-ink-soft/60">লোড হচ্ছে...</p>
              ) : assessments.length === 0 ? (
                <p className="mt-4 text-sm text-ink-soft/60">এখনো কোনো মূল্যায়ন যোগ করা হয়নি।</p>
              ) : (
                <div className="mt-5 space-y-5">
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
                      <div className="mt-2.5">
                        <ProgressRow label="সর্বশেষ মূল্যায়ন" value={a.assessment} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Teacher comments — real (from assessment entries with a comment) */}
            <div className="rounded-sm border border-line bg-paper p-6">
              <div className="flex items-center gap-2">
                <MessageSquareText size={17} className="text-gold-deep" />
                <h2 className="font-display-bn text-lg text-ink">শিক্ষকের মন্তব্য</h2>
              </div>
              {(() => {
                const withComments = (assessments || []).filter((a) => a.comment);
                if (assessments === null) {
                  return <p className="mt-4 text-sm text-ink-soft/60">লোড হচ্ছে...</p>;
                }
                if (withComments.length === 0) {
                  return <p className="mt-4 text-sm text-ink-soft/60">এখনো কোনো মন্তব্য যোগ করা হয়নি।</p>;
                }
                return (
                  <div className="mt-4 space-y-4">
                    {withComments.map((c) => (
                      <div key={c.subject} className="border-b border-line pb-4 last:border-0 last:pb-0">
                        <p className="font-label text-[11px] uppercase tracking-wide text-ink-soft/60">
                          {c.subject}
                        </p>
                        <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{c.comment}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Upcoming exams */}
            <div className="rounded-sm border border-line bg-paper p-6">
              <div className="flex items-center gap-2">
                <CalendarClock size={17} className="text-gold-deep" />
                <h2 className="font-display-bn text-lg text-ink">আসন্ন পরীক্ষা (নমুনা)</h2>
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

            {/* Fees — real */}
            <FeeSummary studentUid={profile?.linkedStudentUid} />

            <RecentNotices />
          </div>
        </div>
      </div>
    </section>
  );
}
