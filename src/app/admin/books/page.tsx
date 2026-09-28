import type { Metadata } from "next";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminBooksManager from "@/components/AdminBooksManager";

export const metadata: Metadata = {
  title: "বই ব্যবস্থাপনা | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminBooksPage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
          <h1 className="font-display-bn text-2xl text-ink sm:text-3xl">বই ব্যবস্থাপনা</h1>
          <p className="mt-2 text-sm text-ink-soft">
            বই যোগ, সম্পাদনা ও মুছে ফেলুন — এখানে যা থাকবে তাই পাবলিক /books পেজে দেখা যাবে।
          </p>
          <div className="mt-8">
            <AdminBooksManager />
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
