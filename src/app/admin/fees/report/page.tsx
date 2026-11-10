import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminIncomeReport from "@/components/AdminIncomeReport";

export const metadata: Metadata = {
  title: "আয় রিপোর্ট | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminIncomeReportPage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
      <section style={{ background: "linear-gradient(180deg, #e8effb 0%, #f4f7fc 38%, #fbfbf7 100%)" }}>
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <Link href="/admin/fees" className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft size={14} /> ফি ব্যবস্থাপনায় ফিরুন
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">আয় রিপোর্ট</h1>
          <p className="mt-2 text-sm text-ink-soft">
            কত টাকা এলো — দিন, মাস, পেমেন্টের পদ্ধতি, প্রোগ্রাম ও ক্লাস অনুযায়ী। সময়ের পরিসর বেছে নিন, CSV নামান বা প্রিন্ট করুন।
          </p>
          <div className="mt-8">
            <AdminIncomeReport />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
