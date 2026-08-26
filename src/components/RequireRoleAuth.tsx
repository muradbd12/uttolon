"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User, type Auth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { LogOut, Loader2, AlertTriangle, ShieldAlert } from "lucide-react";

type Role = "admin" | "student" | "guardian" | "teacher";

const roleLabel: Record<Role, string> = {
  admin: "অ্যাডমিন",
  student: "স্টুডেন্ট",
  guardian: "গার্ডিয়ান",
  teacher: "শিক্ষক",
};

// role অনুযায়ী পাতা সুরক্ষিত রাখে — শুধু "লগইন করা আছে" যথেষ্ট না,
// users/{uid} ডকুমেন্টে role মিলতে হবে। না মিললে সাইন-আউট করে
// সংশ্লিষ্ট লগইন পেজে পাঠিয়ে দেয়।
export default function RequireRoleAuth({
  role,
  loginPath,
  children,
}: {
  role: Role;
  loginPath: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "denied" | "config-error" | "ok">("checking");
  const [user, setUser] = useState<User | null>(null);
  const authRef = useRef<Auth | null>(null);

  useEffect(() => {
    let authInstance: Auth;
    try {
      authInstance = getFirebaseAuth();
    } catch {
      queueMicrotask(() => setState("config-error"));
      return;
    }
    authRef.current = authInstance;

    const unsubscribe = onAuthStateChanged(
      authInstance,
      async (u) => {
        if (!u) {
          setState("denied");
          router.replace(loginPath);
          return;
        }
        try {
          const snap = await getDoc(doc(getFirebaseDb(), "users", u.uid));
          const actualRole = snap.exists() ? (snap.data().role as string) : null;
          if (actualRole !== role) {
            await signOut(authInstance);
            setState("denied");
            router.replace(loginPath);
            return;
          }
          setUser(u);
          setState("ok");
        } catch {
          setState("config-error");
        }
      },
      () => setState("config-error")
    );
    return () => unsubscribe();
  }, [role, loginPath, router]);

  if (state === "config-error") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
        <AlertTriangle size={26} className="text-clay" />
        <h2 className="mt-4 font-display-bn text-xl text-ink">Firebase কনফিগারেশন সমস্যা</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          লগইন চালু করতে Vercel প্রজেক্টের Settings → Environment Variables-এ
          Firebase key-গুলো যোগ করা আছে কিনা যাচাই করুন।
        </p>
      </div>
    );
  }

  if (state === "checking") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ink-soft">
        <Loader2 size={22} className="animate-spin" />
        <p className="text-sm">লগইন যাচাই করা হচ্ছে...</p>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ink-soft">
        <ShieldAlert size={22} />
        <p className="text-sm">লগইন পেজে পাঠানো হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <p className="text-sm text-ink-soft">
            {roleLabel[role]} হিসেবে লগইন করা আছে: <span className="text-ink">{user?.email}</span>
          </p>
          <button
            type="button"
            onClick={() => authRef.current && signOut(authRef.current)}
            className="flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-sm text-ink-soft hover:border-ink hover:text-ink"
          >
            <LogOut size={14} /> লগ আউট
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
