"use client";

import { useEffect, useState } from "react";
import { CalendarDays, UserRound } from "lucide-react";

type Role = "student" | "guardian" | "teacher";

const THEME: Record<Role, { label: string; gradient: string }> = {
  student: { label: "Student Dashboard", gradient: "linear-gradient(120deg, #0f3d5e 0%, #0e7490 55%, #10b981 100%)" },
  guardian: { label: "Guardian Dashboard", gradient: "linear-gradient(120deg, #3b1d6e 0%, #6d28d9 55%, #ec4899 100%)" },
  teacher: { label: "Teacher Dashboard", gradient: "linear-gradient(120deg, #14213b 0%, #1d4ed8 55%, #06b6d4 100%)" },
};

function greeting(h: number) {
  if (h < 5) return "শুভ রাত্রি";
  if (h < 12) return "শুভ সকাল";
  if (h < 16) return "শুভ দুপুর";
  if (h < 19) return "শুভ বিকেল";
  return "শুভ সন্ধ্যা";
}

// Colourful welcome banner shared by the student, guardian and teacher dashboards
// (the admin dashboard has its own, AdminWelcome).
export default function RoleWelcome({
  role,
  name,
  line,
  chip,
}: {
  role: Role;
  name?: string | null;
  line?: string;
  chip?: string | null;
}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const theme = THEME[role];
  const dateText = now ? now.toLocaleDateString("bn-BD", { weekday: "long", day: "numeric", month: "long" }) : "";

  return (
    <div className="relative overflow-hidden rounded-2xl px-6 py-7 text-white shadow-lg sm:px-8" style={{ background: theme.gradient }}>
      <span className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/10" />
      <span className="pointer-events-none absolute -bottom-16 right-24 h-36 w-36 rounded-full bg-white/10" />
      <span className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-white/10" />

      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/75">{theme.label}</p>
          <h1 className="mt-2 font-display-bn text-2xl sm:text-3xl">
            {greeting(now ? now.getHours() : 9)}, {name || "..."}!
          </h1>
          {line && <p className="mt-1.5 text-sm text-white/85">{line}</p>}
        </div>
        <div className="space-y-1.5 text-right">
          {chip && (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-sm backdrop-blur-sm">
              <UserRound size={14} /> {chip}
            </p>
          )}
          {dateText && (
            <p className="flex items-center justify-end gap-1.5 text-xs text-white/80">
              <CalendarDays size={13} /> {dateText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
