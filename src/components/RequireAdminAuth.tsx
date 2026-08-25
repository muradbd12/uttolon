"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User, type Auth } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { LogOut, Loader2, AlertTriangle } from "lucide-react";

export default function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = checking
  const [configError, setConfigError] = useState(false);
  const authRef = useRef<Auth | null>(null);

  useEffect(() => {
    let authInstance: Auth;
    try {
      authInstance = getFirebaseAuth();
    } catch {
      queueMicrotask(() => setConfigError(true));
      return;
    }
    authRef.current = authInstance;
    const unsubscribe = onAuthStateChanged(
      authInstance,
      (u) => {
        setUser(u);
        if (!u) {
          router.replace("/admin/login");
        }
      },
      () => setConfigError(true)
    );
    return () => unsubscribe();
  }, [router]);

  if (configError) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
        <AlertTriangle size={26} className="text-clay" />
        <h2 className="mt-4 font-display-bn text-xl text-ink">Firebase কনফিগারেশন সমস্যা</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Admin লগইন চালু করতে Vercel প্রজেক্টের Settings → Environment Variables-এ
          Firebase key-গুলো (NEXT_PUBLIC_FIREBASE_...) যোগ করা আছে কিনা এবং
          Firebase Console-এ Email/Password sign-in চালু আছে কিনা যাচাই করুন।
        </p>
      </div>
    );
  }

  if (user === undefined) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ink-soft">
        <Loader2 size={22} className="animate-spin" />
        <p className="text-sm">লগইন যাচাই করা হচ্ছে...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ink-soft">
        <p className="text-sm">লগইন পেজে পাঠানো হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <p className="text-sm text-ink-soft">
            লগইন করা আছে: <span className="text-ink">{user.email}</span>
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
