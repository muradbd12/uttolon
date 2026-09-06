import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminEditUserForm from "@/components/AdminEditUserForm";

export const metadata: Metadata = {
  title: "তথ্য এডিট | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminEditUserPage() {
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
            শিক্ষার্থী / গার্ডিয়ান / শিক্ষকের তথ্য এডিট করুন
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            ক্লাস পরিবর্তন, নাম সংশোধন, বা নম্বর বদলাতে এখান থেকে হালনাগাদ করুন।
          </p>
          <div className="mt-8">
            <AdminEditUserForm />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
