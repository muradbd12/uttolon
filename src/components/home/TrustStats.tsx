"use client";

import { useEffect, useState } from "react";
import { Users, GraduationCap, BookOpen, ClipboardCheck } from "lucide-react";

type PublicStats = { students: number; teachers: number; courses: number; assessments: number };

const BN_DIGITS: Record<string, string> = {
  "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
  "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
};
function toBn(n: number) {
  return String(n).split("").map((c) => BN_DIGITS[c] ?? c).join("");
}

export default function TrustStats() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setStats(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const items = [
    { icon: Users, value: stats ? `${toBn(stats.students)}+` : "…", label: "শিক্ষার্থী" },
    { icon: GraduationCap, value: stats ? `${toBn(stats.teachers)}+` : "…", label: "শিক্ষক" },
    { icon: BookOpen, value: stats ? toBn(stats.courses) : "…", label: "প্রোগ্রাম" },
    { icon: ClipboardCheck, value: stats ? `${toBn(stats.assessments)}+` : "…", label: "মূল্যায়ন সম্পন্ন" },
  ];

  return (
    <section className="border-b border-line bg-ink">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-paper/10 px-5 sm:px-8 md:grid-cols-4">
        {items.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex flex-col items-center gap-2 bg-ink px-4 py-8 text-center">
              <Icon size={20} className="text-gold" />
              <p className="font-display-en text-2xl font-semibold text-paper sm:text-3xl">{s.value}</p>
              <p className="text-xs text-paper/60 sm:text-sm">{s.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
