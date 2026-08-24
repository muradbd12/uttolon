export default function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-ink-soft">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full rounded-full bg-line">
        <div className="h-1.5 rounded-full bg-gold" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
