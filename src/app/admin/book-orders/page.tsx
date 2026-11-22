import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminBookOrders from "@/components/AdminBookOrders";

export const metadata: Metadata = {
  title: "বইয়ের অর্ডার | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminBookOrdersPage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
          <Link href="/admin/books" className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft size={14} /> বই ব্যবস্থাপনায় ফিরুন
          </Link>
          <h1 className="mt-4 font-display-bn text-2xl text-ink sm:text-3xl">বইয়ের অর্ডার</h1>
          <p className="mt-2 text-sm text-ink-soft">কার্ট থেকে আসা সব অর্ডার — ক্রেতার ফোন/ঠিকানা, কোন বই কয়টা, মোট টাকা। কল বা WhatsApp-এ যোগাযোগ করে অবস্থা (নতুন → নিশ্চিত → ডেলিভারি হয়েছে / বাতিল) বদলান।</p>
          <div className="mt-8">
            <AdminBookOrders />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
