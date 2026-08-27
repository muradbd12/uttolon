import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminFeeForm from "@/components/AdminFeeForm";

export const metadata: Metadata = {
  title: "ফি ব্যবস্থাপনা | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminFeesPage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
          <Link
            href="/admin/dashboard"
            className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={14} /> ড্যাশবোর্ডে ফিরুন
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">ফি ব্যবস্থাপনা</h1>

          <div className="mt-4 flex items-start gap-2 rounded-sm border border-gold/30 bg-gold-soft/40 p-3 text-sm text-ink">
            <Info size={15} className="mt-0.5 shrink-0 text-gold-deep" />
            <p>
              এটা শুধু হিসাব রাখার জায়গা — এখানে সরাসরি কোনো টাকার লেনদেন হয় না। নগদ,
              bKash বা Nagad-এ যা পেমেন্ট বাইরে থেকে পেয়েছেন, সেটা যাচাই করে এখানে
              ম্যানুয়ালি এন্ট্রি দিন।
            </p>
          </div>

          <div className="mt-8">
            <AdminFeeForm />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
