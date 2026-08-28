"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type ScheduleItem = {
  id: string;
  className: string;
  subject: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  room?: string;
};

type Filter = { field: "className" | "teacherUid"; value: string | null | undefined };

// আজকের বার অনুযায়ী রুটিন — Student-এর জন্য className দিয়ে, Teacher-এর
// জন্য teacherUid দিয়ে ফিল্টার করা হয়।
export function useTodaySchedule(filter: Filter) {
  const [items, setItems] = useState<ScheduleItem[] | null>(null);

  useEffect(() => {
    if (!filter.value) return;
    let cancelled = false;
    async function load() {
      try {
        const db = getFirebaseDb();
        const today = new Date().getDay();
        const q = query(
          collection(db, "schedule"),
          where(filter.field, "==", filter.value),
          where("dayOfWeek", "==", today),
          orderBy("startTime")
        );
        const snapshot = await getDocs(q);
        if (!cancelled) {
          setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduleItem)));
        }
      } catch {
        if (!cancelled) setItems([]);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [filter.field, filter.value]);

  return items;
}
