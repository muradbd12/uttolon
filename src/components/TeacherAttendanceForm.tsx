"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type StudentOption = { uid: string; name: string; className: string | null };

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function TeacherAttendanceForm() {
  const today = todayStr();
  const [students, setStudents] = useState<StudentOption[] | null>(null);
  const [marks, setMarks] = useState<Record<string, "present" | "absent">>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [alreadyMarked, setAlreadyMarked] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "users"), where("role", "==", "student"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((d) => ({
          uid: d.id,
          name: (d.data().name as string) || "নাম নেই",
          className: (d.data().className as string) || null,
        }));
        setStudents(list);

        // আজকের হাজিরা আগেই একবার নেওয়া হয়ে থাকলে সেটা দেখিয়ে দেওয়া —
        // ভুল করে দ্বিতীয়বার বদলে ফেলা ঠেকাতে নিচে সেভ বাটন লক করা হবে।
        const existing = await getDocs(
          query(collection(db, "attendance"), where("date", "==", today))
        );
        if (!existing.empty) {
          const savedMarks: Record<string, "present" | "absent"> = {};
          existing.docs.forEach((d) => {
            const data = d.data();
            savedMarks[data.studentUid] = data.status === "absent" ? "absent" : "present";
          });
          const defaults = Object.fromEntries(list.map((s) => [s.uid, "present" as const]));
          setMarks({ ...defaults, ...savedMarks });
          setAlreadyMarked(true);
        } else {
          setMarks(Object.fromEntries(list.map((s) => [s.uid, "present" as const])));
        }
      } catch {
        setStudents([]);
      }
    }
    load();
  }, [today]);

  async function handleSave() {
    if (!students || students.length === 0 || alreadyMarked) return;
    setStatus("saving");
    try {
      const authInstance = getFirebaseAuth();
      const teacherUid = authInstance.currentUser?.uid;
      const db = getFirebaseDb();
      const batch = writeBatch(db);
      for (const s of students) {
        const ref = doc(db, "attendance", `${s.uid}_${today}`);
        batch.set(ref, {
          studentUid: s.uid,
          date: today,
          status: marks[s.uid] || "present",
          markedBy: teacherUid,
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
      setStatus("saved");
      setAlreadyMarked(true);
    } catch {
      setStatus("error");
    }
  }

  if (students === null) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-ink-soft">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">লোড হচ্ছে...</span>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-line p-8 text-center text-sm text-ink-soft/60">
        এখনো কোনো শিক্ষার্থীর অ্যাকাউন্ট তৈরি হয়নি।
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <span className="text-sm font-medium text-ink">তারিখ</span>
        <p className="mt-1.5 text-[15px] text-ink">{today}</p>
        <p className="mt-0.5 text-xs text-ink-soft/60">
          শুধু আজকের হাজিরা এখান থেকে নেওয়া যায় — ভুল হলে Admin-কে জানান, তিনি ঠিক করে দেবেন।
        </p>
      </div>

      {alreadyMarked && (
        <div className="flex items-center gap-2 rounded-sm border border-gold/30 bg-gold-soft/40 px-3 py-2 text-sm text-ink">
          <CheckCircle2 size={14} className="text-gold-deep" /> আজকের হাজিরা ইতিমধ্যে নেওয়া হয়ে গেছে —
          এখন শুধু দেখা যাবে, বদলানো যাবে না।
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
          <AlertCircle size={14} /> সংরক্ষণ করা যায়নি, আবার চেষ্টা করুন।
        </div>
      )}
      {status === "saved" && (
        <div className="flex items-center gap-2 rounded-sm border border-teal/30 bg-teal-soft px-3 py-2 text-sm text-teal-deep">
          <CheckCircle2 size={14} /> {today}-এর উপস্থিতি সংরক্ষিত হয়েছে।
        </div>
      )}

      <div className="overflow-hidden rounded-sm border border-line">
        {students.map((s, i) => (
          <div
            key={s.uid}
            className={`flex items-center justify-between gap-4 px-4 py-3 ${i !== 0 ? "border-t border-line" : ""}`}
          >
            <div>
              <p className="text-[15px] text-ink">{s.name}</p>
              {s.className && <p className="text-xs text-ink-soft/60">{s.className}</p>}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                disabled={alreadyMarked}
                onClick={() => setMarks((m) => ({ ...m, [s.uid]: "present" }))}
                className={`rounded-sm border px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-70 ${
                  marks[s.uid] === "present"
                    ? "border-teal bg-teal-soft text-teal-deep"
                    : "border-line text-ink-soft"
                }`}
              >
                উপস্থিত
              </button>
              <button
                type="button"
                disabled={alreadyMarked}
                onClick={() => setMarks((m) => ({ ...m, [s.uid]: "absent" }))}
                className={`rounded-sm border px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-70 ${
                  marks[s.uid] === "absent"
                    ? "border-clay bg-clay-soft text-clay"
                    : "border-line text-ink-soft"
                }`}
              >
                অনুপস্থিত
              </button>
            </div>
          </div>
        ))}
      </div>

      {!alreadyMarked && (
        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving"}
          className="flex items-center gap-2 rounded-sm bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
        >
          {status === "saving" && <Loader2 size={14} className="animate-spin" />}
          সংরক্ষণ করুন
        </button>
      )}
    </div>
  );
}
