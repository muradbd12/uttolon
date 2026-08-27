"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

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
    { label: "মোট শিক্ষার্থী", value: stats?.totalStudents },
    { label: "মোট শিক্ষক", value: stats?.totalTeachers },
    { label: "এই মাসে নতুন ভর্তি", value: stats?.newAdmissionsThisMonth },
    {
      label: "গড় উপস্থিতি",
      value: stats?.avgAttendance !== null && stats?.avgAttendance !== undefined ? `${stats.avgAttendance}%` : "—",
    },
    { label: "Recovery-তে থাকা শিক্ষার্থী", value: stats?.recoveryCount },
    { label: "ফি সংগ্রহ (এই মাসে)", value: stats?.feeCollectedThisMonth },
  ];

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((s) => (
        <div key={s.label} className="rounded-sm border border-line bg-paper p-4">
          <p className="font-display-en text-2xl text-ink">
            {stats === null ? "…" : (s.value ?? "—")}
          </p>
          <p className="mt-1 text-xs leading-snug text-ink-soft">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
