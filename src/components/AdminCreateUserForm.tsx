"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, Info } from "lucide-react";

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

const errorMessages: Record<string, string> = {
  missing_fields: "সব প্রয়োজনীয় ফিল্ড পূরণ করুন।",
  weak_password: "পাসওয়ার্ড অন্তত ৬ ক্যারেক্টার হতে হবে।",
  guardian_mobile_required: "শিক্ষার্থীর জন্য গার্ডিয়ানের মোবাইল নম্বর আবশ্যক।",
  linked_student_required: "গার্ডিয়ানের জন্য একজন শিক্ষার্থী নির্বাচন করা আবশ্যক।",
  admin_level_required: "অ্যাডমিনের স্তর (Super/Academic) নির্বাচন করুন।",
  super_admin_required: "নতুন অ্যাডমিন অ্যাকাউন্ট তৈরির অনুমতি শুধু Super Admin-এর আছে।",
  already_exists: "এই ইমেইল/নম্বর দিয়ে ইতিমধ্যে একটা অ্যাকাউন্ট আছে।",
  unauthorized: "লগইন সেশন শেষ হয়ে গেছে — আবার লগইন করুন।",
  forbidden: "এই কাজের অনুমতি নেই।",
  server_config_error: "সার্ভার কনফিগারেশন সমস্যা — Vercel-এ FIREBASE_SERVICE_ACCOUNT_KEY ও ADMIN_EMAILS ঠিকভাবে যোগ করা আছে কিনা যাচাই করুন।",
  server_error: "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।",
};

type StudentOption = { uid: string; name: string; identifier: string };

