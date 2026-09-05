import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminPracticalLearningForm from "@/components/AdminPracticalLearningForm";

export const metadata: Metadata = {
  title: "Practical Learning | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminPracticalLearningPage() {
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
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">Practical Learning পরিচালনা</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Publish করা এন্ট্রি হোমপেজ ও /practical-learning পেজে দেখা যাবে।
          </p>
          <div className="mt-8">
            <AdminPracticalLearningForm />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
