import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle2, Clock, Target, Users, Wallet } from "lucide-react";
import { getProgramsServer } from "@/lib/programsServer";
import { programSlug, type Program } from "@/lib/programs";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

async function findProgram(slug: string): Promise<{ program: Program | null; others: Program[] }> {
  const all = await getProgramsServer();
  const program = all.find((p) => programSlug(p) === slug) || null;
  return { program, others: all.filter((p) => p !== program).slice(0, 6) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { program } = await findProgram(slug);
  if (!program) return { title: "প্রোগ্রাম | Uttolon" };
  return {
    title: `${program.bn || program.title} | Uttolon`,
    description: program.longDesc || program.desc,
  };
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;
  const { program: p, others } = await findProgram(slug);
  if (!p) notFound();

  const outline = (p.outline || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const facts: { icon: typeof Clock; label: string; value: string }[] = [
    p.duration ? { icon: Clock, label: "সময়কাল", value: p.duration } : null,
    p.schedule ? { icon: CalendarDays, label: "ক্লাসের সময়সূচি", value: p.schedule } : null,
    p.seats ? { icon: Users, label: "আসন সংখ্যা", value: p.seats } : null,
    p.audience ? { icon: Target, label: "কাদের জন্য", value: p.audience } : null,
    p.showFee && p.fee > 0 ? { icon: Wallet, label: "ভর্তি ফি", value: `${p.fee.toLocaleString("bn-BD")} টাকা` } : null,
  ].filter((x): x is { icon: typeof Clock; label: string; value: string } => x !== null);

  const courseLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: p.bn || p.title,
    description: p.longDesc || p.desc,
    provider: { "@type": "EducationalOrganization", name: "Uttolon", url: SITE_URL },
  };

  return (
    <section className="bg-paper-raised">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseLd) }} />
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <Link href="/programs" className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft size={14} /> সব প্রোগ্রাম
        </Link>

        <p className="font-label mt-6 text-xs uppercase tracking-[0.2em] text-gold-deep">{p.title}</p>
        <h1 className="mt-2 font-display-bn text-3xl text-ink sm:text-5xl">{p.bn || p.title}</h1>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-soft">{p.longDesc || p.desc}</p>

        {facts.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {facts.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-start gap-3 rounded-sm border border-line bg-paper p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="text-xs text-ink-soft/70">{f.label}</p>
                    <p className="mt-0.5 text-[15px] font-semibold text-ink">{f.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {outline.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display-bn text-xl text-ink">যা যা থাকছে</h2>
            <ul className="mt-4 space-y-2.5">
              {outline.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[15px] text-ink">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-teal" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href={`/admission?program=${encodeURIComponent(p.title)}`}
            className="admission-cta group flex items-center gap-2 rounded-sm bg-ink px-7 py-3.5 text-sm font-medium text-paper hover:bg-gold-deep"
          >
            এই প্রোগ্রামে ভর্তি হোন
            <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <Link href="/contact" className="rounded-sm border border-ink/25 px-6 py-3.5 text-sm font-medium text-ink hover:border-ink hover:bg-paper">
            প্রশ্ন আছে? যোগাযোগ করুন
          </Link>
        </div>

        {others.length > 0 && (
          <div className="mt-14 border-t border-line pt-8">
            <h2 className="font-display-bn text-lg text-ink">আরও প্রোগ্রাম</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {others.map((o) => (
                <Link
                  key={o.id}
                  href={`/programs/${programSlug(o)}`}
                  className="rounded-full border border-line bg-paper px-4 py-1.5 text-sm text-ink hover:border-ink"
                >
                  {o.bn || o.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
