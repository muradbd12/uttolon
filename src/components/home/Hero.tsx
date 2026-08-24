import Link from "next/link";

const steps = [
  { en: "CONCEPT", bn: "ধারণা", h: 78 },
  { en: "PRACTICE", bn: "অনুশীলন", h: 118 },
  { en: "ASSESSMENT", bn: "মূল্যায়ন", h: 158 },
  { en: "RECOVERY", bn: "পুনরুদ্ধার", h: 198 },
  { en: "RESULT", bn: "ফলাফল", h: 238 },
];

export default function Hero() {
  const baseline = 250;
  const gap = 108;
  const barWidth = 54;
  const startX = 40;

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">
            Concept · Practice · Assessment · Recovery · Result
          </p>
          <h1 className="mt-5 font-display-bn text-[2.35rem] leading-[1.2] text-ink sm:text-5xl sm:leading-[1.18]">
            শুধু পড়ানো নয়,
            <br />
            শেখার একটি সম্পূর্ণ ব্যবস্থা।
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft">
            <span className="font-display-en italic">Uttolon Learning System</span> —
            ধারণা, অনুশীলন, নিয়মিত মূল্যায়ন, দুর্বলতার পুনরুদ্ধার এবং সঠিক ফলাফলের
            পথে শিক্ষার্থীর প্রতিটি ধাপে পাশে থাকে উত্তোলন।
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/admission"
              className="rounded-sm bg-ink px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-gold-deep"
            >
              ভর্তি হোন
            </Link>
            <a
              href="#uls"
              className="rounded-sm border border-ink/20 px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-paper-raised"
            >
              Uttolon Learning System দেখুন
            </a>
          </div>
        </div>

        {/* Signature "elevation" graphic — the brand's literal meaning, rendered as ascending levels */}
        <div className="relative">
          <svg
            viewBox="0 0 620 300"
            className="w-full"
            role="img"
            aria-label="ধারণা থেকে ফলাফল পর্যন্ত পাঁচটি ধাপে ধাপে উত্তরণ দেখানো গ্রাফিক"
          >
            <line x1="20" y1={baseline} x2="600" y2={baseline} stroke="var(--line)" strokeWidth="1.5" />
            {steps.map((s, i) => {
              const x = startX + i * gap;
              const y = baseline - s.h;
              const isLast = i === steps.length - 1;
              return (
                <g key={s.en}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={s.h}
                    rx="3"
                    fill={isLast ? "var(--gold)" : "var(--ink)"}
                    opacity={isLast ? 1 : 0.14 + i * 0.14}
                  />
                  <circle cx={x + barWidth / 2} cy={y} r="4.5" fill={isLast ? "var(--gold-deep)" : "var(--ink)"} />
                  <text
                    x={x + barWidth / 2}
                    y={y - 14}
                    textAnchor="middle"
                    className="font-label"
                    fontSize="9.5"
                    letterSpacing="0.06em"
                    fill="var(--ink-soft)"
                  >
                    {s.en}
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={baseline + 24}
                    textAnchor="middle"
                    className="font-body"
                    fontSize="13"
                    fill="var(--ink)"
                  >
                    {s.bn}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
