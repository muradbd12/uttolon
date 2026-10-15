import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminLedger from "@/components/AdminLedger";

export const metadata: Metadata = {
  title: "পেমেন্ট ইতিহাস | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminLedgerPage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <Link href="/admin/fees" className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft size={14} /> ফি ব্যবস্থাপনায় ফিরুন
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">পেমেন্ট ইতিহাস</h1>
          <p className="mt-2 text-sm text-ink-soft">
            কে কবে কত টাকা দিয়েছে — ভর্তি ফি ও মাসিক ফি মিলিয়ে সব লেনদেনের তালিকা।
          </p>
          <div className="mt-8">
            <AdminLedger />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
