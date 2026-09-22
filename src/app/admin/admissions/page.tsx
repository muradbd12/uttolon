import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminAdmissionsList from "@/components/AdminAdmissionsList";
import AdminBackfillButton from "@/components/AdminBackfillButton";

export const metadata: Metadata = {
  title: "ভর্তি আবেদন | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminAdmissionsPage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <Link
            href="/admin/dashboard"
            className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={14} /> ড্যাশবোর্ডে ফিরুন
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">ভর্তি আবেদন</h1>
          <p className="mt-2 text-sm text-ink-soft">
            ওয়েবসাইট থেকে জমা হওয়া সব আবেদন — সবচেয়ে নতুনটা উপরে।
          </p>
          <div className="mt-6">
            <AdminBackfillButton />
          </div>
          <div className="mt-8">
            <AdminAdmissionsList />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
