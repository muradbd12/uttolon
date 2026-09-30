"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowUpRight, User2, Wallet, ChevronDown } from "lucide-react";
import SiteSearch from "@/components/SiteSearch";

const navLinks = [
  { label: "হোম", href: "/" },
  { label: "উত্তোলন সম্পর্কে", href: "/about" },
  { label: "লার্নিং সিস্টেম", href: "/#uls" },
  { label: "প্রোগ্রাম", href: "/programs" },
  { label: "বই সংগ্রহ", href: "/books" },
  { label: "গ্যালারি", href: "/gallery" },
  { label: "শিক্ষক", href: "/teachers" },
  { label: "ব্লগ", href: "/blog" },
  { label: "যোগাযোগ", href: "/contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
        {/* Logo mark */}
        <Link href="/" className="flex shrink-0 items-center gap-3" onClick={() => setOpen(false)}>
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
            <img src="/uttolon-logo.png" alt="উত্তোলন" className="h-full w-full object-contain" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display-bn text-xl text-ink">উত্তোলন</span>
            <span className="font-label text-[10px] uppercase tracking-[0.18em] text-ink-soft">
              Uttolon Learning System
            </span>
          </span>
        </Link>

        {/* Desktop nav — xl+ only, so it never has to squeeze into a cramped 1024–1280px range */}
        <nav className="hidden items-center gap-4 xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1 xl:flex">
          <SiteSearch />
          <Link
            href="/payment"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-sm px-2.5 py-2 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            <Wallet size={13} />
            পেমেন্ট
          </Link>

          {/* Student/Guardian login merged into one dropdown to save header space */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLoginOpen((v) => !v)}
              onBlur={() => setTimeout(() => setLoginOpen(false), 150)}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-sm px-2.5 py-2 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              <User2 size={13} />
              লগইন
              <ChevronDown size={12} className={`transition-transform ${loginOpen ? "rotate-180" : ""}`} />
            </button>
            {loginOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-sm border border-line bg-paper py-1 shadow-md">
                <Link href="/student/login" className="block px-3.5 py-2 text-sm text-ink hover:bg-paper-raised">
                  স্টুডেন্ট লগইন
                </Link>
                <Link href="/guardian/login" className="block px-3.5 py-2 text-sm text-ink hover:bg-paper-raised">
                  গার্ডিয়ান লগইন
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/admission"
            className="admission-cta group ml-1 flex items-center gap-1.5 whitespace-nowrap rounded-sm bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-gold-deep"
          >
            ভর্তি হোন
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Mobile/tablet toggle — covers everything below xl now */}
        <div className="flex items-center gap-1 xl:hidden">
          <SiteSearch />
          <button
            type="button"
            className="flex items-center justify-center p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile/tablet menu */}
      {open && (
        <div className="border-t border-line bg-paper px-5 py-4 xl:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-sm px-2 py-2.5 text-[15px] text-ink hover:bg-paper-raised"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
            <Link
              href="/payment"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 rounded-sm px-2 py-2 text-sm text-ink-soft hover:text-ink"
            >
              <Wallet size={13} /> পেমেন্ট করুন
            </Link>
            <Link
              href="/student/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 rounded-sm px-2 py-2 text-sm text-ink-soft hover:text-ink"
            >
              <User2 size={13} /> স্টুডেন্ট লগইন
            </Link>
            <Link
              href="/guardian/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 rounded-sm px-2 py-2 text-sm text-ink-soft hover:text-ink"
            >
              <User2 size={13} /> গার্ডিয়ান লগইন
            </Link>
            <Link
              href="/admission"
              onClick={() => setOpen(false)}
              className="admission-cta flex items-center justify-center gap-1.5 rounded-sm bg-ink px-4 py-3 text-sm font-medium text-paper"
            >
              ভর্তি হোন <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
