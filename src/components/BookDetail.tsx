"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { ArrowLeft, BookOpen, MessageCircle } from "lucide-react";
import { type Book, whatsappOrderLink } from "@/lib/books";

export default function BookDetail({ id }: { id: string }) {
  const [book, setBook] = useState<Book | null | undefined>(undefined);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(getFirebaseDb(), "books", id));
        setBook(snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Book, "id">) }) : null);
      } catch {
        setBook(null);
      }
    }
    load();
  }, [id]);

  if (book === undefined) {
    return <p className="text-sm text-ink-soft">লোড হচ্ছে...</p>;
  }

  if (book === null) {
    return (
      <div>
        <p className="text-sm text-clay">এই বইটি পাওয়া যায়নি।</p>
        <Link href="/books" className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
          <ArrowLeft size={14} /> বই সংগ্রহে ফিরুন
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/books" className="flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={14} /> বই সংগ্রহে ফিরুন
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-[240px_1fr]">
        <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-sm border border-line bg-paper">
          {book.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.coverImageUrl} alt={book.title} className="h-full w-full object-cover" />
          ) : (
            <BookOpen size={48} className="text-ink-soft/30" strokeWidth={1.2} />
          )}
        </div>

        <div>
          <h1 className="font-display-bn text-2xl text-ink sm:text-3xl">{book.title}</h1>
          {book.author && <p className="mt-1.5 text-sm text-ink-soft">লেখক/প্রকাশনা: {book.author}</p>}
          <p className="mt-2 text-sm text-ink-soft">{book.level} · {book.subject}</p>
          <p className="mt-4 font-display-en text-2xl font-semibold text-gold-deep">
            ৳{book.price.toLocaleString("bn-BD")}
          </p>

          {book.description && (
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">{book.description}</p>
          )}

          {book.inStock ? (
            <a
              href={whatsappOrderLink(book)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-sm bg-teal-deep px-6 py-3 text-sm font-medium text-paper hover:opacity-90"
            >
              <MessageCircle size={16} /> WhatsApp-এ অর্ডার করুন
            </a>
          ) : (
            <p className="mt-7 inline-block rounded-sm bg-clay-soft px-4 py-2 text-sm text-clay">
              এই মুহূর্তে স্টকে নেই
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
