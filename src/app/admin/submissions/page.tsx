import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import TeacherSubmissions from "@/components/TeacherSubmissions";

export const metadata: Metadata = {
  title: "জমা পড়া হোমওয়ার্ক | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminSubmissionsPage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
          <Link href="/admin/dashboard" className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft size={14} /> ড্যাশবোর্ডে ফিরুন
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">জমা পড়া হোমওয়ার্ক</h1>
          <p className="mt-2 text-sm text-ink-soft">
            শিক্ষার্থীরা যা জমা দিয়েছে এখানে দেখুন, "দেখা হয়েছে" চিহ্ন দিন ও মন্তব্য লিখুন — শিক্ষার্থী নিজের ড্যাশবোর্ডে সেটা দেখতে পাবে।
          </p>
          <div className="mt-8">
            <TeacherSubmissions />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
