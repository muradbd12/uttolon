import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminResetPasswordForm from "@/components/AdminResetPasswordForm";

export const metadata: Metadata = {
  title: "পাসওয়ার্ড রিসেট | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminResetPasswordPage() {
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
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">পাসওয়ার্ড রিসেট</h1>
          <p className="mt-2 text-sm text-ink-soft">
            কেউ পাসওয়ার্ড ভুলে গেলে এখান থেকে নতুন পাসওয়ার্ড দিয়ে তাকে জানিয়ে দিন।
          </p>
          <div className="mt-8">
            <AdminResetPasswordForm />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
