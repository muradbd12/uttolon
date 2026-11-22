import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminBundlesManager from "@/components/AdminBundlesManager";

export const metadata: Metadata = {
  title: "বুক সেট / প্যাকেজ | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminBookBundlesPage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
          <Link href="/admin/books" className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft size={14} /> বই ব্যবস্থাপনায় ফিরুন
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">বুক সেট / প্যাকেজ</h1>
          <p className="mt-2 text-sm text-ink-soft">কয়েকটা বই একসাথে একটা ছাড়ের দামে বিক্রির সেট বানান — যেমন University Admission Book Set। বই সংগ্রহ পেজের ওপরে সেটগুলো দেখায়, ক্রেতা এক ক্লিকে পুরো সেট কার্টে নিতে পারে।</p>
          <div className="mt-8">
            <AdminBundlesManager />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
