import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminScheduleForm from "@/components/AdminScheduleForm";

export const metadata: Metadata = {
  title: "ক্লাস রুটিন | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminSchedulePage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
          <Link
            href="/admin/dashboard"
            className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={14} /> ড্যাশবোর্ডে ফিরুন
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">ক্লাস রুটিন</h1>
          <p className="mt-2 text-sm text-ink-soft">
            রুটিনে যোগ করা ক্লাস সংশ্লিষ্ট শিক্ষক ও ক্লাসের শিক্ষার্থীদের ড্যাশবোর্ডে
            &quot;আজকের ক্লাস&quot; অংশে দেখা যাবে।
          </p>
          <div className="mt-8">
            <AdminScheduleForm />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
