const days = [
  {
    title: "Life Learning Day",
    bn: "লাইফ লার্নিং ডে",
    desc: "Science ও জীবনঘনিষ্ঠ বিষয়ের শিক্ষা।",
  },
  {
    title: "Nature Learning Day",
    bn: "নেচার লার্নিং ডে",
    desc: "Physics, Chemistry ও প্রাকৃতিক ঘটনা।",
  },
  {
    title: "Language Learning Day",
    bn: "ল্যাঙ্গুয়েজ লার্নিং ডে",
    desc: "বাংলা, English ও Arabic।",
  },
  {
    title: "Society Learning Day",
    bn: "সোসাইটি লার্নিং ডে",
    desc: "History, Geography ও সামাজিক উপলব্ধি।",
  },
  {
    title: "Assessment & Recovery Day",
    bn: "অ্যাসেসমেন্ট ও রিকভারি ডে",
    desc: "সাপ্তাহিক মূল্যায়ন, দুর্বলতা শনাক্তকরণ, Recovery ও Guardian ফিডব্যাক।",
  },
];

export default function DriverDay() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-xl">
          <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">Driver Day</p>
          <h2 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">
            প্রতিদিনের শেখার আলাদা উদ্দেশ্য
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            প্রতিটি দিনের একটি নির্দিষ্ট শেখার কেন্দ্রবিন্দু থাকে — প্রোগ্রাম অনুযায়ী
            নির্দিষ্ট সময়সূচি ভিন্ন হতে পারে।
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {days.map((d) => (
            <div key={d.title} className="rounded-sm border border-line p-5">
              <h3 className="font-display-bn text-base text-ink">{d.bn}</h3>
              <p className="font-label mt-1 text-[11px] uppercase tracking-wide text-ink-soft/60">
                {d.title}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
