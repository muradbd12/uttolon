"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, type Timestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Bell, AlertTriangle, Loader2 } from "lucide-react";

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

type Notice = {
  id: string;
  title: string;
  category: string;
  publishedAt?: Timestamp;
};

function formatDate(ts?: Timestamp) {
  if (!ts) return "";
  return ts.toDate().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

export default function NoticesBoard() {
  const [active, setActive] = useState("সব");
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "notices"), orderBy("publishedAt", "desc"));
        const snapshot = await getDocs(q);
        setNotices(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Notice)));
      } catch {
        setError(true);
      }
    }
    load();
  }, []);

  const filtered =
    notices === null
      ? null
      : active === "সব"
        ? notices
        : notices.filter((n) => n.category === active);

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
        {error ? (
          <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-line p-12 text-center">
            <AlertTriangle size={20} className="text-clay" />
            <p className="text-sm text-ink-soft/60">নোটিশ লোড করা যায়নি — একটু পরে আবার চেষ্টা করুন।</p>
          </div>
        ) : filtered === null ? (
          <div className="flex items-center justify-center gap-2 py-16 text-ink-soft">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">লোড হচ্ছে...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-line p-12 text-center">
            <Bell size={22} className="text-ink-soft/40" />
            <p className="text-sm text-ink-soft/60">
              এই মুহূর্তে এই ক্যাটাগরিতে কোনো নোটিশ প্রকাশিত হয়নি।
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((n) => (
              <li key={n.id} className="rounded-sm border border-line p-5">
                <p className="text-[15px] text-ink">{n.title}</p>
                <p className="mt-1 text-xs text-ink-soft/60">
                  {n.category} · {formatDate(n.publishedAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
