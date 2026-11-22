"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import {
  ClipboardList,
  MessageSquareText,
  Users,
} from "lucide-react";
import ProgressRow from "@/components/ProgressRow";
import { useUserProfile, getLinkedStudentUids } from "@/lib/useUserProfile";
import { useAttendanceSummary } from "@/lib/useAttendanceSummary";
import { useAssessments } from "@/lib/useAssessments";
import { getFirebaseDb } from "@/lib/firebase";
import RecentNotices from "@/components/dashboard/RecentNotices";
import FeeSummary from "@/components/dashboard/FeeSummary";
import AdmissionFeeSummary from "@/components/dashboard/AdmissionFeeSummary";
import ProgressReport from "@/components/dashboard/ProgressReport";
import QuranProgressCard from "@/components/dashboard/QuranProgressCard";
import CertificatesCard from "@/components/dashboard/CertificatesCard";
import GuardianChildActivity from "@/components/dashboard/GuardianChildActivity";
import ProgressTrend from "@/components/dashboard/ProgressTrend";
import RoleWelcome from "@/components/dashboard/RoleWelcome";
import DashboardAlerts from "@/components/dashboard/DashboardAlerts";

type ChildProfile = { uid: string; name?: string; className?: string; identifier?: string; studentId?: string };

export default function GuardianDashboardContent() {
  const profile = useUserProfile();
  const linkedUids = getLinkedStudentUids(profile);
  const [children, setChildren] = useState<ChildProfile[] | null>(null);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  const attendance = useAttendanceSummary(selectedUid);
  const assessments = useAssessments(selectedUid);

  useEffect(() => {
    if (linkedUids.length === 0) return;
    let cancelled = false;
    async function loadChildren() {
      try {
        const results = await Promise.all(
          linkedUids.map(async (uid) => {
            const snap = await getDoc(doc(getFirebaseDb(), "users", uid));
            return { uid, ...(snap.exists() ? (snap.data() as Omit<ChildProfile, "uid">) : {}) };
          })
        );
        if (!cancelled) {
          setChildren(results);
          setSelectedUid((prev) => prev || results[0]?.uid || null);
        }
      } catch {
        if (!cancelled) setChildren([]);
      }
    }
    loadChildren();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedUids.join(",")]);

  const selectedChild = children?.find((c) => c.uid === selectedUid) || null;

  return (
    <section style={{ background: "linear-gradient(180deg, #eaf3f6 0%, #f4f7fb 38%, #fbfbf7 100%)" }}>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <RoleWelcome
          role="guardian"
          name={profile?.name}
          line={`সন্তান: ${selectedChild?.name || "..."}${selectedChild?.className ? ` · ${selectedChild.className}` : ""}${selectedChild?.studentId ? ` · ID: ${selectedChild.studentId}` : ""}`}
          chip={selectedChild?.identifier || "Student"}
        />

        {/* একাধিক সন্তান থাকলে বেছে নেওয়ার অপশন */}
        {children && children.length > 1 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-ink-soft/70">
              <Users size={14} /> সন্তান বেছে নিন:
            </span>
            {children.map((c) => (
              <button
                key={c.uid}
                type="button"
                onClick={() => setSelectedUid(c.uid)}
                className={`rounded-sm border px-3.5 py-1.5 text-sm ${
                  selectedUid === c.uid ? "border-ink bg-ink text-paper" : "border-line text-ink-soft"
                }`}
              >
                {c.name || "শিক্ষার্থী"}
              </button>
            ))}
          </div>
        )}

        {/* সতর্কতা — অনুপস্থিতি ও ফি বাকি থাকলে */}
        <div className="mt-6">
          <DashboardAlerts studentUid={selectedUid} subjectLabel="সন্তান" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Assessment summary — real */}
            <div className="rounded-xl border border-line bg-white p-6 shadow-sm" style={{ borderTop: "4px solid #8b5cf6" }}>
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
            <div className="rounded-xl border border-line bg-white p-6 shadow-sm" style={{ borderTop: "4px solid #10b981" }}>
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
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Attendance — real */}
            <div className="rounded-xl border border-line bg-white p-6 shadow-sm" style={{ borderTop: "4px solid #3b82f6" }}>
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
            <FeeSummary studentUid={selectedUid} studentName={selectedChild?.name} className={selectedChild?.className} studentId={selectedChild?.studentId} />
            <AdmissionFeeSummary studentUid={selectedUid} />

            <RecentNotices />
          </div>

          <div className="mt-6">
            <GuardianChildActivity studentUid={selectedUid} className={selectedChild?.className} childName={selectedChild?.name} />
          </div>

          <div className="mt-6">
            <QuranProgressCard studentUid={selectedUid} />
          </div>

          <div className="mt-6">
            <CertificatesCard studentUid={selectedUid} />
          </div>

          <div className="mt-6">
            <ProgressTrend studentUid={selectedUid} />
          </div>

          <div className="mt-6">
            <ProgressReport
              studentUid={selectedUid}
              studentName={selectedChild?.name}
              studentId={selectedChild?.studentId}
              className={selectedChild?.className}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
