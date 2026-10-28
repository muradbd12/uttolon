"use client";

import { useEffect, useState } from "react";
import { Sparkles, CalendarDays } from "lucide-react";
import { useUserProfile } from "@/lib/useUserProfile";

function greeting(h: number) {
  if (h < 5) return "শুভ রাত্রি";
  if (h < 12) return "শুভ সকাল";
  if (h < 16) return "শুভ দুপুর";
  if (h < 19) return "শুভ বিকেল";
  return "শুভ সন্ধ্যা";
}

export default function AdminWelcome() {
  const profile = useUserProfile();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const dateText = now
    ? now.toLocaleDateString("bn-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "";
  const timeText = now ? now.toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" }) : "";

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-6 py-7 text-white shadow-lg sm:px-8"
      style={{ background: "linear-gradient(120deg, #14213b 0%, #1e3a8a 55%, #6d28d9 100%)" }}
    >
      <span className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/10" />
      <span className="pointer-events-none absolute -bottom-16 right-24 h-36 w-36 rounded-full bg-fuchsia-400/20" />
      <span className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-sky-300/20" />

      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-sky-200">
            <Sparkles size={13} /> Admin Dashboard
          </p>
          <h1 className="mt-2 font-display-bn text-2xl sm:text-3xl">
            {greeting(now ? now.getHours() : 9)}, {profile?.name || "অ্যাডমিন"}!
          </h1>
          <p className="mt-1.5 text-sm text-white/75">আজকের পুরো সারাংশ নিচে — সব সংখ্যা সত্যিকারের ডেটাবেস থেকে।</p>
        </div>
        {now && (
          <div className="rounded-xl bg-white/15 px-4 py-2.5 text-right backdrop-blur-sm">
            <p className="flex items-center justify-end gap-1.5 text-xs text-white/80">
              <CalendarDays size={13} /> {dateText}
            </p>
            <p className="mt-0.5 font-display-en text-lg font-semibold">{timeText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
