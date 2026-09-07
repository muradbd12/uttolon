import { GraduationCap, Stethoscope, Factory, BookOpen } from "lucide-react";

const timeline = [
  {
    year: "2006",
    title: "Hifzul Quran",
    body: "শৈশবেই পবিত্র কুরআন হিফজ সম্পন্ন করেন। হিফজের পথ তাঁকে শিখিয়েছে — একটি বড় লক্ষ্য অর্জনের জন্য প্রয়োজন ধৈর্য, নিয়মিত অনুশীলন, শৃঙ্খলা এবং ধারাবাহিকতা। এই মূল্যবোধ পরবর্তীতে তাঁর শিক্ষা-দর্শনের অন্যতম ভিত্তি হয়ে ওঠে।",
  },
  {
    year: "2013",
    title: "Dakhil",
    body: "Bandar Mohammadia Dakhil/Alim Madrasah থেকে Dakhil (SSC সমমান) পরীক্ষায় GPA 5.00/5.00 অর্জন করেন।",
  },
  {
    year: "2015",
    title: "Alim",
    body: "Khalilur Rahman Kamil/Alim Madrasah থেকে Alim (HSC সমমান) সম্পন্ন করেন, GPA 4.63/5.00।",
  },
  {
    year: "2015–16",
    title: "Paramedical Education",
    body: "Paramedical College, Noakhali-তে পড়াশোনার সঙ্গে যুক্ত হন। স্বাস্থ্য ও চিকিৎসাবিজ্ঞানের প্রতি এই আগ্রহ পরবর্তীতে তাঁকে আরও বড় স্বপ্নের দিকে নিয়ে যায়।",
  },
  {
    year: "2017",
    title: "চিকিৎসক হওয়ার স্বপ্ন",
    body: "MBBS পরীক্ষায় পাস করার পরও অর্থনৈতিক কারণে দেশে ভর্তি হওয়া সম্ভব হয়নি। একই বছর রাশিয়ার Kazan State Medical University থেকে Offer Letter পাওয়ার পরও প্রয়োজনীয় অর্থের ব্যবস্থা করতে না পারায় যাওয়া সম্ভব হয়নি। একটি স্বপ্ন থেমে গেলেও শেখার ইচ্ছা থামেনি।",
    quote: "সুযোগ থাকা আর সুযোগ গ্রহণ করতে পারা — দুটো এক বিষয় নয়।",
  },
  {
    year: "2018–19",
    title: "Waste to Wealth",
    body: "একটি প্লাস্টিক কারখানায় বাস্তবভাবে কাজ করে ও প্রশিক্ষণ নিয়ে দেখেছেন — কীভাবে বর্জ্যকে প্রক্রিয়াজাত করে মূল্যবান সম্পদে রূপান্তর করা যায়। এই Waste → Value → Wealth চিন্তাধারা পরবর্তীতে তাঁর উদ্যোক্তা-মনোভাব ও শিক্ষা-দর্শনের সঙ্গে যুক্ত হয়ে যায়।",
    quote: "যে জিনিসকে আমরা বর্জ্য মনে করি, সঠিক জ্ঞান ও প্রযুক্তি প্রয়োগ করলে সেটিই সম্পদে পরিণত হতে পারে।",
  },
  {
    year: "2021",
    title: "Fazil",
    body: "Islamic Arabic University থেকে Fazil (স্নাতক) সম্পন্ন করেন, CGPA 3.50/4.00।",
  },
  {
    year: "2024",
    title: "M.A. in Islamic Studies",
    body: "International Islamic University Chittagong (IIUC) থেকে M.A. in Islamic Studies সম্পন্ন করেন, CGPA 3.75/4.00।",
  },
];

const experiences = [
  { icon: BookOpen, label: "Quran", insight: "শৃঙ্খলা ও আত্মনিয়ন্ত্রণ" },
  { icon: BookOpen, label: "Madrasa Education", insight: "জ্ঞান, মূল্যবোধ ও নৈতিকতা" },
  { icon: Stethoscope, label: "Paramedical Education", insight: "স্বাস্থ্য ও মানুষের সেবার ধারণা" },
  { icon: Stethoscope, label: "Medical Education Journey", insight: "স্বপ্ন, সুযোগ ও বাস্তবতার শিক্ষা" },
  { icon: GraduationCap, label: "International Opportunity", insight: "বিশ্বমানের শিক্ষার আকাঙ্ক্ষা" },
  { icon: Factory, label: "Plastic Industry", insight: "বাস্তব দক্ষতা ও Waste to Wealth" },
  { icon: BookOpen, label: "Islamic Studies", insight: "জ্ঞান ও মূল্যবোধের গভীরতা" },
];

const beliefChain = ["দুর্বলতা", "Assessment", "Recovery", "Improvement", "Confidence", "Achievement"];

