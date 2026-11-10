import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import CertificateManager from "@/components/CertificateManager";

export const metadata: Metadata = {
  title: "সনদ | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminCertificatesPage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
          <Link href="/admin/dashboard" className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft size={14} /> ড্যাশবোর্ডে ফিরুন
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">সনদ (সার্টিফিকেট)</h1>
          <p className="mt-2 text-sm text-ink-soft">
            শিক্ষার্থী বেছে সনদ তৈরি করুন — প্রতিটা সনদে নিজে থেকে সনদ নম্বর ও গোপন যাচাই কোড বসে। সনদ প্রিন্ট করা যায়, আর
            শিক্ষার্থী/অভিভাবক নিজেদের ড্যাশবোর্ড থেকেও দেখে প্রিন্ট করতে পারে। যে কেউ /verify পেজে কোড দিয়ে সনদ আসল কিনা মেলাতে পারে।
          </p>
          <div className="mt-8">
            <CertificateManager />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
