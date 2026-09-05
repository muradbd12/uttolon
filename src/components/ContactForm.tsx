"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { withTimeout } from "@/lib/withTimeout";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    try {
      await withTimeout(
        addDoc(collection(getFirebaseDb(), "contactMessages"), {
          name: form.get("name"),
          phone: form.get("phone"),
          subject: form.get("subject"),
          message: form.get("message"),
          status: "new",
          submittedAt: serverTimestamp(),
        })
      );
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm border border-teal/30 bg-teal-soft p-8 text-center">
        <CheckCircle2 className="mx-auto text-teal-deep" size={28} />
        <h3 className="mt-3 font-display-bn text-lg text-ink">বার্তা পাঠানো হয়েছে</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          আপনার বার্তা পৌঁছে গেছে — যত দ্রুত সম্ভব আপনার দেওয়া নম্বরে যোগাযোগ করা হবে।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status === "error" && (
        <div className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
          <AlertCircle size={14} /> বার্তা পাঠানো যায়নি — আবার চেষ্টা করুন।
        </div>
      )}
      <label className="block">
        <span className="text-sm font-medium text-ink">নাম</span>
        <input required name="name" type="text" className={`mt-1.5 ${inputClass}`} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">ফোন নম্বর</span>
        <input required name="phone" type="tel" className={`mt-1.5 ${inputClass}`} placeholder="01XXXXXXXXX" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">বিষয়</span>
        <input required name="subject" type="text" className={`mt-1.5 ${inputClass}`} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">বার্তা</span>
        <textarea required name="message" rows={4} className={`mt-1.5 ${inputClass}`} />
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-sm bg-ink py-3.5 text-sm font-medium text-paper transition-colors hover:bg-gold-deep disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {status === "loading" && <Loader2 size={15} className="animate-spin" />}
        {status === "loading" ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
      </button>
    </form>
  );
}
