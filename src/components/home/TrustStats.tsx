"use client";

import { useEffect, useState } from "react";

type Stats = { students: number; teachers: number; courses: number; assessments: number };

const labels: { key: keyof Stats; label: string }[] = [
  { key: "students", label: "শিক্ষার্থী" },
  { key: "teachers", label: "শিক্ষক" },
  { key: "courses", label: "কোর্স" },
  { key: "assessments", label: "সম্পন্ন মূল্যায়ন" },
];

export default function TrustStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/public/stats");
        if (!res.ok) throw new Error("unavailable");
        setStats(await res.json());
      } catch {
        setStats(null);
      }
    }
    load();
  }, []);

  return (
    <section className="border-b border-line bg-paper-raised">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
          {labels.map(({ key, label }) => (
            <div key={key} className="border-l border-line pl-4">
              <div className="font-display-en text-3xl text-ink">
                {stats ? stats[key] : "—"}
              </div>
              <div className="mt-1 text-sm text-ink-soft">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
