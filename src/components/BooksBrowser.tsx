"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Search, BookOpen, Package } from "lucide-react";
import { type Book, ALL_LEVELS, SUBJECTS } from "@/lib/books";
import type { Bundle } from "@/lib/bundles";
import AddToCartButton from "@/components/AddToCartButton";
import CartFloatingButton from "@/components/CartFloatingButton";

const bn = (n: number) => n.toLocaleString("bn-BD");

export default function BooksBrowser() {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [error, setError] = useState(false);
  const [level, setLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const db = getFirebaseDb();
      try {
        const snap = await getDocs(collection(db, "books"));
        setBooks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Book, "id">) })));
      } catch {
        setError(true);
        return;
      }
      // book sets are optional — if they can't be read the shop still works
      try {
        const snap = await getDocs(collection(db, "bookBundles"));
        setBundles(
          snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<Bundle, "id">) }))
            .filter((b) => b.active !== false && !!b.title)
            .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title))
        );
      } catch {
        setBundles([]);
      }
    }
    load();
  }, []);

  if (error) {
    return <p className="text-sm text-clay">বইয়ের তালিকা আনা যায়নি — একটু পরে আবার চেষ্টা করুন।</p>;
  }

  if (!books) {
    return <p className="text-sm text-ink-soft">লোড হচ্ছে...</p>;
  }

  const byId = new Map(books.map((b) => [b.id, b]));
  const filtered = books.filter((b) => {
    if (level && b.level !== level) return false;
    if (subject && b.subject !== subject) return false;
    if (search.trim() && !b.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <CartFloatingButton />

      {bundles.length > 0 && (
        <div className="mb-10">
          <h2 className="flex items-center gap-2 font-display-bn text-xl text-ink">
            <Package size={19} className="text-gold-deep" /> বুক সেট / প্যাকেজ
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {bundles.map((s) => {
              const titles = s.bookIds.map((id) => byId.get(id)?.title).filter((t): t is string => !!t);
              const separate = s.bookIds.reduce((sum, id) => sum + (byId.get(id)?.price || 0), 0);
              return (
                <div key={s.id} className="flex gap-4 rounded-sm border-2 border-gold/40 bg-paper p-4">
                  <div className="flex h-32 w-24 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-paper-raised">
                    {s.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.coverImageUrl} alt={s.title} className="h-full w-full object-cover" />
                    ) : (
                      <Package size={30} className="text-ink-soft/30" strokeWidth={1.3} />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="font-display-bn text-lg leading-snug text-ink">{s.title}</h3>
                    {s.description && <p className="mt-1 text-xs leading-relaxed text-ink-soft">{s.description}</p>}
                    {titles.length > 0 && (
                      <p className="mt-1.5 text-[11px] leading-snug text-ink-soft/70">
                        সেটে আছে ({bn(titles.length)}টা বই): {titles.join(", ")}
                      </p>
                    )}
                    <div className="mt-auto pt-3">
                      <p className="text-lg font-bold text-gold-deep">
                        {bn(s.price)} টাকা
                        {separate > s.price && (
                          <span className="ml-2 text-xs font-normal text-ink-soft/60 line-through">{bn(separate)} টাকা</span>
                        )}
                      </p>
                      {separate > s.price && (
                        <p className="text-[11px] font-semibold text-teal-deep">সেটে কিনলে {bn(separate - s.price)} টাকা সাশ্রয়</p>
                      )}
                      <div className="mt-2 max-w-[220px]">
                        <AddToCartButton type="bundle" id={s.id} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-sm border border-line bg-paper px-3 py-2 sm:col-span-3 lg:col-span-1">
          <Search size={15} className="text-ink-soft/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="বইয়ের নাম দিয়ে খুঁজুন"
            className="w-full bg-transparent text-sm text-ink outline-none"
          />
        </div>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        >
          <option value="">সব শ্রেণি/স্তর</option>
          {ALL_LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        >
          <option value="">সব বিষয়</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink-soft/60">কোনো বই পাওয়া যায়নি।</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="group flex flex-col rounded-sm border border-line bg-paper p-3 transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-sm"
            >
              <Link href={`/books/${b.id}`} className="block">
                <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-sm bg-paper-raised">
                  {b.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.coverImageUrl} alt={b.title} className="h-full w-full object-cover" />
                  ) : (
                    <BookOpen size={28} className="text-ink-soft/30" strokeWidth={1.3} />
                  )}
                </div>
                <h3 className="mt-2.5 line-clamp-2 text-sm font-medium text-ink">{b.title}</h3>
                <p className="mt-1 text-xs text-ink-soft/60">{b.level} · {b.subject}</p>
                <p className="mt-1.5 text-sm font-semibold text-gold-deep">{bn(b.price)} টাকা</p>
              </Link>
              <div className="mt-2.5">
                {b.inStock ? (
                  <AddToCartButton type="book" id={b.id} />
                ) : (
                  <span className="inline-block rounded-full bg-clay-soft px-2 py-0.5 text-[10px] text-clay">স্টকে নেই</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
