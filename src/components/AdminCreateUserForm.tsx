"use client";

import { useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

const errorMessages: Record<string, string> = {
  missing_fields: "সব প্রয়োজনীয় ফিল্ড পূরণ করুন।",
  weak_password: "পাসওয়ার্ড অন্তত ৬ ক্যারেক্টার হতে হবে।",
  guardian_mobile_required: "শিক্ষার্থীর জন্য গার্ডিয়ানের মোবাইল নম্বর আবশ্যক।",
  already_exists: "এই ইমেইল/নম্বর দিয়ে ইতিমধ্যে একটা অ্যাকাউন্ট আছে।",
  unauthorized: "লগইন সেশন শেষ হয়ে গেছে — আবার লগইন করুন।",
  forbidden: "এই কাজের অনুমতি নেই।",
  server_error: "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।",
};

export default function AdminCreateUserForm() {
  const [role, setRole] = useState<"student" | "guardian" | "teacher">("student");
  const [idType, setIdType] = useState<"email" | "phone">("phone");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [created, setCreated] = useState<{ identifier: string; password: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = new FormData(e.currentTarget);
    const identifier = form.get("identifier") as string;
    const password = form.get("password") as string;

    try {
      const authInstance = getFirebaseAuth();
      const token = await authInstance.currentUser?.getIdToken();
      if (!token) {
        setStatus("error");
        setErrorMsg(errorMessages.unauthorized);
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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(errorMessages[data.error] || errorMessages.server_error);
        return;
      }

      setCreated({ identifier, password });
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
      setErrorMsg(errorMessages.server_error);
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
      {status === "error" && (
        <div className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
          <AlertCircle size={14} /> {errorMsg}
        </div>
      )}

      <div>
        <span className="text-sm font-medium text-ink">অ্যাকাউন্টের ধরন</span>
        <div className="mt-2 flex gap-2">
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
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-ink">পূর্ণ নাম</span>
        <input required name="name" type="text" className={`mt-1.5 ${inputClass}`} />
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
          placeholder={idType === "phone" ? "01XXXXXXXXX" : "name@example.com"}
          className={`mt-1.5 ${inputClass}`}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">পাসওয়ার্ড (অন্তত ৬ ক্যারেক্টার)</span>
        <input required name="password" type="text" minLength={6} className={`mt-1.5 ${inputClass}`} />
      </label>

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
              placeholder="01XXXXXXXXX"
              className={`mt-1.5 ${inputClass}`}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">ক্লাস</span>
            <input name="className" type="text" className={`mt-1.5 ${inputClass}`} />
          </label>
        </div>
      )}

      {role === "teacher" && (
        <label className="block">
          <span className="text-sm font-medium text-ink">বিষয়</span>
          <input name="subject" type="text" className={`mt-1.5 ${inputClass}`} />
        </label>
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
