"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, orderBy, query, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, type Timestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { AlertTriangle, Inbox, Loader2, ChevronDown, ChevronUp, Check, X, UserPlus, Printer, XCircle, Pencil, Trash2, Wallet } from "lucide-react";
import AdmissionReceiptCard from "@/components/AdmissionReceiptCard";
import PaymentVoucherCard, { type VoucherData } from "@/components/PaymentVoucherCard";
import { printIsolated } from "@/lib/printReceipt";
import { withTimeout } from "@/lib/withTimeout";

type Application = {
  id: string;
  studentNameBn?: string;
  studentNameEn?: string;
  dob?: string;
  gender?: string;
  className?: string;
  group?: string;
  rollNumber?: string;
  studentIdNumber?: string;
  religion?: string;
  nationality?: string;
  mobile?: string;
  email?: string;

  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  guardianMobile?: string;
  guardianOccupation?: string;
  monthlyIncome?: string;

  address?: string;
  thana?: string;
  district?: string;
  postCode?: string;

  previousInstitution?: string;
  examName?: string;
  passingYear?: string;
  previousResult?: string;
  weakSubjects?: string;
  specialComments?: string;

  program?: string;
  batch?: string;
  preferredSubject?: string;
  classSchedule?: string;

  referralSource?: string;
  referralOther?: string;

  totalFee?: number;
  totalPaid?: number;
  due?: number;
  monthlyFee?: number;
  shortId?: string;

  status?: "new" | "confirmed" | "rejected";
  submittedAt?: Timestamp;
};

const statusLabel: Record<string, string> = {
  new: "পর্যালোচনার অপেক্ষায়",
  confirmed: "ভর্তি নিশ্চিত",
  rejected: "প্রত্যাখ্যাত",
};

const statusClass: Record<string, string> = {
  new: "bg-gold-soft text-gold-deep",
  confirmed: "bg-teal-soft text-teal-deep",
  rejected: "bg-clay-soft text-clay",
};

