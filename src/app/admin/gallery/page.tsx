import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminGalleryManager from "@/components/AdminGalleryManager";

export const metadata: Metadata = {
  title: "গ্যালারি ব্যবস্থাপনা | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminGalleryPage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <Link href="/admin/dashboard" className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft size={14} /> ড্যাশবোর্ডে ফিরুন
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">গ্যালারি ব্যবস্থাপনা</h1>
          <p className="mt-2 text-sm text-ink-soft">
            পাবলিক /gallery পেজে যেসব ছবি দেখা যাবে, তা এখান থেকে যোগ/মুছে ফেলা যাবে।
          </p>
          <div className="mt-8">
            <AdminGalleryManager />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