export default function AdminCreateUserForm() {
  const searchParams = useSearchParams();
  const prefillName = searchParams.get("prefillName") || "";
  const prefillClass = searchParams.get("prefillClass") || "";
  const prefillGuardianMobile = searchParams.get("prefillGuardianMobile") || "";
  const prefillIdentifier = searchParams.get("prefillIdentifier") || "";
  const hasPrefill = Boolean(prefillName || prefillClass || prefillGuardianMobile || prefillIdentifier);

  const [role, setRole] = useState<"student" | "guardian" | "teacher" | "admin">("student");
  const [idType, setIdType] = useState<"email" | "phone">("phone");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [created, setCreated] = useState<{ identifier: string; password: string } | null>(null);
  const [students, setStudents] = useState<StudentOption[] | null>(null);
  const [selectedStudentUids, setSelectedStudentUids] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    async function checkSelf() {
      try {
        const authInstance = getFirebaseAuth();
        const uid = authInstance.currentUser?.uid;
        if (!uid) return;
        const snap = await getDoc(doc(getFirebaseDb(), "users", uid));
        setIsSuperAdmin(snap.exists() && snap.data().adminLevel === "super");
      } catch {
        setIsSuperAdmin(false);
      }
    }
    checkSelf();
  }, []);

  useEffect(() => {
    if (role !== "guardian" || students !== null) return;
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
    loadStudents();
  }, [role, students]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    setErrorCode("");
    setErrorDetails("");

    const form = new FormData(e.currentTarget);
    const identifier = form.get("identifier") as string;
    const password = form.get("password") as string;

    if (role === "guardian" && selectedStudentUids.length === 0) {
      setStatus("error");
      setErrorMsg(errorMessages.linked_student_required);
      setErrorCode("linked_student_required");
      return;
    }

    try {
      const authInstance = getFirebaseAuth();
      const token = await authInstance.currentUser?.getIdToken();
      if (!token) {
        setStatus("error");
        setErrorMsg(errorMessages.unauthorized);
        setErrorCode("unauthorized");
        return;
      }

      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.get("name"),
          role,
          identifier,
          password,
          guardianMobile: form.get("guardianMobile") || undefined,
          className: form.get("className") || undefined,
          subject: form.get("subject") || undefined,
          linkedStudentUids: role === "guardian" ? selectedStudentUids : undefined,
          adminLevel: role === "admin" ? form.get("adminLevel") || undefined : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(errorMessages[data.error] || errorMessages.server_error);
        setErrorCode(data.error || `http_${res.status}`);
        setErrorDetails(data.details || "");
        return;
      }

      setCreated({ identifier, password });
      setStatus("success");
      setSelectedStudentUids([]);
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
      setErrorMsg(errorMessages.server_error);
      setErrorCode("network_or_client_error");
    }
  }

  if (status === "success" && created) {
    return (
      <div className="rounded-sm border border-teal/30 bg-teal-soft p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-teal-deep" />
          <div>
            <h3 className="font-display-bn text-lg text-ink">অ্যাকাউন্ট তৈরি হয়েছে</h3>
            <p className="mt-2 text-sm text-ink-soft">
              এই তথ্যটা সংশ্লিষ্ট ব্যক্তিকে সরাসরি জানিয়ে দিন (এটা আর কোথাও দেখা যাবে না):
            </p>
            <div className="mt-3 space-y-1 rounded-sm bg-paper px-4 py-3 font-display-en text-sm">
              <p>লগইন: {created.identifier}</p>
              <p>পাসওয়ার্ড: {created.password}</p>
            </div>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-4 text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
            >
              আরেকটা অ্যাকাউন্ট তৈরি করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-sm border border-line bg-paper p-6">
      {hasPrefill && (
        <div className="flex items-start gap-2 rounded-sm border border-teal/30 bg-teal-soft px-3 py-2 text-sm text-teal-deep">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>ভর্তি আবেদন থেকে তথ্য পূরণ করা হয়েছে — যাচাই করে বাকি অংশ (পাসওয়ার্ড ইত্যাদি) পূরণ করুন।</span>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-start gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>
            {errorMsg}
            {errorCode && (
              <span className="mt-1 block text-xs opacity-70">(কোড: {errorCode})</span>
            )}
            {errorDetails && (
              <span className="mt-2 block select-all rounded-sm bg-paper px-2 py-1.5 font-mono text-xs text-ink">
                {errorDetails}
              </span>
            )}
          </span>
        </div>
      )}

      <div>
        <span className="text-sm font-medium text-ink">অ্যাকাউন্টের ধরন</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["student", "guardian", "teacher"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-sm border px-4 py-2 text-sm ${
                role === r ? "border-ink bg-ink text-paper" : "border-line text-ink-soft"
              }`}
            >
              {r === "student" ? "শিক্ষার্থী" : r === "guardian" ? "গার্ডিয়ান" : "শিক্ষক"}
            </button>
          ))}
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`rounded-sm border px-4 py-2 text-sm ${
                role === "admin" ? "border-ink bg-ink text-paper" : "border-line text-ink-soft"
              }`}
            >
              অ্যাডমিন
            </button>
          )}
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-ink">পূর্ণ নাম</span>
        <input required name="name" type="text" defaultValue={prefillName} className={`mt-1.5 ${inputClass}`} />
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
          defaultValue={prefillIdentifier}
          placeholder={idType === "phone" ? "01XXXXXXXXX" : "name@example.com"}
          className={`mt-1.5 ${inputClass}`}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">পাসওয়ার্ড (অন্তত ৬ ক্যারেক্টার)</span>
        <div className="relative mt-1.5">
          <input
            required
            name="password"
            type={showPassword ? "text" : "password"}
            minLength={6}
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </label>

      {role === "guardian" && (
        <div>
          <span className="text-sm font-medium text-ink">
            কোন কোন শিক্ষার্থীর সাথে যুক্ত <span className="text-clay">*</span>
          </span>
          <p className="mt-1 text-xs text-ink-soft/60">একাধিক সন্তান থাকলে সবগুলো টিক দিন।</p>
          <div className="mt-2 max-h-48 overflow-y-auto rounded-sm border border-line">
            {students === null ? (
              <p className="p-3 text-sm text-ink-soft/60">লোড হচ্ছে...</p>
            ) : students.length === 0 ? (
              <p className="p-3 text-sm text-ink-soft/60">
                আগে অন্তত একজন শিক্ষার্থীর অ্যাকাউন্ট তৈরি করুন, তারপর তার গার্ডিয়ান যুক্ত করুন।
              </p>
            ) : (
              students.map((s) => (
                <label
                  key={s.uid}
                  className="flex items-center gap-2.5 border-b border-line px-3 py-2.5 last:border-0 hover:bg-paper-raised"
                >
                  <input
                    type="checkbox"
                    checked={selectedStudentUids.includes(s.uid)}
                    onChange={(e) => {
                      setSelectedStudentUids((prev) =>
                        e.target.checked ? [...prev, s.uid] : prev.filter((uid) => uid !== s.uid)
                      );
                    }}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-ink">
                    {s.name} <span className="text-ink-soft/60">({s.identifier})</span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}

      {role === "student" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-ink">
              গার্ডিয়ানের মোবাইল নম্বর <span className="text-clay">*</span>
            </span>
            <input
              required
              name="guardianMobile"
              type="tel"
              defaultValue={prefillGuardianMobile}
              placeholder="01XXXXXXXXX"
              className={`mt-1.5 ${inputClass}`}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">ক্লাস</span>
            <input name="className" type="text" defaultValue={prefillClass} className={`mt-1.5 ${inputClass}`} />
          </label>
        </div>
      )}

      {role === "teacher" && (
        <label className="block">
          <span className="text-sm font-medium text-ink">বিষয়</span>
          <input name="subject" type="text" className={`mt-1.5 ${inputClass}`} />
        </label>
      )}

      {role === "admin" && (
        <div>
          <span className="text-sm font-medium text-ink">
            অ্যাডমিনের স্তর <span className="text-clay">*</span>
          </span>
          <div className="mt-2 flex gap-2">
            <label className="flex-1">
              <input required type="radio" name="adminLevel" value="super" className="peer sr-only" />
              <span className="block cursor-pointer rounded-sm border border-line px-4 py-2.5 text-center text-sm text-ink-soft peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper">
                Super Admin
              </span>
            </label>
            <label className="flex-1">
              <input required type="radio" name="adminLevel" value="academic" className="peer sr-only" />
              <span className="block cursor-pointer rounded-sm border border-line px-4 py-2.5 text-center text-sm text-ink-soft peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper">
                Academic Admin
              </span>
            </label>
          </div>
          <p className="mt-1.5 text-xs text-ink-soft/60">
            Super Admin সবকিছু (ফিসহ) দেখতে-পরিচালনা করতে পারবেন। Academic Admin
            ফি ব্যবস্থাপনা ছাড়া বাকি সবকিছু পরিচালনা করতে পারবেন।
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex items-center gap-2 rounded-sm bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
      >
        {status === "loading" && <Loader2 size={14} className="animate-spin" />}
        অ্যাকাউন্ট তৈরি করুন
      </button>
    </form>
  );
}
