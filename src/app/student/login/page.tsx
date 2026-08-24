import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "স্টুডেন্ট লগইন | Uttolon",
  robots: { index: false },
};

export default function StudentLoginPage() {
  return (
    <section>
      <div className="mx-auto max-w-md px-5 py-16 sm:px-8 sm:py-24">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">Student Portal</p>
        <h1 className="mt-4 font-display-bn text-3xl text-ink">স্টুডেন্ট লগইন</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          ক্লাস, হোমওয়ার্ক, মূল্যায়ন ও রেজাল্ট দেখতে লগইন করুন।
        </p>
        <div className="mt-9">
          <AuthForm idLabel="স্টুডেন্ট আইডি / মোবাইল নম্বর" idPlaceholder="যেমন: UTL-2026-001" />
        </div>
      </div>
    </section>
  );
}
