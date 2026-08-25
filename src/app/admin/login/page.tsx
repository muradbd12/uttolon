import type { Metadata } from "next";
import AdminLoginForm from "@/components/AdminLoginForm";

export const metadata: Metadata = {
  title: "অ্যাডমিন লগইন | Uttolon",
  robots: { index: false },
};

export default function AdminLoginPage() {
  return (
    <section>
      <div className="mx-auto max-w-md px-5 py-16 sm:px-8 sm:py-24">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">Admin Panel</p>
        <h1 className="mt-4 font-display-bn text-3xl text-ink">অ্যাডমিন লগইন</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          শিক্ষার্থী, শিক্ষক, ভর্তি, ফি ও ওয়েবসাইট কনটেন্ট পরিচালনা করতে লগইন করুন।
        </p>
        <div className="mt-9">
          <AdminLoginForm />
        </div>
      </div>
    </section>
  );
}
