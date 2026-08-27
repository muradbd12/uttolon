"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, limit, type Timestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Bell } from "lucide-react";

type Notice = { id: string; title: string; category: string; publishedAt?: Timestamp };

export default function RecentNotices() {
  const [notices, setNotices] = useState<Notice[] | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "notices"), orderBy("publishedAt", "desc"), limit(5));
        const snapshot = await getDocs(q);
        setNotices(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Notice)));
      } catch {
        setNotices([]);
      }
    }
    load();
  }, []);

  return (
    <div className="rounded-sm border border-line bg-paper p-6">
      <div className="flex items-center gap-2">
        <Bell size={17} className="text-gold-deep" />
        <h2 className="font-display-bn text-lg text-ink">নোটিশ</h2>
      </div>
      {notices === null ? (
        <p className="mt-4 text-sm text-ink-soft/60">লোড হচ্ছে...</p>
      ) : notices.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft/60">এখনো কোনো নোটিশ প্রকাশিত হয়নি।</p>
      ) : (
        <div className="mt-4 space-y-3">
          {notices.map((n) => (
            <div key={n.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
              <p className="text-sm text-ink">{n.title}</p>
              <p className="mt-1 text-xs text-ink-soft/60">{n.category}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
