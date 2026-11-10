import type { Metadata } from "next";
import VerifyCertificate from "@/components/VerifyCertificate";

export const metadata: Metadata = {
  title: "সনদ যাচাই | Uttolon",
  description: "উত্তোলন থেকে দেওয়া সনদ আসল কিনা যাচাই করুন।",
};

export default function VerifyPage() {
  return (
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">Certificate Verification</p>
        <h1 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">সনদ যাচাই</h1>
        <p className="mt-3 text-[15px] text-ink-soft">
          উত্তোলনের কোনো সনদ আসল কিনা জানতে সনদে ছাপা ৮ অক্ষরের যাচাই কোডটা লিখুন।
        </p>
        <div className="mt-8">
          <VerifyCertificate />
        </div>
      </div>
    </section>
  );
}
