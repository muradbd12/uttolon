import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminMessagesList from "@/components/AdminMessagesList";

export const metadata: Metadata = {
  title: "যোগাযোগ বার্তা | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminMessagesPage() {
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
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">যোগাযোগ বার্তা</h1>
          <p className="mt-2 text-sm text-ink-soft">Contact ফর্ম থেকে আসা সব বার্তা এখানে দেখা যাবে।</p>
          <div className="mt-8">
            <AdminMessagesList />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
