"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { AlertTriangle, Loader2, Search } from "lucide-react";
import { currentMonthKey, monthLabel, type MonthlyDue } from "@/lib/monthlyDues";

type Admission = {
  id: string;
  studentNameBn?: string;
  studentNameEn?: string;
  mobile?: string;
  className?: string;
  program?: string;
  status?: "new" | "confirmed" | "rejected";
  totalFee?: number;
  totalPaid?: number;
  due?: number;
  monthlyFee?: number;
};

function fmtTaka(n: number) {
  return `৳${n.toLocaleString("bn-BD")}`;
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "teal" | "clay" | "gold" | "ink" }) {
  const toneClass = {
    teal: "text-teal-deep",
    clay: "text-clay",
    gold: "text-gold-deep",
    ink: "text-ink",
  }[tone];
  return (
    <div className="rounded-sm border border-line bg-paper p-4">
      <p className="text-xs text-ink-soft/60">{label}</p>
      <p className={`mt-1 font-display-en text-xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

export default function AdminPaymentsOverview() {
  const [admissions, setAdmissions] = useState<Admission[] | null>(null);
  const [monthDues, setMonthDues] = useState<Record<string, MonthlyDue>>({});
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const month = currentMonthKey();

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const admQ = query(collection(db, "admissions"), orderBy("submittedAt", "desc"));
        const admSnap = await getDocs(admQ);
        const admList = admSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Admission));
        setAdmissions(admList);

        const duesQ = query(collection(db, "monthlyDues"), where("month", "==", month));
        const duesSnap = await getDocs(duesQ);
        const map: Record<string, MonthlyDue> = {};
        duesSnap.docs.forEach((d) => {
          const data = d.data() as Omit<MonthlyDue, "id">;
          map[data.admissionId] = { id: d.id, ...data };
        });
        setMonthDues(map);
      } catch {
        setError(true);
      }
    }
    load();
  }, [month]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-line p-12 text-center">
        <AlertTriangle size={20} className="text-clay" />
        <p className="text-sm text-ink-soft">তথ্য আনা যায়নি — Firestore ও security rules যাচাই করুন।</p>
      </div>
    );
  }

  if (admissions === null) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-ink-soft">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">লোড হচ্ছে...</span>
      </div>
    );
  }

  const confirmedOrNew = admissions.filter((a) => a.status !== "rejected");
  const admissionDueTotal = confirmedOrNew.reduce((sum, a) => sum + Math.max(a.due || 0, 0), 0);
  const admissionPaidTotal = confirmedOrNew.reduce((sum, a) => sum + (a.totalPaid || 0), 0);
  const monthCollected = Object.values(monthDues).reduce((sum, d) => sum + (d.amountPaid || 0), 0);
  const monthDueTotal = Object.values(monthDues).reduce((sum, d) => sum + Math.max((d.amountDue || 0) - (d.amountPaid || 0), 0), 0);
  const studentsWithDue = confirmedOrNew.filter((a) => (a.due || 0) > 0).length;

  const filtered = confirmedOrNew.filter((a) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      (a.studentNameBn || "").toLowerCase().includes(q) ||
      (a.studentNameEn || "").toLowerCase().includes(q) ||
      (a.mobile || "").includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="ভর্তি ফি — মোট আদায়" value={fmtTaka(admissionPaidTotal)} tone="teal" />
        <StatCard label="ভর্তি ফি — মোট বকেয়া" value={fmtTaka(admissionDueTotal)} tone="clay" />
        <StatCard label={`${monthLabel(month)} — বেতন আদায়`} value={fmtTaka(monthCollected)} tone="teal" />
        <StatCard label={`${monthLabel(month)} — বেতন বকেয়া`} value={fmtTaka(monthDueTotal)} tone="gold" />
      </div>
      <p className="text-sm text-ink-soft">
        মোট <strong className="text-ink">{confirmedOrNew.length}</strong> জন শিক্ষার্থীর মধ্যে{" "}
        <strong className="text-clay">{studentsWithDue}</strong> জনের ভর্তি ফি বকেয়া আছে।
      </p>

      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="নাম বা মোবাইল দিয়ে খুঁজুন"
          className="w-full rounded-sm border border-line bg-paper-raised py-2.5 pl-9 pr-3 text-sm text-ink outline-none focus:border-ink"
        />
      </div>

      <div className="overflow-x-auto rounded-sm border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper-raised text-xs text-ink-soft/70">
            <tr>
              <th className="px-3 py-2">নাম</th>
              <th className="px-3 py-2">মোবাইল</th>
              <th className="px-3 py-2">ভর্তি ফি বকেয়া</th>
              <th className="px-3 py-2">{monthLabel(month)}-এর বেতন</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const due = Math.max(a.due || 0, 0);
              const md = monthDues[a.id];
              return (
                <tr key={a.id} className="border-t border-line">
                  <td className="px-3 py-2 text-ink">{a.studentNameBn || a.studentNameEn || "—"}</td>
                  <td className="px-3 py-2 text-ink-soft">{a.mobile || "—"}</td>
                  <td className="px-3 py-2">
                    <span className={due > 0 ? "font-medium text-clay" : "text-teal-deep"}>{fmtTaka(due)}</span>
                  </td>
                  <td className="px-3 py-2">
                    {md ? (
                      <span
                        className={
                          md.status === "paid"
                            ? "text-teal-deep"
                            : md.status === "partial"
                            ? "font-medium text-gold-deep"
                            : "font-medium text-clay"
                        }
                      >
                        {fmtTaka(md.amountPaid)} / {fmtTaka(md.amountDue)}
                      </span>
                    ) : a.monthlyFee ? (
                      <span className="text-ink-soft/60">এখনো নেওয়া হয়নি</span>
                    ) : (
                      <span className="text-ink-soft/40">মাসিক ফি নির্ধারিত না</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-ink-soft/60">
                  কোনো ফলাফল নেই।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink-soft/50">
        বিস্তারিত পেমেন্ট রেকর্ড করতে বা এডিট করতে "ভর্তি আবেদন" তালিকায় গিয়ে সংশ্লিষ্ট শিক্ষার্থীর "পেমেন্ট নিন" বাটন ব্যবহার করুন।
      </p>
    </div>
  );
}
