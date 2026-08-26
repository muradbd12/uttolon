"use client";

import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  Bell,
  UserRound,
  Sparkles,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";
import {
  demoClassesToday,
  demoRecoveryStudents,
  demoHomeworkAssigned,
  demoNotices,
} from "@/content/teacher-demo";

export default function TeacherDashboardContent() {
  const profile = useUserProfile();

  return (
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        {/* Preview notice — this is not a live feature yet */}
        <div className="flex items-start gap-3 rounded-sm border border-gold/30 bg-gold-soft/40 p-4">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-gold-deep" />
          <p className="text-sm leading-relaxed text-ink">
            লগইন ও প্রোফাইল এখন <span className="font-medium">real</span> — উপস্থিতিও এখন
            সত্যিকারের ডেটাবেসে সংরক্ষিত হয়। Recovery/হোমওয়ার্ক অংশ এখনো নমুনা (demo)
            ডেটা, পরের ধাপে real হবে।
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
              <Link
                href="/teacher/attendance"
                className="mt-4 flex w-fit items-center gap-1.5 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold-deep"
              >
                <CheckSquare size={14} /> উপস্থিতি নিন
              </Link>
            </div>

            {/* Students needing recovery attention */}
            <div className="rounded-sm border border-line bg-paper p-6">
              <div className="flex items-center gap-2">
                <AlertTriangle size={17} className="text-clay" />
                <h2 className="font-display-bn text-lg text-ink">Recovery প্রয়োজন এমন শিক্ষার্থী (নমুনা)</h2>
              </div>
              <div className="mt-4 space-y-3">
                {demoRecoveryStudents.map((s) => (
                  <div
                    key={s.studentId}
                    className="flex items-center justify-between rounded-sm border border-line px-4 py-3"
                  >
                    <div>
                      <p className="text-[15px] text-ink">{s.studentId}</p>
                      <p className="text-xs text-ink-soft/70">{s.subject} — {s.weakArea}</p>
                    </div>
                    <span className="rounded-sm bg-teal-soft px-2 py-0.5 text-xs font-medium text-teal-deep">
                      Recovery: Active
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Homework assigned */}
            <div className="rounded-sm border border-line bg-paper p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList size={17} className="text-gold-deep" />
                  <h2 className="font-display-bn text-lg text-ink">সাম্প্রতিক হোমওয়ার্ক (নমুনা)</h2>
                </div>
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-sm border border-line px-3 py-1.5 text-xs text-ink-soft/50"
                >
                  নতুন হোমওয়ার্ক দিন (শীঘ্রই)
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {demoHomeworkAssigned.map((h) => (
                  <div key={h.title} className="rounded-sm border border-line px-4 py-3">
                    <p className="font-label text-[11px] uppercase tracking-wide text-ink-soft/60">
                      {h.batch}
                    </p>
                    <p className="mt-1 text-[15px] text-ink">{h.title}</p>
                    <p className="mt-1 text-xs text-ink-soft/60">দেওয়া হয়েছে: {h.assignedOn}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
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
