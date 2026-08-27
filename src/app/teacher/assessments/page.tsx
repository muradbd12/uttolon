import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import TeacherAssessmentForm from "@/components/TeacherAssessmentForm";

export const metadata: Metadata = {
  title: "মূল্যায়ন দিন | Teacher | Uttolon",
  robots: { index: false, follow: false },
};

export default function TeacherAssessmentsPage() {
  return (
    <RequireRoleAuth role="teacher" loginPath="/teacher/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
          <Link
            href="/teacher/dashboard"
            className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={14} /> ড্যাশবোর্ডে ফিরুন
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">মূল্যায়ন দিন</h1>
          <p className="mt-2 text-sm text-ink-soft">
            শিক্ষার্থী বেছে নিয়ে Concept, Practice ও Assessment স্কোর যোগ করুন।
          </p>
          <div className="mt-8">
            <TeacherAssessmentForm />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
