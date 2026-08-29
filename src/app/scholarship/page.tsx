import type { Metadata } from "next";
import ScholarshipForm from "@/components/ScholarshipForm";

export const metadata: Metadata = {
  title: "বৃত্তি আবেদন | Uttolon",
  description: "উত্তোলনের বৃত্তি/আর্থিক সহায়তার জন্য আবেদন করুন।",
};

export default function ScholarshipPage() {
  return (
    <section>
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">
          উত্তোলন সবার জন্য
        </p>
        <h1 className="mt-4 font-display-bn text-3xl text-ink sm:text-4xl">বৃত্তি আবেদন</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          মেধাবী ও প্রয়োজনগ্রস্ত শিক্ষার্থীদের জন্য নির্বাচিতভাবে সহায়তা প্রদান করা হয়।
          নিচের ফর্মটি পূরণ করুন — আমরা যাচাই করে যোগাযোগ করব।
        </p>
        <div className="mt-10">
          <ScholarshipForm />
        </div>
      </div>
    </section>
  );
}
