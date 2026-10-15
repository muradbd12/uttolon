"use client";

import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { DatabaseBackup, Loader2, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";

// Free manual backup: reads the collections in the browser (as the logged-in
// admin) and downloads one JSON file. Firebase's own automatic backups need a
// paid plan, so this is the no-card alternative.
const COLLECTIONS: { key: string; label: string }[] = [
  { key: "admissions", label: "ভর্তি আবেদন (পেমেন্ট সহ)" },
  { key: "users", label: "ইউজার প্রোফাইল" },
  { key: "fees", label: "মাসিক ফি" },
  { key: "attendance", label: "হাজিরা" },
  { key: "assessments", label: "মূল্যায়ন" },
  { key: "homework", label: "হোমওয়ার্ক" },
  { key: "schedule", label: "ক্লাস শিডিউল" },
  { key: "notices", label: "নোটিশ" },
  { key: "blogPosts", label: "ব্লগ" },
  { key: "resources", label: "রিসোর্স" },
  { key: "successStories", label: "সাফল্যের গল্প" },
  { key: "scholarshipApplications", label: "স্কলারশিপ আবেদন" },
  { key: "contactMessages", label: "যোগাযোগের বার্তা" },
  { key: "practicalLearning", label: "Practical Learning" },
  { key: "teacherProfiles", label: "শিক্ষক প্রোফাইল" },
  { key: "books", label: "বই" },
  { key: "gallery", label: "গ্যালারি" },
];

type Status = { state: "idle" | "running" | "done" | "error"; count?: number };

function serialize(v: unknown): unknown {
  if (v && typeof (v as { toDate?: unknown }).toDate === "function") {
    try {
      return (v as { toDate: () => Date }).toDate().toISOString();
    } catch {
      return null;
    }
  }
  if (Array.isArray(v)) return v.map(serialize);
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, serialize(x)]));
  }
  return v;
}

export default function AdminBackup() {
  const [running, setRunning] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [finished, setFinished] = useState(false);

  async function handleBackup() {
    setRunning(true);
    setFinished(false);
    setStatuses(Object.fromEntries(COLLECTIONS.map((c) => [c.key, { state: "idle" } as Status])));

    const db = getFirebaseDb();
    const result: Record<string, unknown[]> = {};
    const errors: string[] = [];

    for (const c of COLLECTIONS) {
      setStatuses((p) => ({ ...p, [c.key]: { state: "running" } }));
      try {
        const snap = await getDocs(collection(db, c.key));
        let docs: unknown[] = snap.docs.map((d) => ({ id: d.id, ...(serialize(d.data()) as Record<string, unknown>) }));

        if (c.key === "admissions") {
          const withPayments: unknown[] = [];
          for (let i = 0; i < snap.docs.length; i += 15) {
            const chunk = snap.docs.slice(i, i + 15);
            const chunkResults = await Promise.all(
              chunk.map(async (d) => {
                const pSnap = await getDocs(collection(db, "admissions", d.id, "payments"));
                return {
                  id: d.id,
                  ...(serialize(d.data()) as Record<string, unknown>),
                  payments: pSnap.docs.map((p) => ({ id: p.id, ...(serialize(p.data()) as Record<string, unknown>) })),
                };
              })
            );
            withPayments.push(...chunkResults);
          }
          docs = withPayments;
        }

        result[c.key] = docs;
        setStatuses((p) => ({ ...p, [c.key]: { state: "done", count: docs.length } }));
      } catch {
        errors.push(c.key);
        setStatuses((p) => ({ ...p, [c.key]: { state: "error" } }));
      }
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      note: "Uttolon data backup. Passwords are not included (they live in Firebase Authentication).",
      failedCollections: errors,
      counts: Object.fromEntries(Object.entries(result).map(([k, v]) => [k, v.length])),
      data: result,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uttolon-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setRunning(false);
    setFinished(true);
  }

  return (
    <div className="rounded-sm border border-line bg-paper p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-soft text-teal-deep">
          <DatabaseBackup size={18} />
        </span>
        <div className="flex-1">
          <h2 className="text-sm font-medium text-ink">ডেটা ব্যাকআপ ডাউনলোড</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft/70">
            ভর্তি, পেমেন্ট, ইউজার, হাজিরা, মূল্যায়ন সহ সব ডেটা একটা ফাইলে নামিয়ে রাখুন। সপ্তাহে বা মাসে
            একবার নিলেই যথেষ্ট — প্রতিবার সব ডেটা একবার করে পড়া হয়, তাই দিনে বারবার চাপবেন না।
          </p>

          <button
            type="button"
            onClick={handleBackup}
            disabled={running}
            className="mt-3 flex items-center gap-2 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
          >
            {running ? <Loader2 size={14} className="animate-spin" /> : <DatabaseBackup size={14} />}
            {running ? "ব্যাকআপ তৈরি হচ্ছে..." : "ব্যাকআপ নিন"}
          </button>

          {Object.keys(statuses).length > 0 && (
            <ul className="mt-4 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {COLLECTIONS.map((c) => {
                const st = statuses[c.key];
                return (
                  <li key={c.key} className="flex items-center gap-2 text-xs text-ink-soft">
                    {st?.state === "running" && <Loader2 size={12} className="animate-spin" />}
                    {st?.state === "done" && <CheckCircle2 size={12} className="text-teal-deep" />}
                    {st?.state === "error" && <AlertCircle size={12} className="text-clay" />}
                    {(!st || st.state === "idle") && <span className="h-3 w-3" />}
                    <span>
                      {c.label}
                      {st?.state === "done" && <span className="text-ink-soft/50"> — {st.count}টি</span>}
                      {st?.state === "error" && <span className="text-clay"> — পড়া যায়নি</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {finished && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-teal-deep">
              <CheckCircle2 size={13} /> ব্যাকআপ ফাইল ডাউনলোড হয়ে গেছে।
            </p>
          )}

          <p className="mt-4 flex items-start gap-1.5 rounded-sm border border-clay/20 bg-clay-soft/50 p-2.5 text-xs text-ink">
            <ShieldAlert size={13} className="mt-0.5 shrink-0 text-clay" />
            ফাইলে শিক্ষার্থী ও অভিভাবকের ব্যক্তিগত তথ্য থাকে — নিজের কাছে নিরাপদ জায়গায় রাখুন, অন্য কাউকে
            পাঠাবেন না। পাসওয়ার্ড এই ফাইলে থাকে না।
          </p>
        </div>
      </div>
    </div>
  );
}
