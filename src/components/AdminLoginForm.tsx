"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { AlertCircle } from "lucide-react";

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

function friendlyError(code: string) {
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।";
  }
  if (code.includes("too-many-requests")) {
    return "অনেকবার চেষ্টা করা হয়েছে — কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }
  if (code.includes("network-request-failed")) {
    return "ইন্টারনেট সংযোগ চেক করুন।";
  }
  return "লগইন করা যায়নি। আবার চেষ্টা করুন।";
}

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      const code = err instanceof Error ? err.message : "unknown";
      setError(friendlyError(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 rounded-sm border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <label className="block">
        <span className="text-sm font-medium text-ink">অ্যাডমিন ইমেইল</span>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mt-1.5 ${inputClass}`}
          placeholder="admin@uttolon.com"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">পাসওয়ার্ড</span>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`mt-1.5 ${inputClass}`}
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-sm bg-ink py-3.5 text-sm font-medium text-paper transition-colors hover:bg-gold-deep disabled:opacity-60"
      >
        {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
      </button>
    </form>
  );
}
