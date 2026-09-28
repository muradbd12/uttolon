"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Search, BookOpen } from "lucide-react";
import { type Book, ALL_LEVELS, SUBJECTS } from "@/lib/books";

export default function BooksBrowser() {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [error, setError] = useState(false);
  const [level, setLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(getFirebaseDb(), "books"));
        setBooks(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Book, "id">) }))
        );
      } catch {
        setError(true);
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

  const filtered = books.filter((b) => {
    if (level && b.level !== level) return false;
    if (subject && b.subject !== subject) return false;
    if (search.trim() && !b.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <div>
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
            <Link
              key={b.id}
              href={`/books/${b.id}`}
              className="group rounded-sm border border-line bg-paper p-3 transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-sm"
            >
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
              <p className="mt-1.5 text-sm font-semibold text-gold-deep">৳{b.price.toLocaleString("bn-BD")}</p>
              {!b.inStock && (
                <span className="mt-1 inline-block rounded-full bg-clay-soft px-2 py-0.5 text-[10px] text-clay">
                  স্টকে নেই
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
