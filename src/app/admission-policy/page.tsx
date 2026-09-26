import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ভর্তি নীতিমালা | Uttolon",
  description: "উত্তোলনে ভর্তির যোগ্যতা, প্রক্রিয়া ও শর্তাবলী।",
};

export default function AdmissionPolicyPage() {
  return (
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">নীতিমালা</p>
        <h1 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">ভর্তি নীতিমালা</h1>

        <div className="mt-8 space-y-7 text-[15px] leading-relaxed text-ink-soft">
          <div>
            <h2 className="font-display-bn text-lg text-ink">যোগ্যতা</h2>
            <p className="mt-2">
              Class 3 থেকে Class 10, SSC, Dakhil, Alim, HSC ও University Admission —
              এই স্তরের শিক্ষার্থীরা উত্তোলনে ভর্তি হতে পারবেন। প্রতিটি প্রোগ্রামের
              নির্দিষ্ট বিবরণ{" "}
              <Link href="/programs" className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
                প্রোগ্রাম পেজে
              </Link>{" "}
              পাওয়া যাবে।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">আবেদন প্রক্রিয়া</h2>
            <p className="mt-2">
              অনলাইনে{" "}
              <Link href="/admission" className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
                ভর্তি ফর্ম
              </Link>{" "}
              পূরণ করে জমা দিতে হবে। জমা দেওয়ার জন্য কমপক্ষে আংশিক ভর্তি ফি তখনই
              পরিশোধ করতে হয়; বাকি ফি পরে যেকোনো সময় পরিশোধযোগ্য।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">আসন ও নিশ্চিতকরণ</h2>
            <p className="mt-2">
              প্রতিটি ব্যাচে আসনসংখ্যা সীমিত। আবেদন জমা হলেই ভর্তি স্বয়ংক্রিয়ভাবে
              চূড়ান্ত হয় না — প্রতিষ্ঠান তথ্য ও আসন সাপেক্ষে যাচাই করে চূড়ান্ত করে।
              আসন পূর্ণ হয়ে গেলে ওয়েটিং লিস্টে রাখা হতে পারে।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">তথ্য সংশোধন</h2>
            <p className="mt-2">
              আবেদন জমা দেওয়ার পর আবেদনকারী নিজে থেকে তথ্য সংশোধন করতে পারবেন না।
              কোনো ভুল থাকলে অফিসে যোগাযোগ করলে Admin যাচাই করে সংশোধন করে দেবেন।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">ফি সংক্রান্ত</h2>
            <p className="mt-2">
              ভর্তি ফি ও মাসিক বেতন সংক্রান্ত বিস্তারিত{" "}
              <Link href="/refund-policy" className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
                রিফান্ড পলিসি
              </Link>{" "}
              পেজে দেখুন।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
