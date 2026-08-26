import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "গার্ডিয়ান লগইন | Uttolon",
  robots: { index: false },
};

export default function GuardianLoginPage() {
  return (
    <section>
      <div className="mx-auto max-w-md px-5 py-16 sm:px-8 sm:py-24">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">Guardian Portal</p>
        <h1 className="mt-4 font-display-bn text-3xl text-ink">গার্ডিয়ান লগইন</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          সন্তানের উপস্থিতি, অগ্রগতি ও নোটিশ দেখতে লগইন করুন।
        </p>
        <div className="mt-9">
          <AuthForm role="guardian" idLabel="মোবাইল নম্বর অথবা ইমেইল" idPlaceholder="01XXXXXXXXX" />
        </div>
      </div>
    </section>
  );
}
