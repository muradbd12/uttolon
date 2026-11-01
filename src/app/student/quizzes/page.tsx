import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import StudentQuizzes from "@/components/StudentQuizzes";

export const metadata: Metadata = {
  title: "অনলাইন টেস্ট | Student | Uttolon",
  robots: { index: false, follow: false },
};

export default function StudentQuizzesPage() {
  return (
    <RequireRoleAuth role="student" loginPath="/student/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
          <Link href="/student/dashboard" className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft size={14} /> ড্যাশবোর্ডে ফিরো
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">অনলাইন টেস্ট</h1>
          <p className="mt-2 text-sm text-ink-soft">
            টেস্ট দিয়ে সাথে সাথে নিজের স্কোর ও সঠিক উত্তর দেখো। প্রতিটা টেস্ট একবারই দেওয়া যায়।
          </p>
          <div className="mt-8">
            <StudentQuizzes />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
