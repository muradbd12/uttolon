"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { identifierToEmail } from "@/lib/identifier";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

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
  const [forgotStatus, setForgotStatus] = useState<"idle" | "sent" | "phone-based" | "error">("idle");

  async function handleForgotPassword(e: React.MouseEvent) {
    e.preventDefault();
    const form = (e.currentTarget as HTMLElement).closest("form");
    const identifier = (form?.querySelector('input[name="identifier"]') as HTMLInputElement)?.value || "";
    if (!identifier.trim()) {
      setForgotStatus("error");
      return;
    }
    if (!identifier.includes("@")) {
      // মোবাইল নম্বর দিয়ে লগইন করা অ্যাকাউন্টের কোনো real ইমেইল থাকে
      // না, তাই এখানে সরাসরি রিসেট লিংক পাঠানো সম্ভব না।
      setForgotStatus("phone-based");
      return;
    }
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), identifier.trim());
      setForgotStatus("sent");
    } catch {
      setForgotStatus("error");
    }
  }

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

      <div>
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-xs text-ink-soft underline decoration-line underline-offset-4 hover:text-ink hover:decoration-ink"
        >
          পাসওয়ার্ড ভুলে গেছেন?
        </button>
        {forgotStatus === "sent" && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-teal-deep">
            <CheckCircle2 size={13} /> রিসেট লিংক ইমেইলে পাঠানো হয়েছে।
          </p>
        )}
        {forgotStatus === "phone-based" && (
          <p className="mt-2 text-xs text-ink-soft">
            মোবাইল নম্বর দিয়ে তৈরি অ্যাকাউন্টের পাসওয়ার্ড এভাবে রিসেট হয় না — উত্তোলনের
            সাথে সরাসরি যোগাযোগ করুন, নতুন পাসওয়ার্ড দিয়ে দেওয়া হবে।
          </p>
        )}
        {forgotStatus === "error" && (
          <p className="mt-2 text-xs text-clay">প্রথমে উপরে আপনার ইমেইল/নম্বর লিখুন।</p>
        )}
      </div>
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
