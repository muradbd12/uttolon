import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import TeacherHomeworkForm from "@/components/TeacherHomeworkForm";

export const metadata: Metadata = {
  title: "হোমওয়ার্ক দিন | Teacher | Uttolon",
  robots: { index: false, follow: false },
};

export default function TeacherHomeworkPage() {
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
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">হোমওয়ার্ক দিন</h1>
          <p className="mt-2 text-sm text-ink-soft">
            একটা ক্লাসের সব শিক্ষার্থী এই হোমওয়ার্ক তাদের ড্যাশবোর্ডে দেখতে পাবে।
          </p>
          <div className="mt-8">
            <TeacherHomeworkForm />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
