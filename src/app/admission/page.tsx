import type { Metadata } from "next";
import AdmissionForm from "@/components/AdmissionForm";

export const metadata: Metadata = {
  title: "ভর্তি | Uttolon",
  description: "উত্তোলনে অনলাইনে ভর্তির আবেদন করুন।",
};

export default function AdmissionPage() {
  return (
    <section>
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">Admission</p>
        <h1 className="mt-4 font-display-bn text-3xl text-ink sm:text-4xl">ভর্তি আবেদন</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          নিচের ফর্মটি পূরণ করুন — কয়েক মিনিটেই আবেদন সম্পন্ন হবে।
        </p>

        <div className="mt-10">
          <AdmissionForm />
        </div>
      </div>
    </section>
  );
}
