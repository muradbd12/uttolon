"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Globe } from "lucide-react";
import { getFirebaseDb } from "@/lib/firebase";
import { PALETTE } from "@/lib/dashboardColors";

// Applicants grouped by the country they live in (from the admission form).
// Older applications without a country are counted as Bangladesh.
export default function AdminCountryStats() {
  const [rows, setRows] = useState<{ country: string; count: number }[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(getFirebaseDb(), "admissions"));
        const map = new Map<string, number>();
        snap.docs.forEach((d) => {
          const c = ((d.data().country as string) || "বাংলাদেশ").trim() || "বাংলাদেশ";
          map.set(c, (map.get(c) || 0) + 1);
        });
        if (!cancelled) {
          setRows(Array.from(map, ([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count));
        }
      } catch {
        if (!cancelled) setRows([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!rows || rows.length === 0) return null;
  const max = Math.max(...rows.map((r) => r.count), 1);
  const total = rows.reduce((s, r) => s + r.count, 0);
  const abroad = total - (rows.find((r) => r.country === "বাংলাদেশ")?.count || 0);

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm" style={{ borderTop: "4px solid #06b6d4" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display-bn text-base text-ink">
          <Globe size={16} style={{ color: "#0e7490" }} /> দেশভিত্তিক আবেদনকারী
        </h3>
        <p className="text-xs text-ink-soft">
          মোট {total.toLocaleString("bn-BD")} · বিদেশ থেকে {abroad.toLocaleString("bn-BD")}
        </p>
      </div>
      <div className="mt-4 space-y-2.5">
        {rows.map((r, i) => {
          const c = PALETTE[i % PALETTE.length];
          return (
            <div key={r.country}>
              <div className="flex justify-between text-sm">
                <span className="text-ink">{r.country}</span>
                <span className="font-semibold text-ink">{r.count.toLocaleString("bn-BD")}</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-line">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${(r.count / max) * 100}%`, background: `linear-gradient(90deg, ${c.from}, ${c.to})` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
