"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where, orderBy, type Timestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ArrowUpRight } from "lucide-react";

type Post = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  createdAt?: Timestamp;
};

function formatDate(ts?: Timestamp) {
  if (!ts) return "";
  return ts.toDate().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

export default function DynamicBlogList() {
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(
          collection(db, "blogPosts"),
          where("published", "==", true),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        setPosts(snapshot.docs.map((d) => d.data() as Post));
      } catch {
        setPosts([]);
      }
    }
    load();
  }, []);

  if (posts === null || posts.length === 0) return null;

  return (
    <>
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="group flex flex-col rounded-sm border border-line bg-paper-raised p-6 transition-colors hover:border-ink"
        >
          <span className="font-label w-fit rounded-full bg-teal-soft px-2.5 py-1 text-[11px] uppercase tracking-wide text-teal-deep">
            {post.category}
          </span>
          <h2 className="mt-4 font-display-bn text-lg leading-snug text-ink">{post.title}</h2>
          <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
          <div className="mt-5 flex items-center justify-between text-xs text-ink-soft/60">
            <span>{formatDate(post.createdAt)}</span>
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </Link>
      ))}
    </>
  );
}
