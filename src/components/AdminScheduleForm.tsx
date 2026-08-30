"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Loader2, AlertCircle, Trash2 } from "lucide-react";

type TeacherOption = { uid: string; name: string; subject: string | null };
type ScheduleEntry = {
  id: string;
  className: string;
  subject: string;
  teacherUid: string;
  teacherName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
};

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

const days = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];

export default function AdminScheduleForm() {
  const [teachers, setTeachers] = useState<TeacherOption[] | null>(null);
  const [entries, setEntries] = useState<ScheduleEntry[] | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTeachers() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "users"), where("role", "==", "teacher"));
        const snapshot = await getDocs(q);
        setTeachers(
          snapshot.docs.map((d) => ({
            uid: d.id,
            name: (d.data().name as string) || "নাম নেই",
            subject: (d.data().subject as string) || null,
          }))
        );
      } catch {
        setTeachers([]);
      }
    }
    loadTeachers();
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const db = getFirebaseDb();
      const q = query(collection(db, "schedule"), orderBy("dayOfWeek"), orderBy("startTime"));
      const snapshot = await getDocs(q);
      setEntries(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduleEntry)));
    } catch {
      setEntries([]);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const form = new FormData(e.currentTarget);
    const className = (form.get("className") as string)?.trim();
    const subject = (form.get("subject") as string)?.trim();
    const teacherUid = form.get("teacherUid") as string;
    const dayOfWeek = Number(form.get("dayOfWeek"));
    const startTime = form.get("startTime") as string;
    const endTime = form.get("endTime") as string;
    const room = (form.get("room") as string)?.trim();

    if (!className || !subject || !teacherUid || !startTime || !endTime) {
      setStatus("error");
      return;
    }

    try {
      const teacher = teachers?.find((t) => t.uid === teacherUid);
      await addDoc(collection(getFirebaseDb(), "schedule"), {
        className,
        subject,
        teacherUid,
        teacherName: teacher?.name || "",
        dayOfWeek,
        startTime,
        endTime,
        room: room || "",
        createdAt: serverTimestamp(),
      });
      (e.target as HTMLFormElement).reset();
      setStatus("idle");
      loadEntries();
    } catch {
      setStatus("error");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("এই রুটিন এন্ট্রিটা মুছে ফেলতে চান? এটা আর ফিরিয়ে আনা যাবে না।")) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(getFirebaseDb(), "schedule", id));
      setEntries((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
    } catch {
      setStatus("error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-line bg-paper p-6">
        {status === "error" && (
          <div className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
            <AlertCircle size={14} /> সব প্রয়োজনীয় ফিল্ড পূরণ করুন, তারপর আবার চেষ্টা করুন।
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input required name="className" type="text" placeholder="ক্লাস (যেমন: Class 10)" className={inputClass} />
          <input required name="subject" type="text" placeholder="বিষয়" className={inputClass} />
        </div>

        <select required name="teacherUid" className={inputClass} defaultValue="">
          <option value="" disabled>
            {teachers === null ? "লোড হচ্ছে..." : "শিক্ষক নির্বাচন করুন"}
          </option>
          {teachers?.map((t) => (
            <option key={t.uid} value={t.uid}>
              {t.name} {t.subject ? `— ${t.subject}` : ""}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <select required name="dayOfWeek" className={inputClass} defaultValue="">
            <option value="" disabled>
              বার
            </option>
            {days.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
          <input required name="startTime" type="time" className={inputClass} />
          <input required name="endTime" type="time" className={inputClass} />
          <input name="room" type="text" placeholder="রুম (ঐচ্ছিক)" className={inputClass} />
        </div>

        <button
          type="submit"
          disabled={status === "saving"}
          className="flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
        >
          {status === "saving" && <Loader2 size={14} className="animate-spin" />}
          রুটিনে যোগ করুন
        </button>
      </form>

      {entries === null ? (
        <div className="flex items-center justify-center gap-2 py-10 text-ink-soft">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">লোড হচ্ছে...</span>
        </div>
      ) : entries.length === 0 ? (
        <p className="rounded-sm border border-dashed border-line p-8 text-center text-sm text-ink-soft/60">
          এখনো কোনো রুটিন যোগ করা হয়নি।
        </p>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-line">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-raised text-left text-ink-soft">
                <th className="px-4 py-2 font-normal">বার</th>
                <th className="px-4 py-2 font-normal">সময়</th>
                <th className="px-4 py-2 font-normal">ক্লাস</th>
                <th className="px-4 py-2 font-normal">বিষয়</th>
                <th className="px-4 py-2 font-normal">শিক্ষক</th>
                <th className="px-4 py-2 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2 text-ink-soft">{days[s.dayOfWeek]}</td>
                  <td className="px-4 py-2 text-ink-soft">
                    {s.startTime}–{s.endTime}
                  </td>
                  <td className="px-4 py-2 text-ink">{s.className}</td>
                  <td className="px-4 py-2 text-ink-soft">{s.subject}</td>
                  <td className="px-4 py-2 text-ink-soft">{s.teacherName}</td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                      className="flex items-center gap-1 text-xs text-ink-soft hover:text-clay disabled:opacity-50"
                    >
                      {deletingId === s.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      মুছুন
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
