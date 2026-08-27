"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type StudentOption = { uid: string; name: string; className: string | null };
type FeeEntry = {
  month: string;
  amountDue: number;
  discount: number;
  fine: number;
  amountPaid: number;
  paymentMethod: string;
  transactionNumber?: string;
  status: "paid" | "partial" | "due";
};

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

const paymentMethods = ["নগদ টাকা (Cash)", "bKash", "Nagad", "ব্যাংক (Bank)", "অন্যান্য"];

function computeStatus(due: number, discount: number, fine: number, paid: number): FeeEntry["status"] {
  const payable = due - discount + fine;
  if (paid <= 0) return "due";
  if (paid >= payable) return "paid";
  return "partial";
}

const statusLabel: Record<FeeEntry["status"], string> = {
  paid: "পরিশোধিত",
  partial: "আংশিক পরিশোধিত",
  due: "বাকি",
};

const statusClass: Record<FeeEntry["status"], string> = {
  paid: "bg-teal-soft text-teal-deep",
  partial: "bg-gold-soft text-gold-deep",
  due: "bg-clay-soft text-clay",
};

export default function AdminFeeForm() {
  const [students, setStudents] = useState<StudentOption[] | null>(null);
  const [selectedUid, setSelectedUid] = useState("");
  const [entries, setEntries] = useState<FeeEntry[] | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "users"), where("role", "==", "student"));
        const snapshot = await getDocs(q);
        setStudents(
          snapshot.docs.map((d) => ({
            uid: d.id,
            name: (d.data().name as string) || "নাম নেই",
            className: (d.data().className as string) || null,
          }))
        );
      } catch {
        setStudents([]);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedUid) {
      queueMicrotask(() => setEntries(null));
      return;
    }
    async function loadEntries() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "fees"), where("studentUid", "==", selectedUid));
        const snapshot = await getDocs(q);
        setEntries(
          snapshot.docs
            .map((d) => d.data() as FeeEntry)
            .sort((a, b) => b.month.localeCompare(a.month))
        );
      } catch {
        setEntries([]);
      }
    }
    loadEntries();
  }, [selectedUid, status]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUid) return;
    setStatus("saving");
    const form = new FormData(e.currentTarget);
    const month = form.get("month") as string;
    if (!month) {
      setStatus("error");
      return;
    }
    const amountDue = Number(form.get("amountDue")) || 0;
    const discount = Number(form.get("discount")) || 0;
    const fine = Number(form.get("fine")) || 0;
    const amountPaid = Number(form.get("amountPaid")) || 0;

    try {
      const authInstance = getFirebaseAuth();
      const db = getFirebaseDb();
      const student = students?.find((s) => s.uid === selectedUid);
      await setDoc(doc(db, "fees", `${selectedUid}_${month}`), {
        studentUid: selectedUid,
        studentName: student?.name || null,
        month,
        amountDue,
        discount,
        fine,
        amountPaid,
        paymentMethod: (form.get("paymentMethod") as string) || "",
        transactionNumber: (form.get("transactionNumber") as string)?.trim() || "",
        status: computeStatus(amountDue, discount, fine, amountPaid),
        recordedBy: authInstance.currentUser?.uid || null,
        updatedAt: serverTimestamp(),
      });
      (e.target as HTMLFormElement).reset();
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <label className="block">
        <span className="text-sm font-medium text-ink">শিক্ষার্থী নির্বাচন করুন</span>
        <select
          value={selectedUid}
          onChange={(e) => {
            setSelectedUid(e.target.value);
            setStatus("idle");
          }}
          className={`mt-1.5 ${inputClass}`}
        >
          <option value="">{students === null ? "লোড হচ্ছে..." : "নির্বাচন করুন"}</option>
          {students?.map((s) => (
            <option key={s.uid} value={s.uid}>
              {s.name} {s.className ? `— ${s.className}` : ""}
            </option>
          ))}
        </select>
      </label>

      {selectedUid && (
        <>
          {entries && entries.length > 0 && (
            <div className="overflow-x-auto rounded-sm border border-line">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-line bg-paper-raised text-left text-ink-soft">
                    <th className="px-4 py-2 font-normal">মাস</th>
                    <th className="px-4 py-2 font-normal">বকেয়া</th>
                    <th className="px-4 py-2 font-normal">ছাড়</th>
                    <th className="px-4 py-2 font-normal">জরিমানা</th>
                    <th className="px-4 py-2 font-normal">পরিশোধিত</th>
                    <th className="px-4 py-2 font-normal">অবস্থা</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((en) => (
                    <tr key={en.month} className="border-b border-line last:border-0">
                      <td className="px-4 py-2 text-ink">{en.month}</td>
                      <td className="px-4 py-2 text-ink-soft">{en.amountDue}</td>
                      <td className="px-4 py-2 text-ink-soft">{en.discount}</td>
                      <td className="px-4 py-2 text-ink-soft">{en.fine}</td>
                      <td className="px-4 py-2 text-ink-soft">{en.amountPaid}</td>
                      <td className="px-4 py-2">
                        <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${statusClass[en.status]}`}>
                          {statusLabel[en.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-line bg-paper p-6">
            <h3 className="font-display-bn text-base text-ink">মাসিক ফি রেকর্ড করুন</h3>

            {status === "error" && (
              <div className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
                <AlertCircle size={14} /> মাস নির্বাচন করুন, তারপর আবার চেষ্টা করুন।
              </div>
            )}
            {status === "saved" && (
              <div className="flex items-center gap-2 rounded-sm border border-teal/30 bg-teal-soft px-3 py-2 text-sm text-teal-deep">
                <CheckCircle2 size={14} /> সংরক্ষিত হয়েছে।
              </div>
            )}

            <label className="block w-fit">
              <span className="text-xs text-ink-soft">মাস</span>
              <input required name="month" type="month" className={`mt-1 ${inputClass}`} />
            </label>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="block">
                <span className="text-xs text-ink-soft">বকেয়া (Due)</span>
                <input required name="amountDue" type="number" min={0} className={`mt-1 ${inputClass}`} />
              </label>
              <label className="block">
                <span className="text-xs text-ink-soft">ছাড় (Discount)</span>
                <input name="discount" type="number" min={0} defaultValue={0} className={`mt-1 ${inputClass}`} />
              </label>
              <label className="block">
                <span className="text-xs text-ink-soft">জরিমানা (Fine)</span>
                <input name="fine" type="number" min={0} defaultValue={0} className={`mt-1 ${inputClass}`} />
              </label>
              <label className="block">
                <span className="text-xs text-ink-soft">পরিশোধিত (Paid)</span>
                <input name="amountPaid" type="number" min={0} defaultValue={0} className={`mt-1 ${inputClass}`} />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs text-ink-soft">পেমেন্ট পদ্ধতি</span>
                <select name="paymentMethod" className={`mt-1 ${inputClass}`} defaultValue="">
                  <option value="" disabled>
                    নির্বাচন করুন
                  </option>
                  {paymentMethods.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-ink-soft">Transaction Number (ঐচ্ছিক)</span>
                <input name="transactionNumber" type="text" className={`mt-1 ${inputClass}`} />
              </label>
            </div>

            <button
              type="submit"
              disabled={status === "saving"}
              className="flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
            >
              {status === "saving" && <Loader2 size={14} className="animate-spin" />}
              সংরক্ষণ করুন
            </button>
          </form>
        </>
      )}
    </div>
  );
}
