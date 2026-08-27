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
type AssessmentEntry = {
  subject: string;
  concept: number;
  practice: number;
  assessment: number;
  recoveryActive: boolean;
};

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

function slugify(subject: string) {
  return subject.trim().toLowerCase().replace(/\s+/g, "_");
}

export default function TeacherAssessmentForm() {
  const [students, setStudents] = useState<StudentOption[] | null>(null);
  const [selectedUid, setSelectedUid] = useState("");
  const [entries, setEntries] = useState<AssessmentEntry[] | null>(null);
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
        const q = query(collection(db, "assessments"), where("studentUid", "==", selectedUid));
        const snapshot = await getDocs(q);
        setEntries(snapshot.docs.map((d) => d.data() as AssessmentEntry));
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
    const subject = (form.get("subject") as string)?.trim();
    if (!subject) {
      setStatus("error");
      return;
    }
    try {
      const authInstance = getFirebaseAuth();
      const db = getFirebaseDb();
      await setDoc(doc(db, "assessments", `${selectedUid}_${slugify(subject)}`), {
        studentUid: selectedUid,
        subject,
        concept: Number(form.get("concept")) || 0,
        practice: Number(form.get("practice")) || 0,
        assessment: Number(form.get("assessment")) || 0,
        recoveryActive: form.get("recoveryActive") === "on",
        enteredBy: authInstance.currentUser?.uid || null,
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
          <option value="">
            {students === null ? "লোড হচ্ছে..." : "নির্বাচন করুন"}
          </option>
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
            <div className="overflow-hidden rounded-sm border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-paper-raised text-left text-ink-soft">
                    <th className="px-4 py-2 font-normal">বিষয়</th>
                    <th className="px-4 py-2 font-normal">Concept</th>
                    <th className="px-4 py-2 font-normal">Practice</th>
                    <th className="px-4 py-2 font-normal">Assessment</th>
                    <th className="px-4 py-2 font-normal">Recovery</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((en) => (
                    <tr key={en.subject} className="border-b border-line last:border-0">
                      <td className="px-4 py-2 text-ink">{en.subject}</td>
                      <td className="px-4 py-2 text-ink-soft">{en.concept}%</td>
                      <td className="px-4 py-2 text-ink-soft">{en.practice}%</td>
                      <td className="px-4 py-2 text-ink-soft">{en.assessment}%</td>
                      <td className="px-4 py-2 text-ink-soft">{en.recoveryActive ? "Active" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-sm border border-line bg-paper p-6"
          >
            <h3 className="font-display-bn text-base text-ink">নতুন/আপডেট করা মূল্যায়ন যোগ করুন</h3>

            {status === "error" && (
              <div className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
                <AlertCircle size={14} /> বিষয়ের নাম দিন, তারপর আবার চেষ্টা করুন।
              </div>
            )}
            {status === "saved" && (
              <div className="flex items-center gap-2 rounded-sm border border-teal/30 bg-teal-soft px-3 py-2 text-sm text-teal-deep">
                <CheckCircle2 size={14} /> সংরক্ষিত হয়েছে।
              </div>
            )}

            <input required name="subject" type="text" placeholder="বিষয় (যেমন: Mathematics)" className={inputClass} />

            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <span className="text-xs text-ink-soft">Concept %</span>
                <input required name="concept" type="number" min={0} max={100} className={`mt-1 ${inputClass}`} />
              </label>
              <label className="block">
                <span className="text-xs text-ink-soft">Practice %</span>
                <input required name="practice" type="number" min={0} max={100} className={`mt-1 ${inputClass}`} />
              </label>
              <label className="block">
                <span className="text-xs text-ink-soft">Assessment %</span>
                <input required name="assessment" type="number" min={0} max={100} className={`mt-1 ${inputClass}`} />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input name="recoveryActive" type="checkbox" className="h-4 w-4" />
              Recovery Active (এই বিষয়ে দুর্বলতা আছে)
            </label>

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