function formatDate(ts?: Timestamp) {
  if (!ts) return "";
  return ts.toDate().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

function Item({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-soft/60">{label}</dt>
      <dd className="text-ink">{value || "—"}</dd>
    </div>
  );
}

const editableFields: { key: keyof Application; label: string }[] = [
  { key: "studentNameBn", label: "নাম (বাংলায়)" },
  { key: "studentNameEn", label: "নাম (ইংরেজি)" },
  { key: "dob", label: "জন্ম তারিখ" },
  { key: "gender", label: "লিঙ্গ" },
  { key: "className", label: "শ্রেণি" },
  { key: "group", label: "গ্রুপ" },
  { key: "rollNumber", label: "রোল নম্বর" },
  { key: "studentIdNumber", label: "ছাত্র/ছাত্রী আইডি" },
  { key: "religion", label: "ধর্ম" },
  { key: "nationality", label: "জাতীয়তা" },
  { key: "mobile", label: "মোবাইল" },
  { key: "email", label: "ইমেইল" },
  { key: "fatherName", label: "পিতার নাম" },
  { key: "motherName", label: "মাতার নাম" },
  { key: "guardianName", label: "অভিভাবকের নাম" },
  { key: "guardianMobile", label: "অভিভাবকের মোবাইল" },
  { key: "guardianOccupation", label: "অভিভাবকের পেশা" },
  { key: "monthlyIncome", label: "মাসিক আয়" },
  { key: "address", label: "ঠিকানা" },
  { key: "thana", label: "থানা/উপজেলা" },
  { key: "district", label: "জেলা" },
  { key: "postCode", label: "পোস্ট কোড" },
  { key: "previousInstitution", label: "পূর্ববর্তী প্রতিষ্ঠান" },
  { key: "examName", label: "পরীক্ষা" },
  { key: "passingYear", label: "পাশের সাল" },
  { key: "previousResult", label: "পূর্ববর্তী ফলাফল" },
  { key: "weakSubjects", label: "দুর্বল বিষয়" },
  { key: "specialComments", label: "বিশেষ মন্তব্য" },
  { key: "program", label: "প্রোগ্রাম" },
  { key: "batch", label: "ব্যাচ" },
  { key: "preferredSubject", label: "পছন্দের বিষয়" },
  { key: "classSchedule", label: "ক্লাস শিডিউল" },
  { key: "referralSource", label: "কিভাবে জানলেন" },
  { key: "referralOther", label: "অন্যান্য (কিভাবে জানলেন)" },
];

export default function AdminAdmissionsList() {
  const router = useRouter();
  const [apps, setApps] = useState<Application[] | null>(null);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [printingApp, setPrintingApp] = useState<Application | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Application | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [feeInput, setFeeInput] = useState("");
  const [payChoice, setPayChoice] = useState<"full" | "partial" | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("ক্যাশ (হাতে হাতে)");
  const [payBusy, setPayBusy] = useState(false);
  const [voucher, setVoucher] = useState<VoucherData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "admissions"), orderBy("submittedAt", "desc"));
        const snapshot = await getDocs(q);
        setApps(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Application)));
      } catch {
        setError(true);
      }
    }
    load();
  }, []);

  async function setStatus(id: string, status: "confirmed" | "rejected") {
    setBusyId(id);
    try {
      await updateDoc(doc(getFirebaseDb(), "admissions", id), { status });
      setApps((prev) => (prev ? prev.map((a) => (a.id === id ? { ...a, status } : a)) : prev));
    } catch {
      setError(true);
    } finally {
      setBusyId(null);
    }
  }

  function createAccountFrom(a: Application) {
    const params = new URLSearchParams({
      prefillName: a.studentNameBn || a.studentNameEn || "",
      prefillClass: a.className || "",
      prefillGuardianMobile: a.guardianMobile || "",
      prefillIdentifier: a.mobile || "",
    });
    router.push(`/admin/users?${params.toString()}`);
  }

  function startEdit(a: Application) {
    setEditDraft({ ...a });
    setEditingId(a.id);
    setExpandedId(a.id);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
  }

  async function saveEdit() {
    if (!editDraft) return;
    const id = editDraft.id;
    const fields: Record<string, string> = {};
    editableFields.forEach((f) => {
      fields[f.key as string] = (editDraft[f.key] as string) || "";
    });
    setBusyId(id);
    try {
      await updateDoc(doc(getFirebaseDb(), "admissions", id), fields);
      setApps((prev) => (prev ? prev.map((x) => (x.id === id ? { ...x, ...fields } : x)) : prev));
      setEditingId(null);
      setEditDraft(null);
    } catch {
      setError(true);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(a: Application) {
    const confirmed = window.confirm(
      `আপনি কি নিশ্চিত যে "${a.studentNameBn || a.studentNameEn || "এই আবেদনটি"}" মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।`
    );
    if (!confirmed) return;

    setBusyId(a.id);
    try {
      await withTimeout(deleteDoc(doc(getFirebaseDb(), "admissions", a.id)));
      setApps((prev) => (prev ? prev.filter((x) => x.id !== a.id) : prev));
    } catch {
      setError(true);
    } finally {
      setBusyId(null);
    }
  }

  function startPay(a: Application) {
    setPayingId(a.id);
    setFeeInput(a.totalFee ? String(a.totalFee) : "");
    setPayChoice(null);
    setPayAmount("");
    setVoucher(null);
  }

  function cancelPay() {
    setPayingId(null);
    setVoucher(null);
  }

  async function handleSetFee(a: Application) {
    const fee = Math.max(Math.round(Number(feeInput) || 0), 0);
    if (fee <= 0) return;
    setPayBusy(true);
    try {
      const paid = a.totalPaid || 0;
      await updateDoc(doc(getFirebaseDb(), "admissions", a.id), { totalFee: fee, due: fee - paid });
      setApps((prev) => (prev ? prev.map((x) => (x.id === a.id ? { ...x, totalFee: fee, due: fee - paid } : x)) : prev));
    } catch {
      setError(true);
    } finally {
      setPayBusy(false);
    }
  }

  async function handleRecordPayment(a: Application) {
    const fee = a.totalFee || 0;
    const alreadyPaid = a.totalPaid || 0;
    const due = a.due ?? fee - alreadyPaid;
    const amount = payChoice === "full" ? due : Math.min(Math.max(Math.round(Number(payAmount) || 0), 0), due);
    if (amount <= 0) return;

    setPayBusy(true);
    try {
      const newTotalPaid = alreadyPaid + amount;
      const newDue = fee - newTotalPaid;
      await withTimeout(
        addDoc(collection(getFirebaseDb(), "admissions", a.id, "payments"), {
          amount,
          method: payMethod,
          monthOrPurpose: "কিস্তি (অ্যাডমিন কর্তৃক)",
          paidAt: serverTimestamp(),
        })
      );
      await withTimeout(
        updateDoc(doc(getFirebaseDb(), "admissions", a.id), { totalPaid: newTotalPaid, due: newDue })
      );
      setApps((prev) =>
        prev ? prev.map((x) => (x.id === a.id ? { ...x, totalPaid: newTotalPaid, due: newDue } : x)) : prev
      );
      setVoucher({
        studentNameBn: a.studentNameBn,
        studentNameEn: a.studentNameEn,
        applicationId: a.shortId || a.id.slice(0, 8).toUpperCase(),
        className: a.className,
        group: a.group,
        program: a.program,
        mobile: a.mobile,
        voucherId: a.id.slice(0, 6).toUpperCase() + "-" + Date.now().toString().slice(-4),
        paymentDate: new Date().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" }),
        amountPaidNow: amount,
        method: payMethod,
        monthOrPurpose: "কিস্তি (অ্যাডমিন কর্তৃক)",
        totalFee: fee,
        totalPaid: newTotalPaid,
        due: newDue,
      });
    } catch {
      setError(true);
    } finally {
      setPayBusy(false);
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-line p-12 text-center">
        <AlertTriangle size={20} className="text-clay" />
        <p className="text-sm text-ink-soft">
          আবেদনের তালিকা আনা যায়নি — Firestore Database চালু আছে কিনা এবং
          security rules-এ অ্যাডমিনের read অনুমতি দেওয়া আছে কিনা যাচাই করুন।
        </p>
      </div>
    );
  }

  if (apps === null) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-ink-soft">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">লোড হচ্ছে...</span>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-line p-12 text-center">
        <Inbox size={20} className="text-ink-soft/40" />
        <p className="text-sm text-ink-soft/60">এখনো কোনো আবেদন জমা পড়েনি।</p>
      </div>
    );
  }

  return (
    <>
    <ul className="space-y-3 print:hidden">
      {apps.map((a) => {
        const isOpen = expandedId === a.id;
        return (
          <li key={a.id} className="rounded-sm border border-line">
            <button
              type="button"
              onClick={() => setExpandedId(isOpen ? null : a.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
            >
              <div>
                <p className="text-[15px] text-ink">{a.studentNameBn || a.studentNameEn || "—"}</p>
                <p className="mt-0.5 text-xs text-ink-soft/60">
                  {a.mobile} · {a.className} · {formatDate(a.submittedAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${statusClass[a.status || "new"]}`}>
                  {statusLabel[a.status || "new"]}
                </span>
                {isOpen ? <ChevronUp size={16} className="text-ink-soft" /> : <ChevronDown size={16} className="text-ink-soft" />}
              </div>
            </button>

            {isOpen && editingId === a.id && editDraft && (
              <div className="border-t border-line px-4 py-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gold-deep">তথ্য সম্পাদনা করুন</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {editableFields.map((f) => (
                    <label key={f.key as string} className="block text-xs">
                      <span className="text-ink-soft/70">{f.label}</span>
                      <input
                        type="text"
                        value={(editDraft[f.key] as string) || ""}
                        onChange={(e) =>
                          setEditDraft((prev) => (prev ? { ...prev, [f.key]: e.target.value } : prev))
                        }
                        className="mt-1 w-full rounded-sm border border-line bg-paper-raised px-2 py-1.5 text-[13px] text-ink outline-none focus:border-ink"
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex gap-2 border-t border-line pt-4">
                  <button
                    type="button"
                    onClick={saveEdit}
                    disabled={busyId === a.id}
                    className="flex items-center gap-1.5 rounded-sm bg-teal-deep px-4 py-2 text-xs font-medium text-paper hover:opacity-90 disabled:opacity-50"
                  >
                    {busyId === a.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} সেভ করুন
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={busyId === a.id}
                    className="rounded-sm border border-line px-4 py-2 text-xs text-ink-soft hover:border-ink hover:text-ink disabled:opacity-50"
                  >
                    বাতিল করুন
                  </button>
                </div>
              </div>
            )}

            {isOpen && editingId !== a.id && (
              <div className="border-t border-line px-4 py-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gold-deep">শিক্ষার্থীর তথ্য</p>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                  <Item label="নাম (ইংরেজি)" value={a.studentNameEn} />
                  <Item label="জন্ম তারিখ" value={a.dob} />
                  <Item label="লিঙ্গ" value={a.gender} />
                  <Item label="রোল নম্বর" value={a.rollNumber} />
                  <Item label="ছাত্র/ছাত্রী আইডি" value={a.studentIdNumber} />
                  <Item label="ধর্ম" value={a.religion} />
                  <Item label="জাতীয়তা" value={a.nationality} />
                  <Item label="ইমেইল" value={a.email} />
                </dl>

                <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-gold-deep">পিতা-মাতা / অভিভাবক</p>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                  <Item label="বাবার নাম" value={a.fatherName} />
                  <Item label="মায়ের নাম" value={a.motherName} />
                  <Item label="অভিভাবকের নাম" value={a.guardianName} />
                  <Item label="অভিভাবকের নম্বর" value={a.guardianMobile} />
                  <Item label="অভিভাবকের পেশা" value={a.guardianOccupation} />
                  <Item label="মাসিক আয়" value={a.monthlyIncome} />
                </dl>

                <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-gold-deep">ঠিকানা</p>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                  <Item label="ঠিকানা" value={a.address} />
                  <Item label="থানা/উপজেলা" value={a.thana} />
                  <Item label="জেলা" value={a.district} />
                  <Item label="পোস্ট কোড" value={a.postCode} />
                </dl>

                <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-gold-deep">একাডেমিক ও প্রোগ্রাম</p>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                  <Item label="পূর্ববর্তী প্রতিষ্ঠান" value={a.previousInstitution} />
                  <Item label="পরীক্ষা" value={a.examName} />
                  <Item label="পাশের সাল" value={a.passingYear} />
                  <Item label="পূর্ববর্তী ফলাফল" value={a.previousResult} />
                  <Item label="দুর্বল বিষয়" value={a.weakSubjects} />
                  <Item label="প্রোগ্রাম" value={a.program} />
                  <Item label="ব্যাচ" value={a.batch} />
                  <Item label="পছন্দের বিষয়" value={a.preferredSubject} />
                  <Item label="ক্লাস শিডিউল" value={a.classSchedule} />
                  <Item label="কিভাবে জানলেন" value={a.referralSource === "অন্যান্য" ? a.referralOther : a.referralSource} />
                </dl>
                {a.specialComments && (
                  <p className="mt-3 text-sm text-ink-soft">
                    <span className="text-xs text-ink-soft/60">বিশেষ মন্তব্য: </span>{a.specialComments}
                  </p>
                )}

                <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-gold-deep">পেমেন্ট</p>
                {a.totalFee ? (
                  <div className="grid grid-cols-3 gap-2 rounded-sm border border-line bg-paper-raised p-2 text-center text-xs">
                    <div>
                      <p className="text-ink-soft/60">মোট ফি</p>
                      <p className="font-bold text-ink">৳{a.totalFee.toLocaleString("bn-BD")}</p>
                    </div>
                    <div className="border-x border-line">
                      <p className="text-ink-soft/60">পরিশোধিত</p>
                      <p className="font-bold text-teal-deep">৳{(a.totalPaid || 0).toLocaleString("bn-BD")}</p>
                    </div>
                    <div>
                      <p className="text-ink-soft/60">বকেয়া</p>
                      <p className={`font-bold ${(a.due || 0) > 0 ? "text-clay" : "text-teal-deep"}`}>
                        ৳{Math.max(a.due || 0, 0).toLocaleString("bn-BD")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-ink-soft/60">এখনো ফি নির্ধারণ করা হয়নি।</p>
                )}

                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-ink-soft/60">মাসিক বেতন:</span>
                  {a.monthlyFee ? (
                    <span className="font-medium text-ink">৳{a.monthlyFee.toLocaleString("bn-BD")} / মাস</span>
                  ) : (
                    <span className="text-ink-soft/40">নির্ধারিত না</span>
                  )}
                  <input
                    type="number"
                    placeholder="নতুন/বদলানো অঙ্ক"
                    className="ml-2 w-28 rounded-sm border border-line bg-paper-raised px-2 py-1 text-xs text-ink outline-none focus:border-ink"
                    onKeyDown={async (e) => {
                      if (e.key !== "Enter") return;
                      const val = Math.max(Math.round(Number((e.target as HTMLInputElement).value) || 0), 0);
                      if (val <= 0) return;
                      await updateDoc(doc(getFirebaseDb(), "admissions", a.id), { monthlyFee: val });
                      setApps((prev) => (prev ? prev.map((x) => (x.id === a.id ? { ...x, monthlyFee: val } : x)) : prev));
                      (e.target as HTMLInputElement).value = "";
                    }}
                  />
                  <span className="text-ink-soft/40">(টাইপ করে Enter চাপুন)</span>
                </div>

                {payingId === a.id && (
                  <div className="mt-2 rounded-sm border border-gold-soft bg-gold-soft/20 p-3">
                    {voucher ? (
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-ink">পেমেন্ট রেকর্ড হয়েছে ✓</p>
                          <button type="button" onClick={cancelPay} className="text-xs text-ink-soft underline">
                            বন্ধ করুন
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => printIsolated("printable-voucher")}
                          className="mt-2 flex items-center gap-1.5 rounded-sm bg-ink px-4 py-2 text-xs font-medium text-paper hover:bg-gold-deep"
                        >
                          <Printer size={13} /> ভাউচার প্রিন্ট করুন
                        </button>
                        <div className="mt-3">
                          <PaymentVoucherCard data={voucher} />
                        </div>
                      </div>
                    ) : !a.totalFee ? (
                      <div>
                        <p className="text-sm font-medium text-ink">প্রথমে ফি নির্ধারণ করুন</p>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="number"
                            value={feeInput}
                            onChange={(e) => setFeeInput(e.target.value)}
                            placeholder="মোট ফি লিখুন"
                            className="w-32 rounded-sm border border-line bg-paper-raised px-2 py-1.5 text-sm text-ink outline-none focus:border-ink"
                          />
                          <button
                            type="button"
                            onClick={() => handleSetFee(a)}
                            disabled={payBusy}
                            className="rounded-sm bg-teal-deep px-3 py-1.5 text-xs font-medium text-paper hover:opacity-90 disabled:opacity-50"
                          >
                            ফি সেট করুন
                          </button>
                          <button type="button" onClick={cancelPay} className="text-xs text-ink-soft underline">
                            বাতিল
                          </button>
                        </div>
                      </div>
                    ) : (a.due || 0) <= 0 ? (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-teal-deep">সম্পূর্ণ পরিশোধিত — কোনো বকেয়া নেই।</p>
                        <button type="button" onClick={cancelPay} className="text-xs text-ink-soft underline">
                          বন্ধ করুন
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => { setPayChoice("full"); setPayAmount(String(a.due || 0)); }}
                            className={`rounded-sm border px-3 py-1.5 text-xs ${payChoice === "full" ? "border-ink bg-ink text-paper" : "border-line text-ink-soft"}`}
                          >
                            সম্পূর্ণ বকেয়া (৳{(a.due || 0).toLocaleString("bn-BD")})
                          </button>
                          <button
                            type="button"
                            onClick={() => { setPayChoice("partial"); setPayAmount(""); }}
                            className={`rounded-sm border px-3 py-1.5 text-xs ${payChoice === "partial" ? "border-ink bg-ink text-paper" : "border-line text-ink-soft"}`}
                          >
                            আংশিক
                          </button>
                          <button type="button" onClick={cancelPay} className="text-xs text-ink-soft underline">
                            বাতিল
                          </button>
                        </div>
                        {payChoice === "partial" && (
                          <input
                            type="number"
                            min={1}
                            max={a.due || 0}
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            placeholder="কত টাকা"
                            className="mt-2 w-40 rounded-sm border border-line bg-paper-raised px-2 py-1.5 text-sm text-ink outline-none focus:border-ink"
                          />
                        )}
                        {payChoice && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <select
                              value={payMethod}
                              onChange={(e) => setPayMethod(e.target.value)}
                              className="rounded-sm border border-line bg-paper-raised px-2 py-1.5 text-xs text-ink outline-none focus:border-ink"
                            >
                              <option>ক্যাশ (হাতে হাতে)</option>
                              <option>বিকাশ</option>
                              <option>নগদ (Nagad)</option>
                              <option>রকেট</option>
                              <option>ব্যাংক ট্রান্সফার</option>
                              <option>অন্যান্য</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleRecordPayment(a)}
                              disabled={payBusy || (payChoice === "partial" && (!payAmount || Number(payAmount) <= 0))}
                              className="flex items-center gap-1.5 rounded-sm bg-teal-deep px-4 py-1.5 text-xs font-medium text-paper hover:opacity-90 disabled:opacity-50"
                            >
                              {payBusy && <Loader2 size={12} className="animate-spin" />} পেমেন্ট নিশ্চিত করুন
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                  <button
                    type="button"
                    onClick={() => setPrintingApp(a)}
                    className="flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink"
                  >
                    <Printer size={13} /> রশিদ দেখুন / প্রিন্ট করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => (payingId === a.id ? cancelPay() : startPay(a))}
                    className="flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink"
                  >
                    <Wallet size={13} /> পেমেন্ট নিন
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(a)}
                    className="flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink"
                  >
                    <Pencil size={13} /> সম্পাদনা করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a)}
                    disabled={busyId === a.id}
                    className="flex items-center gap-1.5 rounded-sm border border-clay/40 px-3 py-1.5 text-xs text-clay hover:bg-clay-soft disabled:opacity-50"
                  >
                    <Trash2 size={13} /> ডিলেট করুন
                  </button>
                  {(!a.status || a.status === "new") && (
                    <>
                      <button
                        type="button"
                        onClick={() => setStatus(a.id, "confirmed")}
                        disabled={busyId === a.id}
                        className="flex items-center gap-1.5 rounded-sm bg-teal-deep px-3 py-1.5 text-xs font-medium text-paper hover:opacity-90 disabled:opacity-50"
                      >
                        <Check size={13} /> ভর্তি নিশ্চিত করুন
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(a.id, "rejected")}
                        disabled={busyId === a.id}
                        className="flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-clay hover:text-clay disabled:opacity-50"
                      >
                        <X size={13} /> প্রত্যাখ্যান করুন
                      </button>
                    </>
                  )}
                  {a.status === "confirmed" && (
                    <button
                      type="button"
                      onClick={() => createAccountFrom(a)}
                      className="flex items-center gap-1.5 rounded-sm bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-gold-deep"
                    >
                      <UserPlus size={13} /> লগইন অ্যাকাউন্ট তৈরি করুন
                    </button>
                  )}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>

    {printingApp && (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-2 sm:p-4 print:static print:bg-white print:p-0">
        <div className="fixed right-4 top-4 z-50 flex gap-3 print:hidden">
          <button
            type="button"
            onClick={() => printIsolated("printable-receipt")}
            className="flex items-center gap-2 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold-deep"
          >
            <Printer size={15} /> প্রিন্ট / PDF ডাউনলোড
          </button>
          <button
            type="button"
            onClick={() => setPrintingApp(null)}
            className="flex items-center gap-2 rounded-sm bg-ink-soft px-4 py-2 text-sm font-medium text-paper hover:opacity-90"
          >
            <XCircle size={15} /> বন্ধ করুন
          </button>
        </div>
        <div className="mx-auto max-w-[210mm] pt-16 print:pt-0">
          <AdmissionReceiptCard
            data={printingApp}
            applicationId={printingApp.id.slice(0, 8).toUpperCase()}
            dateLabel={formatDate(printingApp.submittedAt)}
          />
        </div>
      </div>
    )}
    </>
  );
}