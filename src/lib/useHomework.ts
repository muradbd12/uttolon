"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type HomeworkItem = { id: string; title: string; subject: string; dueDate: string };

// একটা ক্লাসের জন্য দেওয়া হোমওয়ার্ক — Student dashboard-এ ব্যবহার হয়।
export function useHomework(className: string | null | undefined) {
  const [items, setItems] = useState<HomeworkItem[] | null>(null);

  useEffect(() => {
    if (!className) return;
    let cancelled = false;
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(
          collection(db, "homework"),
          where("className", "==", className),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        if (!cancelled) {
          setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as HomeworkItem)));
        }
      } catch {
        if (!cancelled) setItems([]);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [className]);

  return items;
}
