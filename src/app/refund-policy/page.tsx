import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "রিফান্ড পলিসি | Uttolon",
  description: "ভর্তি ফি ও মাসিক বেতন ফেরত সংক্রান্ত নীতিমালা।",
};

export default function RefundPolicyPage() {
  return (
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">নীতিমালা</p>
        <h1 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">রিফান্ড পলিসি</h1>
        <p className="mt-2 text-sm text-ink-soft/60">সর্বশেষ আপডেট: {new Date().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="mt-8 space-y-7 text-[15px] leading-relaxed text-ink-soft">
          <div>
            <h2 className="font-display-bn text-lg text-ink">ভর্তি ফি</h2>
            <p className="mt-2">
              ক্লাস শুরু হওয়ার আগে ভর্তি বাতিল করলে পরিশোধিত ভর্তি ফির একটি অংশ ফেরতযোগ্য
              হতে পারে; ক্লাস শুরু হওয়ার পর ভর্তি ফি ফেরতযোগ্য নয়।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">মাসিক বেতন</h2>
            <p className="mt-2">
              কোনো মাসে ভর্তি হয়ে ক্লাস শুরুর পর সেই মাসের বেতন ফেরতযোগ্য নয়। মাঝপথে
              ছাড়লে পরবর্তী মাসগুলোর অগ্রিম পরিশোধিত বেতন (যদি থাকে) ফেরত দেওয়া হবে।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">ব্যতিক্রম</h2>
            <p className="mt-2">
              ভুলবশত দুইবার পেমেন্ট হয়ে গেলে বা প্রতিষ্ঠানের পক্ষ থেকে ক্লাস বাতিল/স্থগিত
              হলে সংশ্লিষ্ট টাকা সম্পূর্ণ ফেরত দেওয়া হবে।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">রিফান্ড চাইবেন কীভাবে</h2>
            <p className="mt-2">
              রিফান্ডের জন্য আপনার আবেদন আইডি/মোবাইল নম্বরসহ সরাসরি অফিসে বা{" "}
              <a href="/contact" className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
                যোগাযোগ পেজ
              </a>{" "}
              থেকে জানান — অনুরোধ যাচাই করে সাধারণত কার্যদিবসের মধ্যে সিদ্ধান্ত জানানো হয়।
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-sm border border-gold/30 bg-gold-soft/40 p-4 text-sm text-ink">
          এই পেজের শর্তগুলো একটা সাধারণ খসড়া হিসেবে বসানো হয়েছে — আপনার প্রতিষ্ঠানের
          আসল সিদ্ধান্ত (যেমন কত দিনের মধ্যে আবেদন করলে কত শতাংশ ফেরত) অনুযায়ী লেখা
          বদলে নেওয়া দরকার।
        </div>
      </div>
    </section>
  );
}
