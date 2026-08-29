import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { blogPosts } from "@/content/blog";
import DynamicBlogPost from "@/components/blog/DynamicBlogPost";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

// generateStaticParams-এ না থাকা slug-গুলো এখনো render হবে (dynamicParams
// এর ডিফল্ট true) — সেগুলোর জন্য DynamicBlogPost Firestore থেকে খুঁজবে।
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return { title: `${post.title} | Uttolon Blog`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return <DynamicBlogPost slug={slug} />;
  }

  return (
    <article>
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-20">
        <Link
          href="/blog"
          className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={14} /> সব ব্লগ
        </Link>

        <span className="font-label mt-6 inline-block w-fit rounded-full bg-teal-soft px-2.5 py-1 text-[11px] uppercase tracking-wide text-teal-deep">
          {post.category}
        </span>
        <h1 className="mt-4 font-display-bn text-3xl leading-snug text-ink sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 text-sm text-ink-soft/60">
          {post.date} · {post.readMinutes} মিনিট পড়ার সময় · Uttolon Academic Team
        </p>

        <div className="mt-9 space-y-5 border-t border-line pt-9">
          {post.body.map((para, i) => (
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
