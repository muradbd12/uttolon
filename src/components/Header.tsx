"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowUpRight, User2 } from "lucide-react";

const navLinks = [
  { label: "হোম", href: "/" },
  { label: "উত্তোলন সম্পর্কে", href: "/about" },
  { label: "লার্নিং সিস্টেম", href: "/#uls" },
  { label: "প্রোগ্রাম", href: "/programs" },
  { label: "শিক্ষক", href: "/teachers" },
  { label: "ব্লগ", href: "/blog" },
  { label: "যোগাযোগ", href: "/contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
        {/* Logo mark */}
        <Link href="/" className="flex items-center gap-3 group">
  <div className="w-10 h-10 relative flex items-center justify-center">
    <img 
      src="/logo.png" 
      alt="উত্তোলন লোগো" 
      className="w-full h-full object-contain"
    />
  </div>
  <div className="flex flex-col">
    <span className="text-xl font-bold text-slate-900 leading-tight">উত্তোলন</span>
    <span className="text-[10px] text-slate-500 font-medium tracking-wider">UTTOLON LEARNING SYSTEM</span>
  </div>
</Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/student/login"
            className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            <User2 size={13} />
            স্টুডেন্ট লগইন
          </Link>
          <Link
            href="/guardian/login"
            className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            <User2 size={13} />
            গার্ডিয়ান লগইন
          </Link>
          <Link
            href="/admission"
            className="group ml-1 flex items-center gap-1.5 rounded-sm bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-gold-deep"
          >
            ভর্তি হোন
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex items-center justify-center p-2 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-paper px-5 py-4 lg:hidden">
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
              className="flex items-center justify-center gap-1.5 rounded-sm bg-ink px-4 py-3 text-sm font-medium text-paper"
            >
              ভর্তি হোন <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
