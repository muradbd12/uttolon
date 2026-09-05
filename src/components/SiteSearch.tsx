"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, Bell, BookOpen, FolderOpen, User2, FileText } from "lucide-react";
import { useSiteSearch } from "@/lib/useSiteSearch";

const iconByType = {
  notice: Bell,
  blog: BookOpen,
  resource: FolderOpen,
  teacher: User2,
};

export default function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { ready, search } = useSiteSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  function handleClose() {
    setOpen(false);
    setQ("");
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = search(q);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="সাইট খুঁজুন"
        className="flex items-center gap-1.5 rounded-sm px-2.5 py-2 text-ink-soft transition-colors hover:text-ink"
      >
        <Search size={17} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-ink/50 px-4 pt-20 backdrop-blur-sm sm:pt-28">
          <button
            type="button"
            aria-label="বন্ধ করুন"
            onClick={handleClose}
            className="fixed inset-0 cursor-default"
          />
          <div className="relative z-10 w-full max-w-lg rounded-sm border border-line bg-paper shadow-2xl">
            <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
              <Search size={18} className="shrink-0 text-ink-soft/60" />
              <input
                ref={inputRef}
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="নোটিশ, ব্লগ, রিসোর্স, শিক্ষক খুঁজুন..."
                className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-soft/50"
              />
              <button
                type="button"
                onClick={handleClose}
                aria-label="বন্ধ করুন"
                className="shrink-0 text-ink-soft/60 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!ready ? (
                <p className="px-3 py-6 text-center text-sm text-ink-soft/50">লোড হচ্ছে...</p>
              ) : q.trim() === "" ? (
                <p className="px-3 py-6 text-center text-sm text-ink-soft/50">
                  খোঁজা শুরু করতে টাইপ করুন
                </p>
              ) : results.length === 0 ? (
                <p className="flex flex-col items-center gap-2 px-3 py-8 text-center text-sm text-ink-soft/50">
                  <FileText size={20} className="text-ink-soft/30" />
                  &quot;{q}&quot;-এর জন্য কিছু পাওয়া যায়নি
                </p>
              ) : (
                <ul>
                  {results.slice(0, 20).map((item, i) => {
                    const Icon = iconByType[item.type];
                    return (
                      <li key={`${item.href}-${i}`}>
                        <Link
                          href={item.href}
                          onClick={handleClose}
                          className="flex items-center gap-3 rounded-sm px-3 py-2.5 hover:bg-paper-raised"
                        >
                          <Icon size={16} className="shrink-0 text-gold-deep" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] text-ink">{item.title}</span>
                            <span className="block truncate text-xs text-ink-soft/60">
                              {item.typeLabel} {item.subtitle ? `· ${item.subtitle}` : ""}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
