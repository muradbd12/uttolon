import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function AdmissionCTA() {
  return (
    <section className="border-b border-line bg-paper-raised">
      <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 sm:py-20">
        <h2 className="font-display-bn text-3xl text-ink sm:text-4xl">
          Concept থেকে Confidence — যাত্রা শুরু হোক আজই
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] text-ink-soft">
          অনলাইনে আবেদন করুন মাত্র কয়েক মিনিটে, আসন সীমিত।
        </p>
        <Link
          href="/admission"
          className="group mt-8 inline-flex items-center gap-2 rounded-sm bg-ink px-7 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-gold-deep"
        >
          ভর্তি করুন
          <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </section>
  );
}
