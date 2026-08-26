import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminCreateUserForm from "@/components/AdminCreateUserForm";

export const metadata: Metadata = {
  title: "অ্যাকাউন্ট তৈরি | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
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
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">
            শিক্ষার্থী / গার্ডিয়ান / শিক্ষক অ্যাকাউন্ট তৈরি করুন
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            অ্যাকাউন্ট তৈরি হওয়ার পর লগইন তথ্য সংশ্লিষ্ট ব্যক্তিকে সরাসরি জানিয়ে দিন।
          </p>
          <div className="mt-8">
            <AdminCreateUserForm />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
