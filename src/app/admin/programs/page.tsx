import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminProgramsManager from "@/components/AdminProgramsManager";

export const metadata: Metadata = {
  title: "প্রোগ্রাম ও ফি | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminProgramsPage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
          <Link href="/admin/dashboard" className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft size={14} /> ড্যাশবোর্ডে ফিরুন
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">প্রোগ্রাম ও ফি</h1>
          <p className="mt-2 text-sm text-ink-soft">
            এখানে যা বদলাবেন সেটাই হোমপেজ, /programs পেজ ও ভর্তি ফর্মে দেখাবে — ভর্তি ফর্মের ফি-ও এখান থেকে
            আসবে। আগে জমা হওয়া আবেদনের ফি বদলাবে না।
          </p>
          <div className="mt-8">
            <AdminProgramsManager />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
