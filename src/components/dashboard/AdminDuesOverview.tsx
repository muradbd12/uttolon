"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Loader2, AlertCircle, Search } from "lucide-react";

type Row = {
  uid: string;
  name: string;
  className: string | null;
  admissionTotal: number;
  admissionPaid: number;
  admissionDue: number;
  latestFeeMonth: string | null;
  latestFeeDue: number;
  monthlyPaidAllTime: number;
};

export default function AdminDuesOverview() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const db = getFirebaseDb();

        const studentsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
        const students = studentsSnap.docs.map((d) => ({
          uid: d.id,
          name: (d.data().name as string) || "নাম নেই",
          className: (d.data().className as string) || null,
        }));

        const [feesSnap, admissionsSnap] = await Promise.all([
          getDocs(collection(db, "fees")),
          getDocs(collection(db, "admissions")),
        ]);

        const feesByStudent = new Map<string, { month: string; amountDue: number; discount: number; fine: number; amountPaid: number }[]>();
        feesSnap.docs.forEach((d) => {
          const data = d.data();
          const uid = data.studentUid as string;
          if (!uid) return;
          const list = feesByStudent.get(uid) || [];
          list.push({
            month: data.month,
            amountDue: data.amountDue ?? 0,
            discount: data.discount ?? 0,
            fine: data.fine ?? 0,
            amountPaid: data.amountPaid ?? 0,
          });
          feesByStudent.set(uid, list);
        });

        const admissionByStudent = new Map<string, { totalFee: number; totalPaid: number; due: number }>();
        admissionsSnap.docs.forEach((d) => {
          const data = d.data();
          const uid = data.studentUid as string | undefined;
          if (!uid) return;
          admissionByStudent.set(uid, {
            totalFee: data.totalFee ?? 0,
            totalPaid: data.totalPaid ?? 0,
            due: data.due ?? 0,
          });
        });

        const result: Row[] = students.map((s) => {
          const feeList = (feesByStudent.get(s.uid) || []).sort((a, b) => b.month.localeCompare(a.month));
          const latest = feeList[0];
          const latestDue = latest ? latest.amountDue - latest.discount + latest.fine - latest.amountPaid : 0;
          const monthlyPaidAllTime = feeList.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
          const admission = admissionByStudent.get(s.uid);

          return {
            uid: s.uid,
            name: s.name,
            className: s.className,
            admissionTotal: admission?.totalFee ?? 0,
            admissionPaid: admission?.totalPaid ?? 0,
            admissionDue: admission?.due ?? 0,
            latestFeeMonth: latest?.month ?? null,
            latestFeeDue: Math.max(latestDue, 0),
            monthlyPaidAllTime,
          };
        });

        if (!cancelled) setRows(result);
      } catch {
        if (!cancelled) setError(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="flex items-start gap-2 rounded-sm border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay">
        <AlertCircle size={15} className="mt-0.5 shrink-0" />
        তালিকা আনা যায়নি — একটু পরে আবার চেষ্টা করুন।
      </p>
    );
  }

  if (!rows) {
    return (
      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <Loader2 size={15} className="animate-spin" /> লোড হচ্ছে...
      </p>
    );
  }

  const filtered = search.trim()
    ? rows.filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase()) || (r.className || "").includes(search.trim()))
    : rows;

  const totalAdmissionDue = rows.reduce((s, r) => s + r.admissionDue, 0);
  const totalMonthlyDue = rows.reduce((s, r) => s + r.latestFeeDue, 0);
  const totalCollected = rows.reduce((s, r) => s + r.admissionPaid + r.monthlyPaidAllTime, 0);

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-sm border border-line bg-paper p-4">
          <p className="text-xs text-ink-soft/60">মোট সংগ্রহ (ভর্তি + মাসিক)</p>
          <p className="mt-1 text-xl font-bold text-teal-deep">৳{totalCollected.toLocaleString("bn-BD")}</p>
        </div>
        <div className="rounded-sm border border-line bg-paper p-4">
          <p className="text-xs text-ink-soft/60">মোট ভর্তি-ফি বকেয়া</p>
          <p className="mt-1 text-xl font-bold text-clay">৳{totalAdmissionDue.toLocaleString("bn-BD")}</p>
        </div>
        <div className="rounded-sm border border-line bg-paper p-4">
          <p className="text-xs text-ink-soft/60">মোট চলতি-মাস বকেয়া</p>
          <p className="mt-1 text-xl font-bold text-clay">৳{totalMonthlyDue.toLocaleString("bn-BD")}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-sm border border-line bg-paper px-3 py-2">
        <Search size={15} className="text-ink-soft/50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="নাম বা ক্লাস দিয়ে খুঁজুন"
          className="w-full bg-transparent text-sm text-ink outline-none"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-ink-soft/60">
              <th className="py-2 pr-3">নাম</th>
              <th className="py-2 pr-3">ক্লাস</th>
              <th className="py-2 pr-3">ভর্তি-ফি বকেয়া</th>
              <th className="py-2 pr-3">সর্বশেষ মাস</th>
              <th className="py-2 pr-3">ওই মাসের বকেয়া</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.uid} className="border-b border-line/60">
                <td className="py-2 pr-3 text-ink">{r.name}</td>
                <td className="py-2 pr-3 text-ink-soft">{r.className || "—"}</td>
                <td className={`py-2 pr-3 font-medium ${r.admissionDue > 0 ? "text-clay" : "text-teal-deep"}`}>
                  ৳{r.admissionDue.toLocaleString("bn-BD")}
                </td>
                <td className="py-2 pr-3 text-ink-soft">{r.latestFeeMonth || "—"}</td>
                <td className={`py-2 pr-3 font-medium ${r.latestFeeDue > 0 ? "text-clay" : "text-teal-deep"}`}>
                  ৳{r.latestFeeDue.toLocaleString("bn-BD")}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-ink-soft/60">
                  কেউ পাওয়া যায়নি।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
