import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "শর্তাবলী | Uttolon",
  description: "উত্তোলনের ওয়েবসাইট ও শিক্ষা সেবা ব্যবহারের শর্তাবলী।",
};

export default function TermsPage() {
  return (
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">নীতিমালা</p>
        <h1 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">শর্তাবলী</h1>
        <p className="mt-2 text-sm text-ink-soft/60">সর্বশেষ আপডেট: {new Date().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="mt-8 space-y-7 text-[15px] leading-relaxed text-ink-soft">
          <div>
            <h2 className="font-display-bn text-lg text-ink">১. সাধারণ</h2>
            <p className="mt-2">
              এই ওয়েবসাইট ও এর মাধ্যমে প্রদত্ত শিক্ষা সেবা ব্যবহার করলে আপনি নিচের
              শর্তাবলীর সাথে সম্মত হচ্ছেন বলে ধরে নেওয়া হবে।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">২. ভর্তি ও তথ্যের সঠিকতা</h2>
            <p className="mt-2">
              ভর্তি ফর্মে প্রদত্ত সব তথ্য সত্য ও সঠিক হতে হবে। ভুল বা অসম্পূর্ণ তথ্যের
              কারণে সৃষ্ট যেকোনো জটিলতার দায় আবেদনকারী/অভিভাবকের। ভর্তি চূড়ান্ত হবে
              প্রতিষ্ঠানের অনুমোদন ও আসন সাপেক্ষে।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">৩. ফি ও পেমেন্ট</h2>
            <p className="mt-2">
              নির্ধারিত ফি যথাসময়ে পরিশোধ করা শিক্ষার্থী/অভিভাবকের দায়িত্ব। ধারাবাহিক
              বকেয়ার ক্ষেত্রে প্রতিষ্ঠান ক্লাসে অংশগ্রহণ সাময়িকভাবে স্থগিত রাখার অধিকার
              রাখে।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">৪. আচরণবিধি</h2>
            <p className="mt-2">
              শিক্ষার্থীদের প্রতিষ্ঠানের নিয়ম-শৃঙ্খলা মেনে চলতে হবে। শিক্ষক ও অন্যান্য
              শিক্ষার্থীদের সাথে সম্মানজনক আচরণ প্রত্যাশিত।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">৫. দায়বদ্ধতার সীমাবদ্ধতা</h2>
            <p className="mt-2">
              প্রতিষ্ঠান যথাসাধ্য মানসম্মত শিক্ষা নিশ্চিত করার চেষ্টা করে, তবে নির্দিষ্ট
              পরীক্ষার ফলাফল বা গ্রেডের নিশ্চয়তা দেওয়া হয় না — ফলাফল শিক্ষার্থীর নিজস্ব
              প্রচেষ্টা ও অংশগ্রহণের ওপরও নির্ভরশীল।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">৬. পরিবর্তনের অধিকার</h2>
            <p className="mt-2">
              প্রতিষ্ঠান প্রয়োজন অনুযায়ী প্রোগ্রাম, সময়সূচি, ফি কাঠামো বা এই শর্তাবলী
              পরিবর্তনের অধিকার সংরক্ষণ করে। উল্লেখযোগ্য পরিবর্তন নোটিশ বোর্ড বা সরাসরি
              যোগাযোগের মাধ্যমে জানানো হবে।
            </p>
          </div>

          <div>
            <h2 className="font-display-bn text-lg text-ink">৭. যোগাযোগ</h2>
            <p className="mt-2">
              এই শর্তাবলী সংক্রান্ত প্রশ্নে info@uttolonbd.com অথবা{" "}
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
