import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "সাধারণ জিজ্ঞাসা (FAQ) | Uttolon",
  description: "ভর্তি, ফি, প্রোগ্রাম ও পেমেন্ট নিয়ে সচরাচর জিজ্ঞাসিত প্রশ্নের উত্তর।",
};

const faqs = [
  {
    q: "কীভাবে ভর্তি হবো?",
    a: "ওয়েবসাইটের /admission পেজে গিয়ে অনলাইন ফর্ম পূরণ করুন। ফর্মের শেষে কমপক্ষে আংশিক ভর্তি ফি পরিশোধ করলেই আবেদন জমা হয়ে যাবে এবং একটি আবেদন আইডি পাবেন।",
  },
  {
    q: "ভর্তির জন্য কী কী ডকুমেন্ট লাগবে?",
    a: "সাধারণত পূর্ববর্তী প্রতিষ্ঠানের সর্বশেষ রেজাল্ট/মার্কশিট ও এক কপি পাসপোর্ট সাইজ ছবি লাগে। নির্দিষ্ট প্রোগ্রাম অনুযায়ী বাড়তি কিছু লাগলে ভর্তি ফর্মেই উল্লেখ থাকে।",
  },
  {
    q: "ভর্তি ফি কি একবারেই দিতে হবে?",
    a: "না। ভর্তির সময় আংশিক পরিশোধ করে আবেদন জমা দেওয়া যায়, বাকি টাকা পরে যেকোনো সময় পরিশোধ করা যাবে — এজন্য আবার ভর্তি ফর্মে আসার দরকার নেই।",
  },
  {
    q: "বাকি ভর্তি ফি কীভাবে পরিশোধ করবো?",
    a: "ওয়েবসাইটের /payment পেজে গিয়ে মোবাইল নম্বর ও আবেদন আইডি দিয়ে বকেয়া দেখে সরাসরি পরিশোধ করতে পারবেন। স্টুডেন্ট বা গার্ডিয়ান অ্যাকাউন্ট থাকলে নিজের ড্যাশবোর্ড থেকেও পরিশোধ করা যায়।",
  },
  {
    q: "মাসিক বেতন কীভাবে জমা দেবো?",
    a: "মাসিক বেতনের হিসাব ও বকেয়া স্টুডেন্ট বা গার্ডিয়ান ড্যাশবোর্ডে দেখা যায়। পরিশোধ অফিসে সরাসরি বা প্রতিষ্ঠানের নির্ধারিত মাধ্যমে করা হয়।",
  },
  {
    q: "Recovery Batch কী এবং কাদের জন্য?",
    a: "যেসব শিক্ষার্থী নির্দিষ্ট একটি বা একাধিক বিষয়/অধ্যায়ে দুর্বল, তাদের জন্য বিশেষভাবে সাজানো ব্যাচ এটি — নিয়মিত মূল্যায়নের মাধ্যমে দুর্বলতা শনাক্ত করে লক্ষ্যভিত্তিক সহায়তা দেওয়া হয়।",
  },
  {
    q: "স্কলারশিপ/বিনামূল্যে পড়ার সুযোগ আছে কি?",
    a: "হ্যাঁ, মেধাবী ও প্রয়োজনগ্রস্ত শিক্ষার্থীদের জন্য নির্বাচিতভাবে বিনামূল্যে বা আংশিক বৃত্তির ব্যবস্থা আছে। বিস্তারিত ও আবেদনের জন্য /scholarship পেজ দেখুন।",
  },
  {
    q: "সন্তানের উপস্থিতি ও পড়াশোনার অগ্রগতি কীভাবে জানতে পারবো?",
    a: "গার্ডিয়ান অ্যাকাউন্টে লগইন করে উপস্থিতি, মূল্যায়ন, হোমওয়ার্ক ও ফি সংক্রান্ত সব তথ্য দেখা যায়। একটি গার্ডিয়ান আইডি দিয়ে একাধিক সন্তানের তথ্যও দেখা সম্ভব।",
  },
  {
    q: "ভর্তির তথ্যে ভুল হলে কী করবো?",
    a: "নিজে থেকে ফর্মের তথ্য পরিবর্তনের সুযোগ নেই। ভুল হলে অফিসে যোগাযোগ করুন — Admin যাচাই করে সংশোধন করে দেবেন।",
  },
  {
    q: "আরও কোনো প্রশ্ন থাকলে কীভাবে যোগাযোগ করবো?",
    a: "আমাদের কন্টাক্ট পেজ থেকে ফোন, ইমেইল বা ফর্মের মাধ্যমে যোগাযোগ করতে পারেন।",
  },
];

export default function FaqPage() {
  return (
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">FAQ</p>
        <h1 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">সাধারণ জিজ্ঞাসা</h1>
        <p className="mt-3 text-[15px] text-ink-soft">
          ভর্তি, ফি ও পেমেন্ট নিয়ে সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্নগুলোর উত্তর নিচে দেওয়া হলো।
        </p>

        <div className="mt-8 divide-y divide-line rounded-sm border border-line bg-paper">
          {faqs.map((f, i) => (
            <details key={i} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-ink">
                {f.q}
                <ChevronDown size={16} className="shrink-0 text-ink-soft transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>

        <p className="mt-8 text-sm text-ink-soft">
          উত্তর না পেলে{" "}
          <Link href="/contact" className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
            যোগাযোগ করুন
          </Link>
          , আমরা সাহায্য করব।
        </p>
      </div>
    </section>
  );
}
