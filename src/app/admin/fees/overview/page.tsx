import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminDuesOverview from "@/components/dashboard/AdminDuesOverview";

export const metadata: Metadata = {
  title: "সবার বকেয়া | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminDuesOverviewPage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <Link
            href="/admin/fees"
            className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={14} /> ফি ব্যবস্থাপনায় ফিরুন
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">সবার বকেয়া</h1>

          <div className="mt-4 flex items-start gap-2 rounded-sm border border-gold/30 bg-gold-soft/40 p-3 text-sm text-ink">
            <Info size={15} className="mt-0.5 shrink-0 text-gold-deep" />
            <p>
              প্রতিটা শিক্ষার্থীর ভর্তি-ফি ও সর্বশেষ মাসের ফি বকেয়া একসাথে — কারো নাম চাপলে
              বিস্তারিত এন্ট্রি দেখতে/দিতে &quot;ফি ব্যবস্থাপনা&quot; পেজে যান।
            </p>
          </div>

          <div className="mt-8">
            <AdminDuesOverview />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
