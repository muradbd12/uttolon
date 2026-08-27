"use client";

import { useEffect, useState } from "react";
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
  UserRound,
  Sparkles,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";
import { getFirebaseDb } from "@/lib/firebase";
import RecentNotices from "@/components/dashboard/RecentNotices";
import {
  demoClassesToday,
} from "@/content/teacher-demo";

type RecoveryItem = { studentName: string; subject: string; studentClassName?: string };
type HomeworkItem = { title: string; subject: string; className: string; dueDate: string };

export default function TeacherDashboardContent() {
  const profile = useUserProfile();
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
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        {/* Preview notice — this is not a live feature yet */}
        <div className="flex items-start gap-3 rounded-sm border border-gold/30 bg-gold-soft/40 p-4">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-gold-deep" />
          <p className="text-sm leading-relaxed text-ink">
            লগইন, প্রোফাইল, উপস্থিতি, Assessment ও Recovery তালিকা এখন
            <span className="font-medium"> real</span> — শুধু আজকের ক্লাস ও নোটিশ অংশ
            এখনো নমুনা (demo) ডেটা।
          </p>
        </div>

        {/* Welcome header */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">
              Teacher Dashboard
            </p>
            <h1 className="mt-2 font-display-bn text-2xl text-ink sm:text-3xl">
              স্বাগতম, {profile?.name || "..."}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">{profile?.subject || "বিষয় যুক্ত হয়নি"}</p>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-line bg-paper px-4 py-2 text-sm text-ink-soft">
            <UserRound size={15} className="text-gold-deep" />
            Teacher
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
                    key={c.batch}
                    className="flex items-center justify-between rounded-sm border border-line px-4 py-3"
                  >
                    <div>
                      <p className="text-[15px] text-ink">{c.batch}</p>
                      <p className="text-xs text-ink-soft/70">{c.room}</p>
                    </div>
                    <span className="text-xs text-ink-soft">{c.time}</span>
                  </div>
                ))}
              </div>
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
            <div className="rounded-sm border border-line bg-paper p-6">
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
            <div className="rounded-sm border border-line bg-paper p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList size={17} className="text-gold-deep" />
                  <h2 className="font-display-bn text-lg text-ink">সাম্প্রতিক হোমওয়ার্ক</h2>
                </div>
                <Link
                  href="/teacher/homework"
                  className="rounded-sm border border-line px-3 py-1.5 text-xs text-ink hover:border-ink"
                >
                  নতুন হোমওয়ার্ক দিন
                </Link>
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
