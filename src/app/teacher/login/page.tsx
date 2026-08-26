import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "শিক্ষক লগইন | Uttolon",
  robots: { index: false },
};

export default function TeacherLoginPage() {
  return (
    <section>
      <div className="mx-auto max-w-md px-5 py-16 sm:px-8 sm:py-24">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">Teacher Portal</p>
        <h1 className="mt-4 font-display-bn text-3xl text-ink">শিক্ষক লগইন</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          ক্লাস, উপস্থিতি, মূল্যায়ন ও হোমওয়ার্ক পরিচালনা করতে লগইন করুন।
        </p>
        <div className="mt-9">
          <AuthForm role="teacher" idLabel="মোবাইল নম্বর অথবা ইমেইল" idPlaceholder="01XXXXXXXXX" />
        </div>
      </div>
    </section>
  );
}
