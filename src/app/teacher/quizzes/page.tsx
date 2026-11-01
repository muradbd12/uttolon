import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import QuizManager from "@/components/QuizManager";

export const metadata: Metadata = {
  title: "অনলাইন টেস্ট | Teacher | Uttolon",
  robots: { index: false, follow: false },
};

export default function TeacherQuizzesPage() {
  return (
    <RequireRoleAuth role="teacher" loginPath="/teacher/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
          <Link href="/teacher/dashboard" className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft size={14} /> ড্যাশবোর্ডে ফিরুন
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">অনলাইন MCQ টেস্ট</h1>
          <p className="mt-2 text-sm text-ink-soft">
            টেস্ট বানিয়ে প্রকাশ করলে ওই ক্লাসের স্টুডেন্টরা নিজেদের ড্যাশবোর্ড থেকে দিতে পারে — নম্বর নিজে থেকেই হিসাব হয়,
            আর আপনি এখানে সবার ফলাফল দেখতে পারেন।
          </p>
          <div className="mt-8">
            <QuizManager />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
