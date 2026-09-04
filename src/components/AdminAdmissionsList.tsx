"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, orderBy, query, doc, updateDoc, deleteDoc, type Timestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { AlertTriangle, Inbox, Loader2, ChevronDown, ChevronUp, Check, X, UserPlus, Printer, XCircle, Pencil, Trash2 } from "lucide-react";
import AdmissionReceiptCard from "@/components/AdmissionReceiptCard";

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
    const name = a.studentNameBn || a.studentNameEn || "এই আবেদন";
    const sure = window.confirm(`আপনি কি নিশ্চিত "${name}"-এর আবেদনটি স্থায়ীভাবে ডিলেট করতে চান? এটি আর ফিরিয়ে আনা যাবে না।`);
    if (!sure) return;
    setBusyId(a.id);
    try {
      await deleteDoc(doc(getFirebaseDb(), "admissions", a.id));
      setApps((prev) => (prev ? prev.filter((x) => x.id !== a.id) : prev));
    } catch {
      setError(true);
    } finally {
      setBusyId(null);
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
            onClick={() => window.print()}
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
