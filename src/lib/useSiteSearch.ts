"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type SearchItem = {
  type: "notice" | "blog" | "resource" | "teacher";
  typeLabel: string;
  title: string;
  subtitle: string;
  href: string;
};

const staticPages: SearchItem[] = [
  { type: "resource", typeLabel: "পেজ", title: "উত্তোলন সম্পর্কে", subtitle: "About", href: "/about" },
  { type: "resource", typeLabel: "পেজ", title: "প্রোগ্রাম", subtitle: "Programs", href: "/programs" },
  { type: "resource", typeLabel: "পেজ", title: "ভর্তি আবেদন", subtitle: "Admission", href: "/admission" },
  { type: "resource", typeLabel: "পেজ", title: "বৃত্তি আবেদন", subtitle: "Scholarship", href: "/scholarship" },
  { type: "resource", typeLabel: "পেজ", title: "যোগাযোগ", subtitle: "Contact", href: "/contact" },
];

// সাইটের সব real, পাবলিক কনটেন্ট (নোটিশ, ব্লগ, রিসোর্স, শিক্ষক) + কিছু
// স্ট্যাটিক পেজ — একবার লোড হয়ে ক্লায়েন্ট-সাইডে ফিল্টার হয় (এই স্কেলে
// আলাদা কোনো সার্চ সার্ভিস দরকার নেই)।
export function useSiteSearch() {
  const [items, setItems] = useState<SearchItem[] | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const [noticesSnap, blogSnap, resourcesSnap, teachersSnap] = await Promise.all([
          getDocs(collection(db, "notices")),
          getDocs(query(collection(db, "blogPosts"), where("published", "==", true))),
          getDocs(collection(db, "resources")),
          getDocs(query(collection(db, "teacherProfiles"), where("published", "==", true))),
        ]);

        const notices: SearchItem[] = noticesSnap.docs.map((d) => ({
          type: "notice",
          typeLabel: "নোটিশ",
          title: (d.data().title as string) || "",
          subtitle: (d.data().category as string) || "",
          href: "/notices",
        }));

        const blogs: SearchItem[] = blogSnap.docs.map((d) => ({
          type: "blog",
          typeLabel: "ব্লগ",
          title: (d.data().title as string) || "",
          subtitle: (d.data().category as string) || "",
          href: `/blog/${d.data().slug}`,
        }));

        const resources: SearchItem[] = resourcesSnap.docs.map((d) => ({
          type: "resource",
          typeLabel: "রিসোর্স",
          title: (d.data().title as string) || "",
          subtitle: `${d.data().className || ""} · ${d.data().subject || ""}`,
          href: "/resources",
        }));

        const teachers: SearchItem[] = teachersSnap.docs.map((d) => ({
          type: "teacher",
          typeLabel: "শিক্ষক",
          title: (d.data().name as string) || "",
          subtitle: (d.data().subject as string) || "",
          href: "/teachers",
        }));

        setItems([...staticPages, ...notices, ...blogs, ...resources, ...teachers]);
      } catch {
        setItems(staticPages);
      }
    }
    load();
  }, []);

  function search(searchQuery: string): SearchItem[] {
    const q = searchQuery.trim().toLowerCase();
    if (!q || !items) return [];
    return items.filter(
      (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    );
  }

  return { ready: items !== null, search };
}
