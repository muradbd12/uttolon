"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { CheckCircle2, AlertCircle, Loader2, Search } from "lucide-react";

type UserOption = {
  uid: string;
  name: string;
  identifier: string;
  role: string;
  className: string | null;
  subject: string | null;
  guardianMobile: string | null;
  linkedStudentUid: string | null;
};

type StudentOption = { uid: string; name: string; identifier: string };

const roleLabel: Record<string, string> = {
  student: "শিক্ষার্থী",
  guardian: "গার্ডিয়ান",
  teacher: "শিক্ষক",
};

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

const errorMessages: Record<string, string> = {
  missing_fields: "সব প্রয়োজনীয় ফিল্ড পূরণ করুন।",
  invalid_target: "শুধু শিক্ষার্থী/গার্ডিয়ান/শিক্ষকের তথ্য এখান থেকে এডিট করা যাবে।",
  guardian_mobile_required: "শিক্ষার্থীর জন্য গার্ডিয়ানের মোবাইল নম্বর আবশ্যক।",
  linked_student_required: "গার্ডিয়ানের জন্য একজন শিক্ষার্থী নির্বাচন করা আবশ্যক।",
  already_exists: "এই ইমেইল/নম্বর দিয়ে ইতিমধ্যে আরেকটা অ্যাকাউন্ট আছে।",
  forbidden: "এই কাজের অনুমতি নেই।",
  unauthorized: "লগইন সেশন শেষ হয়ে গেছে — আবার লগইন করুন।",
  server_config_error: "সার্ভার কনফিগারেশন সমস্যা।",
  server_error: "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।",
};

