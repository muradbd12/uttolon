"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Wallet,
  PieChart,
  UserPlus,
  GraduationCap,
  CalendarClock,
  FlaskConical,
  Megaphone,
  Newspaper,
  FolderOpen,
  Award,
  Star,
  MessageSquare,
  KeyRound,
  Settings,
  Menu,
  X,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ size?: number }> };
type NavGroup = { label: string | null; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: null,
    items: [{ href: "/admin/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard }],
  },
  {
    label: "ভর্তি ও ফি",
    items: [
      { href: "/admin/admissions", label: "ভর্তি আবেদন", icon: ClipboardList },
      { href: "/admin/fees", label: "ফি ব্যবস্থাপনা", icon: Wallet },
      { href: "/admin/fees/overview", label: "সবার বকেয়া", icon: PieChart },
    ],
  },
  {
    label: "মানুষ",
    items: [
      { href: "/admin/users", label: "ইউজার তৈরি", icon: UserPlus },
      { href: "/admin/teacher-profiles", label: "শিক্ষক প্রোফাইল", icon: GraduationCap },
    ],
  },
  {
    label: "একাডেমিক",
    items: [
      { href: "/admin/schedule", label: "ক্লাস শিডিউল", icon: CalendarClock },
      { href: "/admin/practical-learning", label: "Practical Learning", icon: FlaskConical },
    ],
  },
  {
    label: "কন্টেন্ট",
    items: [
      { href: "/admin/notices", label: "নোটিশ", icon: Megaphone },
      { href: "/admin/blog", label: "ব্লগ", icon: Newspaper },
      { href: "/admin/resources", label: "রিসোর্স", icon: FolderOpen },
      { href: "/admin/scholarships", label: "স্কলারশিপ", icon: Award },
      { href: "/admin/success-stories", label: "সাফল্যের গল্প", icon: Star },
    ],
  },
  {
    label: "অন্যান্য",
    items: [
      { href: "/admin/messages", label: "বার্তা", icon: MessageSquare },
      { href: "/admin/reset-password", label: "পাসওয়ার্ড রিসেট", icon: KeyRound },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin/fees") return pathname === "/admin/fees";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex h-full flex-col gap-5 overflow-y-auto px-3 py-5">
      <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-2" onClick={onNavigate}>
        <img src="/uttolon-logo.png" alt="উত্তোলন" className="h-8 w-8 object-contain" />
        <span className="font-display-bn text-lg text-paper">উত্তোলন Admin</span>
      </Link>

      {navGroups.map((group, i) => (
        <div key={i}>
          {group.label && (
            <p className="px-2.5 text-[11px] font-medium uppercase tracking-wide text-paper/40">
              {group.label}
            </p>
          )}
          <div className="mt-1.5 space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm transition-colors ${
                    active
                      ? "bg-gold-deep/90 text-paper"
                      : "text-paper/70 hover:bg-paper/10 hover:text-paper"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-paper/10 bg-ink px-4 py-3 md:hidden">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <img src="/uttolon-logo.png" alt="উত্তোলন" className="h-6 w-6 object-contain" />
          <span className="font-display-bn text-base text-paper">উত্তোলন Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="মেনু খুলুন"
          className="rounded-sm p-1.5 text-paper hover:bg-paper/10"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile overlay drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-ink shadow-xl">
            <div className="flex justify-end px-3 pt-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="মেনু বন্ধ করুন"
                className="rounded-sm p-1.5 text-paper hover:bg-paper/10"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-ink md:block">
        <SidebarContent pathname={pathname} />
      </aside>
    </>
  );
}
