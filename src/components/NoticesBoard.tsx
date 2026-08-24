"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

const categories = [
  "সব",
  "Academic",
  "Examination",
  "Admission",
  "Result",
  "Holiday",
  "Scholarship",
  "Important Announcement",
];

// এখনো কোনো নোটিশ অ্যাডমিন প্যানেল থেকে প্রকাশিত হয়নি — এই তালিকা খালি রাখা
// হয়েছে যাতে বানানো (fabricated) কোনো নোটিশ না দেখানো হয়।
const notices: { title: string; category: string; date: string }[] = [];

export default function NoticesBoard() {
  const [active, setActive] = useState("সব");
  const filtered =
    active === "সব" ? notices : notices.filter((n) => n.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
              active === c
                ? "border-ink bg-ink text-paper"
                : "border-line text-ink-soft hover:border-ink/40"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-line p-12 text-center">
            <Bell size={22} className="text-ink-soft/40" />
            <p className="text-sm text-ink-soft/60">
              এই মুহূর্তে এই ক্যাটাগরিতে কোনো নোটিশ প্রকাশিত হয়নি।
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((n) => (
              <li key={n.title} className="rounded-sm border border-line p-5">
                <p className="text-[15px] text-ink">{n.title}</p>
                <p className="mt-1 text-xs text-ink-soft/60">
                  {n.category} · {n.date}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
