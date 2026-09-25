import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function AdmissionCTA() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--gold) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 sm:py-24">
        <p className="font-label text-xs uppercase tracking-[0.25em] text-gold">এখনই শুরু করুন</p>
        <h2 className="mt-4 font-display-bn text-3xl text-paper sm:text-4xl">
          Concept থেকে Confidence — যাত্রা শুরু হোক আজই
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] text-paper/70">
          অনলাইনে আবেদন করুন মাত্র কয়েক মিনিটে, আসন সীমিত।
        </p>
        <Link
          href="/admission"
          className="group mt-8 inline-flex items-center gap-2 rounded-sm bg-gold px-8 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-gold-deep hover:text-paper"
        >
          ভর্তি করুন
          <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </section>
  );
}
