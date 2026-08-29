import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminResourceForm from "@/components/AdminResourceForm";

export const metadata: Metadata = {
  title: "রিসোর্স লাইব্রেরি | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminResourcesPage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
          <Link
            href="/admin/dashboard"
            className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={14} /> ড্যাশবোর্ডে ফিরুন
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">রিসোর্স লাইব্রেরি</h1>
          <p className="mt-2 text-sm text-ink-soft">যোগ করা রিসোর্স সরাসরি পাবলিক ওয়েবসাইটে দেখা যাবে।</p>
          <div className="mt-8">
            <AdminResourceForm />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
