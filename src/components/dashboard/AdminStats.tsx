"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Users, GraduationCap, UserPlus, CalendarCheck, LifeBuoy, Wallet } from "lucide-react";
import { PALETTE, grad } from "@/lib/dashboardColors";

type Stats = {
  totalStudents: number;
  totalTeachers: number;
  newAdmissionsThisMonth: number;
  avgAttendance: number | null;
  recoveryCount: number;
  feeCollectedThisMonth: number;
};

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const currentMonth = new Date().toISOString().slice(0, 7);

        const [usersSnap, attendanceSnap, assessmentsSnap, feesSnap, admissionsSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "attendance")),
          getDocs(collection(db, "assessments")),
          getDocs(collection(db, "fees")),
          getDocs(collection(db, "admissions")),
        ]);

        const totalStudents = usersSnap.docs.filter((d) => d.data().role === "student").length;
        const totalTeachers = usersSnap.docs.filter((d) => d.data().role === "teacher").length;

        const presentCount = attendanceSnap.docs.filter((d) => d.data().status === "present").length;
        const avgAttendance =
          attendanceSnap.size > 0 ? Math.round((presentCount / attendanceSnap.size) * 100) : null;

        const recoverySet = new Set(
          assessmentsSnap.docs
            .filter((d) => d.data().recoveryActive)
            .map((d) => d.data().studentUid)
        );

        const feeCollectedThisMonth = feesSnap.docs
          .filter((d) => d.data().month === currentMonth)
          .reduce((sum, d) => sum + (Number(d.data().amountPaid) || 0), 0);

        const newAdmissionsThisMonth = admissionsSnap.docs.filter((d) => {
          const ts = d.data().submittedAt;
          if (!ts?.toDate) return false;
          return (ts.toDate() as Date).toISOString().slice(0, 7) === currentMonth;
        }).length;

        setStats({
          totalStudents,
          totalTeachers,
          newAdmissionsThisMonth,
          avgAttendance,
          recoveryCount: recoverySet.size,
          feeCollectedThisMonth,
        });
      } catch {
        setStats({
          totalStudents: 0,
          totalTeachers: 0,
          newAdmissionsThisMonth: 0,
          avgAttendance: null,
          recoveryCount: 0,
          feeCollectedThisMonth: 0,
        });
      }
    }
    load();
  }, []);

  const items = [
    { label: "মোট শিক্ষার্থী", value: stats?.totalStudents, icon: Users, color: PALETTE[0] },
    { label: "মোট শিক্ষক", value: stats?.totalTeachers, icon: GraduationCap, color: PALETTE[1] },
    { label: "এই মাসে নতুন ভর্তি", value: stats?.newAdmissionsThisMonth, icon: UserPlus, color: PALETTE[2] },
    {
      label: "গড় উপস্থিতি",
      value:
        stats?.avgAttendance !== null && stats?.avgAttendance !== undefined ? `${stats.avgAttendance}%` : "—",
      icon: CalendarCheck,
      color: PALETTE[3],
    },
    { label: "Recovery-তে থাকা শিক্ষার্থী", value: stats?.recoveryCount, icon: LifeBuoy, color: PALETTE[4] },
    {
      label: "ফি সংগ্রহ (এই মাসে)",
      value:
        stats?.feeCollectedThisMonth !== undefined
          ? `৳${stats.feeCollectedThisMonth.toLocaleString("bn-BD")}`
          : undefined,
      icon: Wallet,
      color: PALETTE[5],
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
      {items.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="group relative overflow-hidden rounded-xl p-4 text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl sm:p-5"
            style={{ background: grad(s.color) }}
          >
            <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 transition-transform group-hover:scale-110" />
            <span className="pointer-events-none absolute -bottom-10 -right-3 h-20 w-20 rounded-full bg-white/10" />
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/25">
              <Icon size={18} />
            </span>
            <p className="relative mt-3 font-display-en text-3xl font-semibold leading-none">
              {stats === null ? "…" : (s.value ?? "—")}
            </p>
            <p className="relative mt-1.5 text-xs font-medium leading-snug text-white/90 sm:text-sm">{s.label}</p>
          </div>
        );
      })}
    </div>
  );
}
