import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { blogPosts } from "@/content/blog";

export const metadata: Metadata = {
  title: "ব্লগ | Uttolon",
  description: "পড়াশোনার কৌশল, পরীক্ষার প্রস্তুতি ও গার্ডিয়ানদের জন্য উত্তোলনের ব্লগ।",
};

export default function BlogPage() {
  return (
    <section>
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">Knowledge Hub</p>
        <h1 className="mt-4 font-display-bn text-3xl text-ink sm:text-4xl">ব্লগ</h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          পড়াশোনার কৌশল, পরীক্ষার প্রস্তুতি এবং গার্ডিয়ানদের জন্য লেখা।
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
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
                <span>{post.date} · {post.readMinutes} মিনিট</span>
                <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
