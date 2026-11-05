import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import QuranLogManager from "@/components/QuranLogManager";

export const metadata: Metadata = {
  title: "কুরআন শিক্ষা অগ্রগতি | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminQuranPage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
          <Link href="/admin/dashboard" className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft size={14} /> ড্যাশবোর্ডে ফিরুন
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">কুরআন শিক্ষা অগ্রগতি</h1>
          <p className="mt-2 text-sm text-ink-soft">
            প্রতিদিন কী পড়ানো হলো, কেমন পারল ও কোন পারা শেষ হলো — এখানে লিখে রাখলে শিক্ষার্থী ও অভিভাবক নিজেদের
            ড্যাশবোর্ডে "কুরআন শিক্ষা — অগ্রগতি" কার্ডে দেখতে পাবে।
          </p>
          <div className="mt-8">
            <QuranLogManager />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