const dream = [
  "শিক্ষার্থী বুঝে শিখবে",
  "নিয়মিত মূল্যায়িত হবে",
  "নিজের দুর্বলতা জানতে পারবে",
  "প্রয়োজন অনুযায়ী Recovery Support পাবে",
  "বাস্তব জীবনের সঙ্গে জ্ঞানকে যুক্ত করতে শিখবে",
  "নিজের ভবিষ্যৎ সম্পর্কে সচেতন হবে",
  "Academic ও Admission বিষয়ে সঠিক Guidance পাবে",
];

export default function FounderStory() {
  return (
    <section className="border-b border-line bg-paper-raised">
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">The Journey Behind Uttolon</p>
        <h2 className="mt-3 font-display-bn text-3xl leading-[1.3] text-ink sm:text-4xl">
          একটি প্রতিষ্ঠানের জন্মের আগে ছিল একটি দীর্ঘ শিক্ষাযাত্রা
        </h2>
        <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
          Muhammad Rokon Uddin-এর শিক্ষাজীবন ছিল একরৈখিক নয়। কুরআন হিফজ থেকে মাদরাসা
          শিক্ষা, স্বাস্থ্য ও চিকিৎসাশিক্ষার স্বপ্ন, আন্তর্জাতিক শিক্ষার সুযোগ, বাস্তব
          শিল্প-অভিজ্ঞতা এবং পরবর্তীতে উচ্চশিক্ষা — বিভিন্ন অভিজ্ঞতার মধ্য দিয়ে গড়ে উঠেছে
          তাঁর শিক্ষা সম্পর্কে নিজস্ব দৃষ্টিভঙ্গি। এই অভিজ্ঞতাগুলোর সমন্বিত ফলই আজকের উত্তোলন।
        </p>

        <div className="mt-14 space-y-10 border-l-2 border-line pl-7 sm:pl-9">
          {timeline.map((item) => (
            <div key={item.year} className="relative">
              <span className="absolute -left-[34px] top-1 h-3 w-3 rounded-full border-2 border-gold-deep bg-paper-raised sm:-left-[42px]" />
              <p className="font-display-en text-sm font-medium text-gold-deep">{item.year}</p>
              <h3 className="mt-1 font-display-bn text-lg text-ink">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{item.body}</p>
              {item.quote && (
                <p className="mt-3 border-l-2 border-teal pl-4 font-display-en text-[15px] italic leading-relaxed text-teal-deep">
                  &ldquo;{item.quote}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-line pt-14">
          <h3 className="font-display-bn text-2xl text-ink">অভিজ্ঞতা থেকে একটি দৃষ্টিভঙ্গি</h3>
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {experiences.map(({ icon: Icon, label, insight }) => (
              <div key={label} className="flex items-start gap-3 rounded-sm border border-line bg-paper p-4">
                <Icon size={17} className="mt-0.5 shrink-0 text-teal" />
                <div>
                  <p className="text-sm font-medium text-ink">{label}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{insight}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 border-l-2 border-gold pl-5 font-display-bn text-lg leading-relaxed text-ink">
            &ldquo;আমরা কি এমন একটি শিক্ষা ব্যবস্থা তৈরি করতে পারি, যেখানে একজন শিক্ষার্থী
            শুধু পরীক্ষায় পাস করার জন্য নয়, বরং নিজের সম্ভাবনাকে কাজে লাগানোর জন্য শেখে?&rdquo;
          </p>
          <p className="mt-3 text-sm text-ink-soft">এই প্রশ্নের উত্তর খোঁজার পথেই জন্ম উত্তোলনের।</p>
        </div>

        <div className="mt-16 border-t border-line pt-14">
          <h3 className="font-display-bn text-2xl text-ink">কেন &ldquo;উত্তোলন&rdquo;?</h3>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            উত্তোলনের অর্থই হলো — উপরে ওঠা, উন্নতির দিকে এগিয়ে যাওয়া। কিন্তু উত্তোলনের কাছে
            এটি শুধু একটি নাম নয় — একজন শিক্ষার্থীর বর্তমান অবস্থান থেকে তার সম্ভাবনার
            উচ্চতায় পৌঁছানোর পুরো যাত্রাটিই হলো উত্তোলন।
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-2">
            {beliefChain.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-teal/40 bg-teal-soft px-3.5 py-1.5 text-sm text-teal-deep">
                  {step}
                </span>
                {i < beliefChain.length - 1 && <span className="text-ink-soft/40">→</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-line pt-14">
          <h3 className="font-display-bn text-2xl text-ink">প্রতিষ্ঠাতার বিশ্বাস</h3>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            মোহাম্মদ রোকন উদ্দিনের নিজের জীবনের অভিজ্ঞতা তাঁকে শিখিয়েছে — সুযোগ সবসময় সমান
            থাকে না। কেউ সুযোগ পেয়েও অর্থনৈতিক কারণে থেমে যায়। কেউ ভালো ফলাফল করেও সঠিক
            দিকনির্দেশনার অভাবে পিছিয়ে পড়ে। কেউ মেধাবী হলেও নিজের সম্ভাবনা সম্পর্কে জানে না।
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            তাই উত্তোলনের লক্ষ্য শুধু শিক্ষার্থীকে একটি পরীক্ষার জন্য প্রস্তুত করা নয় — লক্ষ্য
            হলো তার সম্ভাবনাকে শনাক্ত করা, তার দুর্বলতাকে চিহ্নিত করা, তার শেখার পথকে সংগঠিত
            করা এবং তাকে ধাপে ধাপে সামনে এগিয়ে দেওয়া।
          </p>
          <p className="mt-6 border-l-2 border-gold pl-5 font-display-en text-lg italic leading-relaxed text-ink">
            &ldquo;Waste is not always waste.&rdquo;
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            সঠিক প্রক্রিয়া ও সঠিক ব্যবস্থাপনায় একটি মূল্যহীন বস্তু যেমন মূল্যবান সম্পদে
            পরিণত হতে পারে, তেমনি একজন পিছিয়ে থাকা শিক্ষার্থীও সঠিক শিক্ষা, অনুশীলন, মূল্যায়ন
            ও দিকনির্দেশনার মাধ্যমে নিজের সম্ভাবনাকে বিকশিত করতে পারে। এটাই উত্তোলনের একটি
            গভীর দর্শন — <span className="font-medium text-ink">Potential → Process → Progress</span>।
          </p>
        </div>

        <div className="mt-16 border-t border-line pt-14">
          <h3 className="font-display-bn text-2xl text-ink">উত্তোলনের স্বপ্ন</h3>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            উত্তোলনের স্বপ্ন শুধু একটি Coaching Center তৈরি করা নয় — স্বপ্ন হলো এমন একটি
            Education Ecosystem তৈরি করা যেখানে:
          </p>
          <ul className="mt-5 space-y-2.5">
            {dream.map((d) => (
              <li key={d} className="flex items-start gap-3 text-[15px] text-ink">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep" />
                {d}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[15px] font-medium leading-relaxed text-ink">
            এবং সবচেয়ে গুরুত্বপূর্ণ — একজন শিক্ষার্থী যেন নিজের সম্ভাবনাকে কখনোই ছোট করে না দেখে।
          </p>
        </div>

        <div className="mt-16 rounded-sm border border-line bg-ink px-6 py-10 text-paper sm:px-10">
          <p className="font-label text-xs uppercase tracking-[0.2em] text-gold">Founder&rsquo;s Message</p>
          <p className="mt-5 font-display-bn text-xl leading-relaxed sm:text-2xl">
            &ldquo;আমার নিজের শিক্ষাজীবনে স্বপ্ন ছিল, সুযোগ ছিল, আবার সীমাবদ্ধতাও ছিল। কিছু
            দরজা খুলেছিল, কিছু দরজা অর্থনৈতিক বাস্তবতায় বন্ধ হয়ে গিয়েছিল। কিন্তু প্রতিটি
            অভিজ্ঞতা আমাকে কিছু না কিছু শিখিয়েছে। সেই শিক্ষাগুলোকে একটি প্রতিষ্ঠানের দর্শনে
            রূপ দেওয়ার চেষ্টা থেকেই উত্তোলনের পথচলা।&rdquo;
          </p>
          <p className="mt-6 text-[15px] leading-relaxed text-paper/80">
            আমি চাই, উত্তোলনের প্রতিটি শিক্ষার্থী শুধু একটি পরীক্ষার জন্য প্রস্তুত না হোক। সে
            যেন ভাবতে শেখে, বুঝতে শেখে, প্রশ্ন করতে শেখে, ভুল থেকে শিখতে শেখে এবং নিজের
            সম্ভাবনাকে কাজে লাগাতে শেখে। কারণ একজন শিক্ষার্থীর বর্তমান অবস্থান তার শেষ পরিচয়
            নয় — তার সামনে আরও অনেক দূর যাওয়ার সুযোগ আছে। আমাদের কাজ হলো সেই পথটি সহজ,
            সুশৃঙ্খল ও অর্থবহ করে দেওয়া।
          </p>
          <p className="mt-6 font-display-en text-sm tracking-wide text-gold">ভাবো • শেখো • গড়ো</p>
          <div className="mt-6 border-t border-paper/15 pt-5">
            <p className="text-[15px] font-medium text-paper">— Muhammad Rokon Uddin</p>
            <p className="mt-0.5 text-sm text-paper/60">Founder &amp; Director, উত্তোলন — Academic &amp; Admission Care</p>
          </div>
        </div>
      </div>
    </section>
  );
}