export default function AdminEditUserForm() {
  const [users, setUsers] = useState<UserOption[] | null>(null);
  const [students, setStudents] = useState<StudentOption[] | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserOption | null>(null);
  const [idType, setIdType] = useState<"email" | "phone">("phone");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "users"), where("role", "in", ["student", "guardian", "teacher"]));
        const snapshot = await getDocs(q);
        setUsers(
          snapshot.docs.map((d) => ({
            uid: d.id,
            name: (d.data().name as string) || "নাম নেই",
            identifier: (d.data().identifier as string) || "",
            role: d.data().role as string,
            className: (d.data().className as string) || null,
            subject: (d.data().subject as string) || null,
            guardianMobile: (d.data().guardianMobile as string) || null,
            linkedStudentUid: (d.data().linkedStudentUid as string) || null,
          }))
        );
      } catch {
        setUsers([]);
      }
    }
    async function loadStudents() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "users"), where("role", "==", "student"));
        const snapshot = await getDocs(q);
        setStudents(
          snapshot.docs.map((d) => ({
            uid: d.id,
            name: (d.data().name as string) || "নাম নেই",
            identifier: (d.data().identifier as string) || "",
          }))
        );
      } catch {
        setStudents([]);
      }
    }
    load();
    loadStudents();
  }, []);

  function selectUser(u: UserOption) {
    setSelected(u);
    setIdType(u.identifier.includes("@") ? "email" : "phone");
    setStatus("idle");
  }

  const filtered = (users || []).filter(
    (u) =>
      search.trim() === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.identifier.includes(search)
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    setStatus("saving");
    setErrorMsg("");
    const form = new FormData(e.currentTarget);

    try {
      const authInstance = getFirebaseAuth();
      const token = await authInstance.currentUser?.getIdToken();
      if (!token) {
        setStatus("error");
        setErrorMsg(errorMessages.unauthorized);
        return;
      }

      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          targetUid: selected.uid,
          name: form.get("name"),
          identifier: form.get("identifier"),
          className: form.get("className") || undefined,
          subject: form.get("subject") || undefined,
          guardianMobile: form.get("guardianMobile") || undefined,
          linkedStudentUid: selected.role === "guardian" ? form.get("linkedStudentUid") || undefined : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(errorMessages[data.error] || errorMessages.server_error);
        return;
      }

      setStatus("saved");
    } catch {
      setStatus("error");
      setErrorMsg(errorMessages.server_error);
    }
  }

  return (
    <div className="space-y-6">
      <label className="block">
        <span className="text-sm font-medium text-ink">নাম বা নম্বর দিয়ে খুঁজুন</span>
        <div className="relative mt-1.5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="যেমন: রাফি বা 017..."
            className={`${inputClass} pl-9`}
          />
        </div>
      </label>

      <div className="max-h-56 overflow-y-auto rounded-sm border border-line">
        {users === null ? (
          <p className="p-4 text-center text-sm text-ink-soft/60">লোড হচ্ছে...</p>
        ) : filtered.length === 0 ? (
          <p className="p-4 text-center text-sm text-ink-soft/60">কেউ পাওয়া যায়নি।</p>
        ) : (
          filtered.map((u) => (
            <button
              key={u.uid}
              type="button"
              onClick={() => selectUser(u)}
              className={`flex w-full items-center justify-between gap-3 border-b border-line px-4 py-2.5 text-left last:border-0 ${
                selected?.uid === u.uid ? "bg-gold-soft/40" : "hover:bg-paper-raised"
              }`}
            >
              <span>
                <span className="block text-sm text-ink">{u.name}</span>
                <span className="block text-xs text-ink-soft/60">
                  {roleLabel[u.role]} · {u.identifier}
                </span>
              </span>
              {selected?.uid === u.uid && <CheckCircle2 size={16} className="shrink-0 text-teal-deep" />}
            </button>
          ))
        )}
      </div>

      {selected && (
        <form
          key={selected.uid}
          onSubmit={handleSubmit}
          className="space-y-4 rounded-sm border border-line bg-paper p-6"
        >
          <p className="font-display-bn text-base text-ink">
            {roleLabel[selected.role]} — {selected.name} এডিট করুন
          </p>

          {status === "error" && (
            <div className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}
          {status === "saved" && (
            <div className="flex items-center gap-2 rounded-sm border border-teal/30 bg-teal-soft px-3 py-2 text-sm text-teal-deep">
              <CheckCircle2 size={14} /> তথ্য হালনাগাদ হয়েছে।
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium text-ink">পূর্ণ নাম</span>
            <input required name="name" type="text" defaultValue={selected.name} className={`mt-1.5 ${inputClass}`} />
          </label>

          <div>
            <span className="text-sm font-medium text-ink">লগইন কীভাবে করবেন</span>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIdType("phone")}
                className={`rounded-sm border px-4 py-2 text-sm ${
                  idType === "phone" ? "border-ink bg-ink text-paper" : "border-line text-ink-soft"
                }`}
              >
                মোবাইল নম্বর দিয়ে
              </button>
              <button
                type="button"
                onClick={() => setIdType("email")}
                className={`rounded-sm border px-4 py-2 text-sm ${
                  idType === "email" ? "border-ink bg-ink text-paper" : "border-line text-ink-soft"
                }`}
              >
                ইমেইল দিয়ে
              </button>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-ink">{idType === "phone" ? "মোবাইল নম্বর" : "ইমেইল"}</span>
            <input
              required
              name="identifier"
              type={idType === "phone" ? "tel" : "email"}
              defaultValue={selected.identifier}
              className={`mt-1.5 ${inputClass}`}
            />
          </label>

          {selected.role === "student" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-ink">
                  গার্ডিয়ানের মোবাইল নম্বর <span className="text-clay">*</span>
                </span>
                <input
                  required
                  name="guardianMobile"
                  type="tel"
                  defaultValue={selected.guardianMobile || ""}
                  className={`mt-1.5 ${inputClass}`}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-ink">ক্লাস</span>
                <input name="className" type="text" defaultValue={selected.className || ""} className={`mt-1.5 ${inputClass}`} />
              </label>
            </div>
          )}

          {selected.role === "teacher" && (
            <label className="block">
              <span className="text-sm font-medium text-ink">বিষয়</span>
              <input name="subject" type="text" defaultValue={selected.subject || ""} className={`mt-1.5 ${inputClass}`} />
            </label>
          )}

          {selected.role === "guardian" && (
            <label className="block">
              <span className="text-sm font-medium text-ink">
                কোন শিক্ষার্থীর সাথে যুক্ত <span className="text-clay">*</span>
              </span>
              <select
                required
                name="linkedStudentUid"
                defaultValue={selected.linkedStudentUid || ""}
                className={`mt-1.5 ${inputClass}`}
              >
                <option value="" disabled>
                  নির্বাচন করুন
                </option>
                {students?.map((s) => (
                  <option key={s.uid} value={s.uid}>
                    {s.name} ({s.identifier})
                  </option>
                ))}
              </select>
            </label>
          )}

          <button
            type="submit"
            disabled={status === "saving"}
            className="flex items-center gap-2 rounded-sm bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
          >
            {status === "saving" && <Loader2 size={14} className="animate-spin" />}
            সংরক্ষণ করুন
          </button>
        </form>
      )}
    </div>
  );
}
