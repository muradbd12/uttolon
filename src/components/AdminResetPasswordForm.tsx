"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, Search } from "lucide-react";

type UserOption = { uid: string; name: string; identifier: string; role: string };

const roleLabel: Record<string, string> = {
  student: "শিক্ষার্থী",
  guardian: "গার্ডিয়ান",
  teacher: "শিক্ষক",
};

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

const errorMessages: Record<string, string> = {
  missing_fields: "একজনকে নির্বাচন করে নতুন পাসওয়ার্ড দিন।",
  weak_password: "পাসওয়ার্ড অন্তত ৬ ক্যারেক্টার হতে হবে।",
  invalid_target: "শুধু শিক্ষার্থী/গার্ডিয়ান/শিক্ষকের পাসওয়ার্ড এখান থেকে রিসেট করা যাবে।",
  forbidden: "এই কাজের অনুমতি নেই।",
  unauthorized: "লগইন সেশন শেষ হয়ে গেছে — আবার লগইন করুন।",
  server_config_error: "সার্ভার কনফিগারেশন সমস্যা।",
  server_error: "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।",
};

export default function AdminResetPasswordForm() {
  const [users, setUsers] = useState<UserOption[] | null>(null);
  const [search, setSearch] = useState("");
  const [selectedUid, setSelectedUid] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resetInfo, setResetInfo] = useState<{ identifier: string; password: string } | null>(null);

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
          }))
        );
      } catch {
        setUsers([]);
      }
    }
    load();
  }, []);

  const filtered = (users || []).filter(
    (u) =>
      search.trim() === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.identifier.includes(search)
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUid) {
      setStatus("error");
      setErrorMsg(errorMessages.missing_fields);
      return;
    }
    setStatus("saving");
    setErrorMsg("");
    const form = new FormData(e.currentTarget);
    const newPassword = form.get("newPassword") as string;

    try {
      const authInstance = getFirebaseAuth();
      const token = await authInstance.currentUser?.getIdToken();
      if (!token) {
        setStatus("error");
        setErrorMsg(errorMessages.unauthorized);
        return;
      }

      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUid: selectedUid, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(errorMessages[data.error] || errorMessages.server_error);
        return;
      }

      const target = users?.find((u) => u.uid === selectedUid);
      setResetInfo({ identifier: target?.identifier || "", password: newPassword });
      setStatus("idle");
      (e.target as HTMLFormElement).reset();
      setSelectedUid("");
    } catch {
      setStatus("error");
      setErrorMsg(errorMessages.server_error);
    }
  }

  if (resetInfo) {
    return (
      <div className="rounded-sm border border-teal/30 bg-teal-soft p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-teal-deep" />
          <div>
            <h3 className="font-display-bn text-lg text-ink">পাসওয়ার্ড পরিবর্তন হয়েছে</h3>
            <p className="mt-2 text-sm text-ink-soft">এই তথ্যটা সংশ্লিষ্ট ব্যক্তিকে সরাসরি জানিয়ে দিন:</p>
            <div className="mt-3 space-y-1 rounded-sm bg-paper px-4 py-3 font-display-en text-sm">
              <p>লগইন: {resetInfo.identifier}</p>
              <p>নতুন পাসওয়ার্ড: {resetInfo.password}</p>
            </div>
            <button
              type="button"
              onClick={() => setResetInfo(null)}
              className="mt-4 text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
            >
              আরেকজনের পাসওয়ার্ড রিসেট করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-sm border border-line bg-paper p-6">
      {status === "error" && (
        <div className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
          <AlertCircle size={14} /> {errorMsg}
        </div>
      )}

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
              onClick={() => setSelectedUid(u.uid)}
              className={`flex w-full items-center justify-between gap-3 border-b border-line px-4 py-2.5 text-left last:border-0 ${
                selectedUid === u.uid ? "bg-gold-soft/40" : "hover:bg-paper-raised"
              }`}
            >
              <span>
                <span className="block text-sm text-ink">{u.name}</span>
                <span className="block text-xs text-ink-soft/60">
                  {roleLabel[u.role]} · {u.identifier}
                </span>
              </span>
              {selectedUid === u.uid && <CheckCircle2 size={16} className="shrink-0 text-teal-deep" />}
            </button>
          ))
        )}
      </div>

      <label className="block">
        <span className="text-sm font-medium text-ink">নতুন পাসওয়ার্ড (অন্তত ৬ ক্যারেক্টার)</span>
        <div className="relative mt-1.5">
          <input
            required
            name="newPassword"
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

      <button
        type="submit"
        disabled={status === "saving" || !selectedUid}
        className="flex items-center gap-2 rounded-sm bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
      >
        {status === "saving" && <Loader2 size={14} className="animate-spin" />}
        পাসওয়ার্ড পরিবর্তন করুন
      </button>
    </form>
  );
}
