"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { identifierToEmail } from "@/lib/identifier";
import { AlertCircle, Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

type Role = "student" | "guardian" | "teacher";

const dashboardPath: Record<Role, string> = {
  student: "/student/dashboard",
  guardian: "/guardian/dashboard",
  teacher: "/teacher/dashboard",
};

export default function AuthForm({
  role,
  idLabel,
  idPlaceholder,
}: {
  role: Role;
  idLabel: string;
  idPlaceholder: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = new FormData(e.currentTarget);
    const identifier = (form.get("identifier") as string) || "";
    const password = (form.get("password") as string) || "";

    try {
      const authInstance = getFirebaseAuth();
      const email = identifierToEmail(identifier);
      const cred = await signInWithEmailAndPassword(authInstance, email, password);

      const snap = await getDoc(doc(getFirebaseDb(), "users", cred.user.uid));
      const actualRole = snap.exists() ? (snap.data().role as string) : null;

      if (actualRole !== role) {
        await signOut(authInstance);
        setStatus("error");
        setErrorMsg("এই আইডি/পাসওয়ার্ড দিয়ে এখানে প্রবেশের অনুমতি নেই।");
        return;
      }

      router.push(dashboardPath[role]);
    } catch {
      setStatus("error");
      setErrorMsg("ভুল আইডি অথবা পাসওয়ার্ড।");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status === "error" && (
        <div className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
          <AlertCircle size={14} /> {errorMsg}
        </div>
      )}
      <label className="block">
        <span className="text-sm font-medium text-ink">{idLabel}</span>
        <input
          required
          name="identifier"
          type="text"
          className={`mt-1.5 ${inputClass}`}
          placeholder={idPlaceholder}
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">পাসওয়ার্ড</span>
        <input required name="password" type="password" className={`mt-1.5 ${inputClass}`} />
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-sm bg-ink py-3.5 text-sm font-medium text-paper transition-colors hover:bg-gold-deep disabled:opacity-60"
      >
        {status === "loading" && <Loader2 size={15} className="animate-spin" />}
        লগইন করুন
      </button>
    </form>
  );
}
