const cycle = [
  { bn: "শেখা", en: "Learn" },
  { bn: "অনুশীলন", en: "Practice" },
  { bn: "মূল্যায়ন", en: "Assess" },
  { bn: "শনাক্তকরণ", en: "Identify Gap" },
  { bn: "পুনরুদ্ধার", en: "Recover" },
  { bn: "পুনরাবৃত্তি", en: "Revise" },
  { bn: "প্রস্তুতি", en: "Prepare" },
  { bn: "উপস্থাপন", en: "Perform" },
];

export default function CycleDiagram() {
  const size = 460;
  const cx = size / 2;
  const cy = size / 2;
  const r = 168;
  const nodeR = 30;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto w-full max-w-md"
      role="img"
      aria-label="শেখা থেকে উপস্থাপন পর্যন্ত আটটি ধাপের চক্রাকার লার্নিং সাইকেল"
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
      <text x={cx} y={cy - 6} textAnchor="middle" className="font-display-bn" fontSize="17" fill="var(--ink)">
        Uttolon
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" className="font-label" fontSize="9" letterSpacing="0.1em" fill="var(--ink-soft)">
        LEARNING CYCLE
      </text>

      {cycle.map((step, i) => {
        const angle = (i / cycle.length) * 2 * Math.PI - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const isRecover = step.en === "Recover";
        return (
          <g key={step.en}>
            <circle
              cx={x}
              cy={y}
              r={nodeR}
              fill={isRecover ? "var(--gold)" : "var(--paper-raised)"}
              stroke={isRecover ? "var(--gold-deep)" : "var(--line)"}
              strokeWidth="1.5"
            />
            <text x={x} y={y - 3} textAnchor="middle" className="font-body" fontSize="10.5" fill={isRecover ? "var(--ink)" : "var(--ink)"}>
              {step.bn}
            </text>
            <text x={x} y={y + 10} textAnchor="middle" className="font-label" fontSize="7" letterSpacing="0.03em" fill={isRecover ? "var(--gold-deep)" : "var(--ink-soft)"}>
              {step.en}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
