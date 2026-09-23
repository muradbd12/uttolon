import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, Info } from "lucide-react";
import RequireRoleAuth from "@/components/RequireRoleAuth";

export const metadata: Metadata = {
  title: "Settings | Admin | Uttolon",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
      <section className="bg-paper-raised">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
          <h1 className="font-display-bn text-2xl text-ink sm:text-3xl">Settings</h1>
          <p className="mt-2 text-sm text-ink-soft">অ্যাকাউন্ট ও সিস্টেম-সংক্রান্ত সেটিংস।</p>

          <div className="mt-8 space-y-4">
            <Link
              href="/admin/reset-password"
              className="flex items-center gap-3 rounded-sm border border-line bg-paper p-4 hover:border-ink"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
                <KeyRound size={18} />
              </span>
              <span>
                <span className="block text-sm font-medium text-ink">অন্যদের পাসওয়ার্ড রিসেট</span>
                <span className="block text-xs text-ink-soft/70">
                  স্টুডেন্ট/গার্ডিয়ান/টিচার পাসওয়ার্ড ভুলে গেলে এখান থেকে নতুন পাসওয়ার্ড দিন
                </span>
              </span>
            </Link>
          </div>

          <div className="mt-8 flex items-start gap-2 rounded-sm border border-gold/30 bg-gold-soft/40 p-3 text-sm text-ink">
            <Info size={15} className="mt-0.5 shrink-0 text-gold-deep" />
            <p>
              ওয়েবসাইটের তথ্য (ঠিকানা, ফোন, সোশ্যাল লিংক ইত্যাদি) সরাসরি এখান থেকে বদলানোর সুবিধা
              এখনো যোগ করা হয়নি — এটা পরে আলাদাভাবে যোগ করা হবে।
            </p>
          </div>
        </div>
      </section>
    </RequireRoleAuth>
  );
}
