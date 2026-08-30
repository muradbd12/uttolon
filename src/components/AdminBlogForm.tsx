"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Loader2, AlertCircle, Trash2, Info } from "lucide-react";

type Post = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  published: boolean;
};

const categories = [
  "Mathematics",
  "Science",
  "English",
  "Bangla",
  "Arabic",
  "Study Skills",
  "Exam Preparation",
  "Guardian Guide",
  "Career",
  "Education",
  "Practical Science",
];

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminBlogForm() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const db = getFirebaseDb();
      const q = query(collection(db, "blogPosts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setPosts(snapshot.docs.map((d) => d.data() as Post));
    } catch {
      setPosts([]);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const form = new FormData(e.currentTarget);
    const title = (form.get("title") as string)?.trim();
    const category = form.get("category") as string;
    const excerpt = (form.get("excerpt") as string)?.trim();
    const body = (form.get("body") as string)?.trim();
    const customSlug = (form.get("slug") as string)?.trim();
    if (!title || !category || !excerpt || !body) {
      setStatus("error");
      return;
    }
    const slug = slugify(customSlug || title);
    try {
      await setDoc(doc(getFirebaseDb(), "blogPosts", slug), {
        slug,
        title,
        category,
        excerpt,
        body,
        published: false,
        createdAt: serverTimestamp(),
      });
      (e.target as HTMLFormElement).reset();
      setStatus("idle");
      load();
    } catch {
      setStatus("error");
    }
  }

  async function togglePublished(post: Post) {
    setBusySlug(post.slug);
    try {
      await updateDoc(doc(getFirebaseDb(), "blogPosts", post.slug), { published: !post.published });
      setPosts((prev) =>
        prev ? prev.map((p) => (p.slug === post.slug ? { ...p, published: !p.published } : p)) : prev
      );
    } catch {
      setStatus("error");
    } finally {
      setBusySlug(null);
    }
  }

  async function handleDelete(slug: string) {
    if (!window.confirm("এই ব্লগ পোস্টটা মুছে ফেলতে চান? এটা আর ফিরিয়ে আনা যাবে না।")) return;
    setBusySlug(slug);
    try {
      await deleteDoc(doc(getFirebaseDb(), "blogPosts", slug));
      setPosts((prev) => (prev ? prev.filter((p) => p.slug !== slug) : prev));
    } catch {
      setStatus("error");
    } finally {
      setBusySlug(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 rounded-sm border border-gold/30 bg-gold-soft/40 p-3 text-sm text-ink">
        <Info size={15} className="mt-0.5 shrink-0 text-gold-deep" />
        <p>
          অনুচ্ছেদের মাঝে একটা ফাঁকা লাইন দিয়ে আলাদা করুন — প্রতিটা অনুচ্ছেদ আলাদাভাবে
          দেখাবে। নতুন লেখা Draft অবস্থায় থাকে, &quot;Publish&quot; না চাপা পর্যন্ত
          পাবলিক দেখা যাবে না।
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-line bg-paper p-6">
        {status === "error" && (
          <div className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
            <AlertCircle size={14} /> শিরোনাম, ক্যাটাগরি, সারসংক্ষেপ ও মূল লেখা — সবগুলো দিন।
          </div>
        )}

        <input required name="title" type="text" placeholder="শিরোনাম" className={inputClass} />
        <input
          name="slug"
          type="text"
          placeholder="URL slug (ঐচ্ছিক, ইংরেজিতে — না দিলে শিরোনাম থেকে বানানো হবে)"
          className={inputClass}
        />
        <select required name="category" className={inputClass} defaultValue="">
          <option value="" disabled>
            ক্যাটাগরি নির্বাচন করুন
          </option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <textarea required name="excerpt" rows={2} placeholder="সারসংক্ষেপ (লিস্টিং পেজে দেখাবে)" className={inputClass} />
        <textarea required name="body" rows={8} placeholder="মূল লেখা (অনুচ্ছেদের মাঝে ফাঁকা লাইন দিন)" className={inputClass} />

        <button
          type="submit"
          disabled={status === "saving"}
          className="flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
        >
          {status === "saving" && <Loader2 size={14} className="animate-spin" />}
          Draft হিসেবে সংরক্ষণ করুন
        </button>
      </form>

      {posts === null ? (
        <div className="flex items-center justify-center gap-2 py-10 text-ink-soft">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">লোড হচ্ছে...</span>
        </div>
      ) : posts.length === 0 ? (
        <p className="rounded-sm border border-dashed border-line p-8 text-center text-sm text-ink-soft/60">
          Admin থেকে এখনো কোনো ব্লগ পোস্ট যোগ করা হয়নি।
        </p>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.slug} className="rounded-sm border border-line p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[15px] text-ink">{p.title}</p>
                  <p className="mt-1 text-xs text-ink-soft/60">
                    /blog/{p.slug} · {p.category}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-sm px-2 py-0.5 text-xs font-medium ${
                    p.published ? "bg-teal-soft text-teal-deep" : "bg-line text-ink-soft"
                  }`}
                >
                  {p.published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => togglePublished(p)}
                  disabled={busySlug === p.slug}
                  className="rounded-sm border border-line px-3 py-1.5 text-xs text-ink hover:border-ink disabled:opacity-50"
                >
                  {p.published ? "Unpublish করুন" : "Publish করুন"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.slug)}
                  disabled={busySlug === p.slug}
                  className="flex items-center gap-1 rounded-sm border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-clay hover:text-clay disabled:opacity-50"
                >
                  <Trash2 size={12} /> মুছুন
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
