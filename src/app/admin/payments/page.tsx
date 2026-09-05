import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminPaymentsOverview from "@/components/AdminPaymentsOverview";

export const metadata: Metadata = {
  title: "পেমেন্ট ওভারভিউ | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminPaymentsPage() {
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
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">পেমেন্ট ওভারভিউ</h1>
          <p className="mt-2 text-sm text-ink-soft">
            সব শিক্ষার্থীর ভর্তি ফি ও চলতি মাসের বেতনের সামগ্রিক হিসাব।
          </p>
          <div className="mt-8">
            <AdminPaymentsOverview />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
