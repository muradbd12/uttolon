import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Users,
  GraduationCap,
  FileCheck2,
  Layers,
  ClipboardList,
  Wallet,
  Award,
  Bell,
  FileText,
  Trophy,
  FolderOpen,
  LayoutDashboard,
  ArrowUpRight,
  Mail,
  BarChart3,
  FlaskConical,
} from "lucide-react";
import { demoManagementAreas } from "@/content/admin-demo";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import AdminStats from "@/components/dashboard/AdminStats";
import AdminPendingActions from "@/components/dashboard/AdminPendingActions";

export const metadata: Metadata = {
  title: "অ্যাডমিন ড্যাশবোর্ড | Uttolon",
  robots: { index: false, follow: false },
};

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "শিক্ষার্থী": Users,
  "শিক্ষক": GraduationCap,
  "ভর্তি আবেদন": FileCheck2,
  "প্রোগ্রাম ও ব্যাচ": Layers,
  "অ্যাসেসমেন্ট ও Recovery": ClipboardList,
  "ফি ব্যবস্থাপনা": Wallet,
  "বৃত্তি আবেদন": Award,
  "নোটিশ": Bell,
  "ব্লগ": FileText,
  "ফলাফল ও Success Story": Trophy,
  "রিসোর্স লাইব্রেরি": FolderOpen,
  "যোগাযোগ বার্তা": Mail,
  "Practical Learning": FlaskConical,
  "ওয়েবসাইট কনটেন্ট": LayoutDashboard,
};

// এই কয়টা বিভাগ এখন সত্যিকারের পেজে যুক্ত — বাকিগুলো এখনো "শীঘ্রই"
const liveLinks: Record<string, string> = {
  "ভর্তি আবেদন": "/admin/admissions",
  "নোটিশ": "/admin/notices",
  "শিক্ষার্থী": "/admin/users",
  "শিক্ষক": "/admin/users",
  "ফি ব্যবস্থাপনা": "/admin/fees",
  "প্রোগ্রাম ও ব্যাচ": "/admin/schedule",
  "ফলাফল ও Success Story": "/admin/success-stories",
  "বৃত্তি আবেদন": "/admin/scholarships",
  "ব্লগ": "/admin/blog",
  "রিসোর্স লাইব্রেরি": "/admin/resources",
  "যোগাযোগ বার্তা": "/admin/messages",
  "Practical Learning": "/admin/practical-learning",
};

// কোনো কোনো কার্ডে দ্বিতীয় একটা কাজও আছে (যেমন শিক্ষকের লগইন
// অ্যাকাউন্ট বনাম পাবলিক প্রোফাইল) — এখানে সেই বাড়তি লিংক রাখা হলো
const secondaryLinks: Record<string, { label: string; href: string }> = {
  "শিক্ষক": { label: "পাবলিক প্রোফাইল", href: "/admin/teacher-profiles" },
};

export default function AdminDashboardPage() {
  return (
    <RequireRoleAuth role="admin" loginPath="/admin/login">
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        {/* Preview notice */}
        <div className="flex items-start gap-3 rounded-sm border border-gold/30 bg-gold-soft/40 p-4">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-gold-deep" />
          <p className="text-sm leading-relaxed text-ink">
            লগইন <span className="font-medium">Firebase Authentication</span> দিয়ে সুরক্ষিত, আর
            নিচের সংখ্যাগুলো এখন সত্যিকারের ডেটাবেস থেকে হিসাব করা।
          </p>
        </div>

        {/* Header */}
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">
              Admin Dashboard
            </p>
            <h1 className="mt-2 font-display-bn text-2xl text-ink sm:text-3xl">
              নিয়ন্ত্রণ কেন্দ্র
            </h1>
          </div>
          {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-sm border border-line px-3 py-2 text-sm text-ink hover:border-ink"
            >
              <BarChart3 size={15} className="text-gold-deep" />
              ওয়েবসাইট ট্রাফিক দেখুন
            </a>
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-ink-soft/60">
              <BarChart3 size={14} />
              ট্রাফিক অ্যানালিটিক্স চালু করতে Google Analytics সেটআপ করুন
            </p>
          )}
        </div>

        {/* Stats row — real */}
        <AdminStats />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Management areas */}
          <div className="lg:col-span-2">
            <h2 className="font-display-bn text-lg text-ink">পরিচালনার বিভাগ</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {demoManagementAreas.map((area) => {
                const Icon = iconMap[area.title] ?? LayoutDashboard;
                const href = liveLinks[area.title];
                const secondary = secondaryLinks[area.title];
                return (
                  <div
                    key={area.title}
                    className="flex flex-col rounded-sm border border-line bg-paper p-5"
                  >
                    <Icon size={18} className="text-gold-deep" />
                    <h3 className="mt-3 font-display-bn text-base text-ink">{area.title}</h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">
                      {area.desc}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {href ? (
                      <Link
                        href={href}
                        className="flex w-fit items-center gap-1.5 text-xs font-medium text-ink hover:text-gold-deep"
                      >
                        পরিচালনা করুন <ArrowUpRight size={12} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex w-fit cursor-not-allowed items-center gap-1.5 text-xs text-ink-soft/50"
                      >
                        পরিচালনা করুন (শীঘ্রই) <ArrowUpRight size={12} />
                      </button>
                    )}
                    {secondary && (
                      <Link
                        href={secondary.href}
                        className="flex w-fit items-center gap-1.5 text-xs font-medium text-teal-deep hover:text-teal"
                      >
                        {secondary.label} <ArrowUpRight size={12} />
                      </Link>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending actions */}
          <div>
            <h2 className="font-display-bn text-lg text-ink">পেন্ডিং অ্যাকশন</h2>
            <div className="mt-4 rounded-sm border border-line bg-paper p-5">
              <AdminPendingActions />
            </div>
          </div>
        </div>
      </div>
    </section>
    </RequireRoleAuth>
  );
}
