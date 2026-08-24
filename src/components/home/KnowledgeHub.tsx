import Link from "next/link";
import { Bell, ArrowUpRight } from "lucide-react";
import { blogPosts } from "@/content/blog";

export default function KnowledgeHub() {
  return (
    <section id="notice" className="scroll-mt-20 border-b border-line">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">Knowledge Hub</p>
            <h2 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">
              ব্লগ ও নোটিশ
            </h2>
          </div>
          <Link href="/blog" className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-gold-deep">
            সব ব্লগ দেখুন <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-sm border border-line bg-paper-raised p-5 transition-colors hover:border-ink"
            >
              <span className="font-label w-fit rounded-full bg-teal-soft px-2.5 py-1 text-[10px] uppercase tracking-wide text-teal-deep">
                {post.category}
              </span>
              <h3 className="mt-3 font-display-bn text-base leading-snug text-ink">{post.title}</h3>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between rounded-sm border border-dashed border-line p-6">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-ink-soft/40" />
            <p className="text-sm text-ink-soft/60">নোটিশ বোর্ড — ভর্তি, পরীক্ষা ও ফলাফল সংক্রান্ত ঘোষণা।</p>
          </div>
          <Link href="/notices" className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink hover:text-gold-deep">
            নোটিশ দেখুন <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
