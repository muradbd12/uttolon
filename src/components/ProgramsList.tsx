"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { usePrograms } from "@/lib/usePrograms";

export default function ProgramsList() {
  const programs = usePrograms();
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {programs.map((p) => (
        <div
          key={p.title}
          className={`flex flex-col rounded-sm border p-7 ${
            p.highlight ? "border-gold bg-ink text-paper" : "border-line bg-paper-raised"
          }`}
        >
          <h2 className="font-display-bn text-xl">{p.bn || p.title}</h2>
          <p className={`font-label mt-1 text-[11px] uppercase tracking-wide ${p.highlight ? "text-gold" : "text-ink-soft/60"}`}>
            {p.title}
          </p>
          <p className={`mt-4 flex-1 text-sm leading-relaxed ${p.highlight ? "text-paper/80" : "text-ink-soft"}`}>
            {p.longDesc || p.desc}
          </p>
          <Link
            href="/admission"
            className={`mt-6 flex w-fit items-center gap-1.5 rounded-sm px-4 py-2 text-sm font-medium ${
              p.highlight ? "bg-gold text-ink hover:bg-gold-soft" : "bg-ink text-paper hover:bg-gold-deep"
            }`}
          >
            ভর্তি হোন <ArrowUpRight size={14} />
          </Link>
        </div>
      ))}
    </div>
  );
}
