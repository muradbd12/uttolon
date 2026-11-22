"use client";

import { useEffect, useState } from "react";
import RoleWelcome from "@/components/dashboard/RoleWelcome";
import Link from "next/link";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import {
  CalendarDays,
  ClipboardList,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";
import { useTodaySchedule } from "@/lib/useTodaySchedule";
import { getFirebaseDb } from "@/lib/firebase";
import RecentNotices from "@/components/dashboard/RecentNotices";

type RecoveryItem = { studentName: string; subject: string; studentClassName?: string };
type HomeworkItem = { title: string; subject: string; className: string; dueDate: string };

export default function TeacherDashboardContent() {
  const profile = useUserProfile();
  const todaySchedule = useTodaySchedule({ field: "teacherUid", value: profile?.uid });
  const [recoveryList, setRecoveryList] = useState<RecoveryItem[] | null>(null);
  const [homework, setHomework] = useState<HomeworkItem[] | null>(null);

  useEffect(() => {
    async function loadRecovery() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "assessments"), where("recoveryActive", "==", true));
        const snapshot = await getDocs(q);
        setRecoveryList(
          snapshot.docs.map((d) => ({
            studentName: d.data().studentName || "নাম নেই",
            subject: d.data().subject || "",
            studentClassName: d.data().studentClassName || undefined,
          }))
        );
      } catch {
        setRecoveryList([]);
      }
    }
    async function loadHomework() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "homework"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setHomework(snapshot.docs.slice(0, 5).map((d) => d.data() as HomeworkItem));
      } catch {
        setHomework([]);
      }
    }
    loadRecovery();
    loadHomework();
  }, []);

  return (
    <section style={{ background: "linear-gradient(180deg, #eaf3f6 0%, #f4f7fb 38%, #fbfbf7 100%)" }}>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <RoleWelcome
          role="teacher"
          name={profile?.name}
          line={profile?.subject || "বিষয় যুক্ত হয়নি"}
          chip={"Teacher"}
        />

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
                        <p className="text-[15px] text-ink">
                          {c.className} — {c.subject}
                        </p>
                        <p className="text-xs text-ink-soft/70">{c.room}</p>
                      </div>
                      <span className="text-xs text-ink-soft">
                        {c.startTime}–{c.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/teacher/attendance"
                  className="flex w-fit items-center gap-1.5 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold-deep"
                >
                  <CheckSquare size={14} /> উপস্থিতি নিন
                </Link>
                <Link
                  href="/teacher/assessments"
                  className="flex w-fit items-center gap-1.5 rounded-sm border border-ink px-4 py-2 text-sm font-medium text-ink hover:bg-paper-raised"
                >
                  <ClipboardList size={14} /> মূল্যায়ন দিন
                </Link>
              </div>
            </div>

            {/* Students needing recovery attention — real */}
            <div className="rounded-xl border border-line bg-white p-6 shadow-sm" style={{ borderTop: "4px solid #f43f5e" }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={17} className="text-clay" />
                <h2 className="font-display-bn text-lg text-ink">Recovery প্রয়োজন এমন শিক্ষার্থী</h2>
              </div>
              {recoveryList === null ? (
                <p className="mt-4 text-sm text-ink-soft/60">লোড হচ্ছে...</p>
              ) : recoveryList.length === 0 ? (
                <p className="mt-4 text-sm text-ink-soft/60">এই মুহূর্তে Recovery প্রয়োজন এমন কেউ নেই।</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {recoveryList.map((s, i) => (
                    <div
                      key={`${s.studentName}-${s.subject}-${i}`}
                      className="flex items-center justify-between rounded-sm border border-line px-4 py-3"
                    >
                      <div>
                        <p className="text-[15px] text-ink">{s.studentName}</p>
                        <p className="text-xs text-ink-soft/70">
                          {s.subject} {s.studentClassName ? `— ${s.studentClassName}` : ""}
                        </p>
                      </div>
                      <span className="rounded-sm bg-teal-soft px-2 py-0.5 text-xs font-medium text-teal-deep">
                        Recovery: Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Homework assigned — real */}
            <div className="rounded-xl border border-line bg-white p-6 shadow-sm" style={{ borderTop: "4px solid #10b981" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList size={17} className="text-gold-deep" />
                  <h2 className="font-display-bn text-lg text-ink">সাম্প্রতিক হোমওয়ার্ক</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/teacher/submissions"
                    className="rounded-sm bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-gold-deep"
                  >
                    জমা পড়া হোমওয়ার্ক
                  </Link>
                  <Link
                    href="/teacher/homework"
                    className="rounded-sm border border-line px-3 py-1.5 text-xs text-ink hover:border-ink"
                  >
                    নতুন হোমওয়ার্ক দিন
                  </Link>
                  <Link
                    href="/teacher/quizzes"
                    className="rounded-sm border border-ink px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink hover:text-paper"
                  >
                    অনলাইন MCQ টেস্ট
                  </Link>
                  <Link
                    href="/teacher/quran"
                    className="rounded-sm border border-line px-3 py-1.5 text-xs text-ink hover:border-ink"
                  >
                    কুরআন অগ্রগতি
                  </Link>
                </div>
              </div>
              {homework === null ? (
                <p className="mt-4 text-sm text-ink-soft/60">লোড হচ্ছে...</p>
              ) : homework.length === 0 ? (
                <p className="mt-4 text-sm text-ink-soft/60">এখনো কোনো হোমওয়ার্ক দেওয়া হয়নি।</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {homework.map((h, i) => (
                    <div key={`${h.title}-${i}`} className="rounded-sm border border-line px-4 py-3">
                      <p className="font-label text-[11px] uppercase tracking-wide text-ink-soft/60">
                        {h.className} — {h.subject}
                      </p>
                      <p className="mt-1 text-[15px] text-ink">{h.title}</p>
                      <p className="mt-1 text-xs text-ink-soft/60">জমার সময়সীমা: {h.dueDate}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <RecentNotices />
          </div>
        </div>
      </div>
    </section>
  );
}
