"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc, type Timestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ArrowLeft, Loader2 } from "lucide-react";

type Post = {
  title: string;
  category: string;
  body: string;
  createdAt?: Timestamp;
};

function formatDate(ts?: Timestamp) {
  if (!ts) return "";
  return ts.toDate().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

export default function DynamicBlogPost({ slug }: { slug: string }) {
  const [post, setPost] = useState<Post | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(getFirebaseDb(), "blogPosts", slug));
        if (snap.exists() && snap.data().published) {
          setPost(snap.data() as Post);
        } else {
          setPost(null);
        }
      } catch {
        setPost(null);
      }
    }
    load();
  }, [slug]);

  if (post === undefined) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-ink-soft">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">লোড হচ্ছে...</span>
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8">
        <h1 className="font-display-bn text-2xl text-ink">এই লেখাটি খুঁজে পাওয়া যায়নি</h1>
        <Link href="/blog" className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink underline">
          <ArrowLeft size={14} /> সব ব্লগ
        </Link>
      </div>
    );
  }

  const paragraphs = post.body.split(/\n\s*\n/).filter(Boolean);

  return (
    <article>
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-20">
        <Link href="/blog" className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft size={14} /> সব ব্লগ
        </Link>

        <span className="font-label mt-6 inline-block w-fit rounded-full bg-teal-soft px-2.5 py-1 text-[11px] uppercase tracking-wide text-teal-deep">
          {post.category}
        </span>
        <h1 className="mt-4 font-display-bn text-3xl leading-snug text-ink sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-ink-soft/60">{formatDate(post.createdAt)} · Uttolon Academic Team</p>

        <div className="mt-9 space-y-5 border-t border-line pt-9">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-ink">
              {para}
            </p>
          ))}
        </div>

        <div className="mt-12 rounded-sm border border-line bg-paper-raised p-6 text-center">
          <p className="text-sm text-ink-soft">আরও পড়াশোনার কৌশল ও গাইড পেতে চান?</p>
          <Link
            href="/blog"
            className="mt-3 inline-flex rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep"
          >
            আরও ব্লগ দেখুন
          </Link>
        </div>
      </div>
    </article>
  );
}
