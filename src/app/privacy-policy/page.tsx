import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "প্রাইভেসি পলিসি | Uttolon",
  description: "উত্তোলন কীভাবে শিক্ষার্থী ও অভিভাবকের তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষিত রাখে।",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">নীতিমালা</p>
        <h1 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">প্রাইভেসি পলিসি</h1>
        <p className="mt-2 text-sm text-ink-soft/60">সর্বশেষ আপডেট: {new Date().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="mt-8 space-y-7 text-[15px] leading-relaxed text-ink-soft">
          <div>
            <h2 className="font-display-bn text-lg text-ink">আমরা কী তথ্য সংগ্রহ করি</h2>
            <p className="mt-2">
              ভর্তি ফর্ম পূরণের সময় শিক্ষার্থীর নাম, জন্মতারিখ, ঠিকানা, মোবাইল নম্বর, অভিভাবকের
              মোবাইল নম্বর, পূর্ববর্তী প্রতিষ্ঠানের তথ্য ও একাডেমিক তথ্য সংগ্রহ করা হয়। এছাড়া
              উপস্থিতি, মূল্যায়নের ফলাফল ও পেমেন্টের তথ্যও সংরক্ষণ করা হয়, যা পরিষেবা প্রদানের
              জন্য প্রয়োজনীয়।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">তথ্য কীভাবে ব্যবহার করা হয়</h2>
            <p className="mt-2">
              সংগৃহীত তথ্য শুধুমাত্র ভর্তি প্রক্রিয়া সম্পন্ন করা, ক্লাস/ব্যাচ পরিচালনা,
              শিক্ষার্থীর অগ্রগতি ট্র্যাক করা, অভিভাবকের সাথে যোগাযোগ এবং ফি/পেমেন্ট
              ব্যবস্থাপনার জন্য ব্যবহার করা হয়। বিজ্ঞাপন বা বিপণনের উদ্দেশ্যে কোনো তৃতীয়
              পক্ষের কাছে তথ্য বিক্রি বা হস্তান্তর করা হয় না।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">তথ্যের নিরাপত্তা</h2>
            <p className="mt-2">
              সব তথ্য নিরাপদ সার্ভারে (Google Firebase) সংরক্ষিত হয় এবং রোল-ভিত্তিক
              অ্যাক্সেস নিয়ন্ত্রণের মাধ্যমে সুরক্ষিত — অর্থাৎ শুধুমাত্র সংশ্লিষ্ট শিক্ষার্থী,
              তার অভিভাবক, দায়িত্বপ্রাপ্ত শিক্ষক ও অ্যাডমিনই প্রাসঙ্গিক তথ্য দেখতে পারেন।
              শিক্ষার্থীর ব্যক্তিগত তথ্য পাবলিকভাবে ওয়েবসাইটে প্রদর্শিত হয় না।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">পেমেন্ট সংক্রান্ত তথ্য</h2>
            <p className="mt-2">
              বর্তমানে পেমেন্ট ম্যানুয়ালি (নগদ/মোবাইল ব্যাংকিং) সংগ্রহ করা হয় এবং শুধু
              পরিমাণ ও পদ্ধতির তথ্য সিস্টেমে সংরক্ষণ করা হয় — কোনো কার্ড বা অ্যাকাউন্ট
              নম্বর ওয়েবসাইটে সংগ্রহ বা সংরক্ষণ করা হয় না।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">যোগাযোগ</h2>
            <p className="mt-2">
              এই নীতিমালা সংক্রান্ত কোনো প্রশ্ন থাকলে info@uttolonbd.com ইমেইলে অথবা{" "}
              <a href="/contact" className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
                যোগাযোগ পেজ
              </a>{" "}
              থেকে জানাতে পারেন।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
