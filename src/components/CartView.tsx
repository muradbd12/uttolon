"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { clearCart, setQty, useCart } from "@/lib/cart";
import { withTimeout } from "@/lib/withTimeout";
import { whatsappCartLink } from "@/lib/books";
import { AlertCircle, BookOpen, CheckCircle2, Loader2, Minus, Plus, ShoppingCart, Trash2, MessageCircle, ArrowLeft } from "lucide-react";

type Info = { title: string; price: number; image?: string; available: boolean; items?: string[] };
type Placed = {
  orderNo: string;
  total: number;
  lines: { type: "book" | "bundle"; title: string; price: number; qty: number; items?: string[] }[];
  name: string;
  mobile: string;
  address: string;
  note: string;
};

const bn = (n: number) => n.toLocaleString("bn-BD");
const CUSTOMER_KEY = "uttolon-cart-customer";
const inputCls = "w-full rounded-sm border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-ink";

export default function CartView() {
  const lines = useCart();
  const [info, setInfo] = useState<Record<string, Info>>({});
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Placed | null>(null);

  // remember the customer's details for next time (this browser only)
  useEffect(() => {
    try {
      const c = JSON.parse(window.localStorage.getItem(CUSTOMER_KEY) || "{}");
      setName(c.name || "");
      setMobile(c.mobile || "");
      setAddress(c.address || "");
    } catch {
      // ignore
    }
  }, []);

  // current titles and prices come from the database, never from what was saved in the cart
  const key = lines.map((l) => `${l.type}:${l.id}`).join("|");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const db = getFirebaseDb();
      const entries = await Promise.all(
        lines.map(async (l) => {
          try {
            if (l.type === "book") {
              const s = await getDoc(doc(db, "books", l.id));
              const d = s.data();
              return [`book:${l.id}`, s.exists() && d ? { title: String(d.title || ""), price: Number(d.price) || 0, image: d.coverImageUrl as string | undefined, available: d.inStock !== false } : { title: "(বইটি আর নেই)", price: 0, available: false }] as const;
            }
            const s = await getDoc(doc(db, "bookBundles", l.id));
            const d = s.data();
            if (!s.exists() || !d || d.active === false) return [`bundle:${l.id}`, { title: "(সেটটি আর নেই)", price: 0, available: false }] as const;
            const ids: string[] = Array.isArray(d.bookIds) ? d.bookIds : [];
            const titles = (await Promise.all(ids.map((id) => getDoc(doc(db, "books", id))))).map((b) => (b.exists() ? String(b.data()?.title || "") : "")).filter(Boolean);
            return [`bundle:${l.id}`, { title: String(d.title || ""), price: Number(d.price) || 0, image: d.coverImageUrl as string | undefined, available: true, items: titles }] as const;
          } catch {
            return [`${l.type}:${l.id}`, { title: "লোড করা যায়নি", price: 0, available: false }] as const;
          }
        })
      );
      if (!cancelled) {
        setInfo(Object.fromEntries(entries));
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const rows = lines.map((l) => ({ line: l, i: info[`${l.type}:${l.id}`] }));
  const total = rows.reduce((s, r) => s + (r.i?.available ? r.i.price * r.line.qty : 0), 0);
  const hasUnavailable = rows.some((r) => r.i && !r.i.available);

  async function place(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (hasUnavailable) return setError("কার্টে এমন আইটেম আছে যা এখন পাওয়া যাচ্ছে না — সেগুলো সরিয়ে আবার চেষ্টা করুন।");
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const res = await withTimeout(
        fetch("/api/public/book-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            mobile,
            address,
            note,
            website: form.get("website") || "",
            items: lines.map((l) => ({ type: l.type, id: l.id, qty: l.qty })),
          }),
        })
      );
      const data = await res.json();
      if (res.status === 409) throw new Error(`"${data.title || "একটা আইটেম"}" এখন পাওয়া যাচ্ছে না — কার্ট থেকে সরিয়ে আবার চেষ্টা করুন।`);
      if (res.status === 400) throw new Error("নাম, মোবাইল নম্বর (কমপক্ষে ১০ সংখ্যা) ও ঠিকানা সঠিকভাবে দিন।");
      if (!res.ok) throw new Error("অর্ডার জমা হয়নি — ইন্টারনেট দেখে একটু পরে আবার চেষ্টা করুন।");
      try {
        window.localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name, mobile, address }));
      } catch {
        // ignore
      }
      setPlaced({ orderNo: data.orderNo, total: data.total, lines: data.lines, name, mobile, address, note });
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "অর্ডার জমা হয়নি — আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }

  if (placed) {
    return (
      <div className="rounded-sm border-2 border-teal bg-teal-soft/50 p-6">
        <p className="flex items-center gap-2 text-xl font-bold text-teal-deep">
          <CheckCircle2 size={22} /> অর্ডার জমা হয়েছে
        </p>
        <p className="mt-3 text-[15px] text-ink">
          অর্ডার নং <strong>{placed.orderNo}</strong> · মোট <strong>{bn(placed.total)} টাকা</strong>
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          আপনার অর্ডার আমাদের কাছে পৌঁছে গেছে। দ্রুত নিশ্চিত করতে নিচের বাটনে WhatsApp-এ অর্ডারের বার্তাটা পাঠিয়ে দিন — আমরা ফোন বা
          WhatsApp-এ যোগাযোগ করে ডেলিভারির বিষয়ে জানাব।
        </p>
        <a
          href={whatsappCartLink(placed)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-sm bg-teal-deep px-6 py-3 text-sm font-medium text-paper hover:opacity-90"
        >
          <MessageCircle size={16} /> WhatsApp-এ অর্ডার পাঠান
        </a>
        <div className="mt-5">
          <Link href="/books" className="text-sm text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
            আরও বই দেখুন
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="py-12 text-center">
        <ShoppingCart size={34} className="mx-auto text-ink-soft/30" strokeWidth={1.3} />
        <p className="mt-3 text-sm text-ink-soft">আপনার কার্ট এখন খালি।</p>
        <Link href="/books" className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
          <ArrowLeft size={14} /> বই সংগ্রহে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="font-display-bn text-lg text-ink">আপনার কার্ট</h2>
        {!loaded && <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft"><Loader2 size={14} className="animate-spin" /> দাম মিলিয়ে দেখা হচ্ছে...</p>}
        <ul className="mt-3 divide-y divide-line/60 rounded-sm border border-line bg-paper">
          {rows.map(({ line, i }) => (
            <li key={`${line.type}:${line.id}`} className="flex gap-3 p-3">
              <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-paper-raised">
                {i?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image} alt={i.title} className="h-full w-full object-cover" />
                ) : (
                  <BookOpen size={20} className="text-ink-soft/30" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">
                  {line.type === "bundle" && <span className="mr-1 rounded-full bg-gold-soft px-1.5 py-0.5 text-[10px] font-semibold text-gold-deep">সেট</span>}
                  {i?.title || "লোড হচ্ছে..."}
                </p>
                {i?.items && i.items.length > 0 && <p className="mt-0.5 text-[11px] leading-snug text-ink-soft/70">সেটে আছে: {i.items.join(", ")}</p>}
                {i && !i.available && <p className="mt-1 text-xs font-semibold text-clay">এখন পাওয়া যাচ্ছে না — সরিয়ে দিন</p>}
                {i?.available && <p className="mt-1 text-xs text-ink-soft">{bn(i.price)} টাকা প্রতিটা</p>}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setQty(line.type, line.id, line.qty - 1)} className="rounded-sm border border-line p-1 text-ink hover:border-ink" aria-label="কমান"><Minus size={13} /></button>
                    <span className="w-8 text-center text-sm font-semibold text-ink">{bn(line.qty)}</span>
                    <button type="button" onClick={() => setQty(line.type, line.id, line.qty + 1)} className="rounded-sm border border-line p-1 text-ink hover:border-ink" aria-label="বাড়ান"><Plus size={13} /></button>
                    <button type="button" onClick={() => setQty(line.type, line.id, 0)} className="ml-2 text-clay hover:text-clay/70" aria-label="সরান"><Trash2 size={15} /></button>
                  </div>
                  {i?.available && <p className="text-sm font-bold text-ink">{bn(i.price * line.qty)} টাকা</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-center justify-between rounded-sm bg-gold-soft/40 px-4 py-3 text-[15px] font-bold text-ink">
          <span>মোট</span>
          <span>{bn(total)} টাকা</span>
        </p>
        <p className="mt-2 text-xs text-ink-soft/70">ডেলিভারি/পিকআপের বিষয়ে অর্ডার নিশ্চিত করার সময় আমরা জানিয়ে দেব। টাকা পরিশোধের নিয়ম নিশ্চিত করার সময়ই ঠিক হবে — এখানে কোনো অনলাইন পেমেন্ট নেই।</p>
      </div>

      <form onSubmit={place} className="h-fit space-y-3 rounded-sm border border-line bg-paper p-5">
        <h2 className="font-display-bn text-lg text-ink">অর্ডারের তথ্য</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="আপনার নাম" className={inputCls} />
        <input value={mobile} onChange={(e) => setMobile(e.target.value)} required type="tel" placeholder="মোবাইল নম্বর" className={inputCls} />
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={3} placeholder="ঠিকানা (যেখানে বই পৌঁছাবে)" className={inputCls} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="মন্তব্য (ঐচ্ছিক)" className={inputCls} />
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        {error && (
          <p className="flex items-start gap-1.5 text-sm text-clay">
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
          </p>
        )}
        <button type="submit" disabled={busy || !loaded} className="flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60">
          {busy && <Loader2 size={15} className="animate-spin" />} অর্ডার নিশ্চিত করুন
        </button>
        <p className="text-[11px] text-ink-soft/60">অর্ডার জমা হলে অর্ডার নং দেখাবে, আর সেটা WhatsApp-এ পাঠানোর বাটন আসবে।</p>
      </form>
    </div>
  );
}
