"use client";

import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { Book } from "@/lib/books";
import type { Bundle } from "@/lib/bundles";
import { toEnglishDigits } from "@/lib/numberInput";
import UploadField from "@/components/UploadField";
import { AlertCircle, CheckCircle2, Loader2, Package, Pencil, Search, Trash2 } from "lucide-react";

const bn = (n: number) => n.toLocaleString("bn-BD");
const inputCls = "w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-ink";

export default function AdminBundlesManager() {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [bundles, setBundles] = useState<Bundle[] | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState("");
  const [price, setPrice] = useState("");
  const [order, setOrder] = useState("");
  const [active, setActive] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const [find, setFind] = useState("");

  async function load() {
    try {
      const db = getFirebaseDb();
      const [bSnap, sSnap] = await Promise.all([getDocs(collection(db, "books")), getDocs(collection(db, "bookBundles"))]);
      setBooks(bSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Book, "id">) })).sort((a, b) => a.title.localeCompare(b.title)));
      setBundles(
        sSnap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Bundle, "id">) }))
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title))
      );
    } catch {
      setBooks([]);
      setBundles([]);
      setMsg({ ok: false, text: "তালিকা আনা যায়নি — Firestore Rules (bookBundles-এর নিয়মসহ) Publish করা আছে কিনা দেখুন।" });
    }
  }

  useEffect(() => {
    load();
  }, []);

  function reset() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCover("");
    setPrice("");
    setOrder("");
    setActive(true);
    setPicked([]);
    setFind("");
  }

  function startEdit(b: Bundle) {
    setEditingId(b.id);
    setTitle(b.title);
    setDescription(b.description || "");
    setCover(b.coverImageUrl || "");
    setPrice(String(b.price ?? ""));
    setOrder(b.order != null ? String(b.order) : "");
    setActive(b.active !== false);
    setPicked(b.bookIds || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const byId = useMemo(() => new Map((books || []).map((b) => [b.id, b])), [books]);
  const separate = picked.reduce((s, id) => s + (byId.get(id)?.price || 0), 0);
  const priceNum = Number(toEnglishDigits(price)) || 0;
  const shown = useMemo(() => {
    const q = find.trim().toLowerCase();
    return (books || []).filter((b) => !q || `${b.title} ${b.level} ${b.subject}`.toLowerCase().includes(q));
  }, [books, find]);

  async function save() {
    setMsg(null);
    if (!title.trim()) return setMsg({ ok: false, text: "সেটের নাম দিন।" });
    if (picked.length < 2) return setMsg({ ok: false, text: "সেটে অন্তত ২টা বই বাছুন।" });
    if (priceNum <= 0) return setMsg({ ok: false, text: "সেটের দাম (টাকা) দিন।" });
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        coverImageUrl: cover,
        bookIds: picked,
        price: priceNum,
        order: order.trim() ? Number(toEnglishDigits(order)) || 0 : 999,
        active,
      };
      const db = getFirebaseDb();
      if (editingId) await updateDoc(doc(db, "bookBundles", editingId), payload);
      else await addDoc(collection(db, "bookBundles"), payload);
      reset();
      setMsg({ ok: true, text: editingId ? "সেট আপডেট হয়েছে।" : "নতুন সেট যোগ হয়েছে।" });
      await load();
    } catch {
      setMsg({ ok: false, text: "সেভ হয়নি — Firestore Rules Publish করা আছে কিনা ও ইন্টারনেট দেখুন।" });
    } finally {
      setSaving(false);
    }
  }

  async function remove(b: Bundle) {
    if (!window.confirm(`"${b.title}" সেটটা মুছে ফেলবেন? (বইগুলো থেকে যাবে, শুধু সেটটা যাবে)`)) return;
    try {
      await deleteDoc(doc(getFirebaseDb(), "bookBundles", b.id));
      await load();
    } catch {
      setMsg({ ok: false, text: "মোছা যায়নি।" });
    }
  }

  return (
    <div className="space-y-8">
      {msg && (
        <p className={`flex items-start gap-2 rounded-sm border px-3 py-2 text-sm ${msg.ok ? "border-teal/30 bg-teal-soft text-teal-deep" : "border-clay/30 bg-clay-soft text-clay"}`}>
          {msg.ok ? <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> : <AlertCircle size={15} className="mt-0.5 shrink-0" />}
          {msg.text}
        </p>
      )}

      <div className="rounded-sm border border-line bg-paper p-5">
        <h2 className="flex items-center gap-2 font-display-bn text-lg text-ink">
          <Package size={18} className="text-gold-deep" /> {editingId ? "সেট সম্পাদনা" : "নতুন বুক সেট / প্যাকেজ"}
        </h2>
        {books === null ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft"><Loader2 size={14} className="animate-spin" /> লোড হচ্ছে...</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="সেটের নাম (যেমন: University Admission Book Set)" className={`${inputCls} sm:col-span-2`} />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)" className={`${inputCls} sm:col-span-2`} />
            <input value={price} onChange={(e) => setPrice(toEnglishDigits(e.target.value))} inputMode="numeric" placeholder="সেটের দাম (টাকা)" className={inputCls} />
            <input value={order} onChange={(e) => setOrder(toEnglishDigits(e.target.value))} inputMode="numeric" placeholder="ক্রম (ছোট সংখ্যা আগে দেখায়)" className={inputCls} />
            <div className="sm:col-span-2">
              <UploadField label="সেটের কভার ছবি" value={cover} onChange={setCover} />
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-ink">সেটে কোন কোন বই থাকবে</p>
              <div className="mb-2 mt-1.5 flex items-center gap-2 rounded-sm border border-line bg-paper-raised px-3 py-2">
                <Search size={14} className="text-ink-soft/50" />
                <input value={find} onChange={(e) => setFind(e.target.value)} placeholder="বইয়ের নাম/বিষয় দিয়ে খুঁজুন" className="w-full bg-transparent text-sm text-ink outline-none" />
              </div>
              <div className="max-h-64 overflow-y-auto rounded-sm border border-line">
                {shown.length === 0 ? (
                  <p className="p-3 text-sm text-ink-soft/60">কোনো বই পাওয়া যায়নি — আগে "বই ব্যবস্থাপনা" থেকে বই যোগ করুন।</p>
                ) : (
                  shown.map((b) => (
                    <label key={b.id} className="flex cursor-pointer items-center gap-2.5 border-b border-line/60 px-3 py-2 text-sm last:border-b-0 hover:bg-paper-raised">
                      <input
                        type="checkbox"
                        checked={picked.includes(b.id)}
                        onChange={(e) => setPicked((p) => (e.target.checked ? [...p, b.id] : p.filter((x) => x !== b.id)))}
                      />
                      <span className="flex-1 text-ink">{b.title} <span className="text-xs text-ink-soft/60">· {b.level} · {b.subject}</span></span>
                      <span className="text-xs font-semibold text-ink-soft">{bn(b.price)} টাকা</span>
                    </label>
                  ))
                )}
              </div>
              <p className="mt-2 text-sm text-ink-soft">
                বাছা হয়েছে {bn(picked.length)}টা বই · আলাদা কিনলে মোট <strong className="text-ink">{bn(separate)} টাকা</strong>
                {priceNum > 0 && separate > 0 && (
                  <>
                    {" "}· সেটের দাম {bn(priceNum)} টাকা →{" "}
                    {separate >= priceNum ? (
                      <strong className="text-teal-deep">{bn(separate - priceNum)} টাকা সাশ্রয়</strong>
                    ) : (
                      <strong className="text-clay">আলাদা কেনার চেয়ে বেশি! দাম দেখে নিন</strong>
                    )}
                  </>
                )}
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> সাইটে দেখাবে
            </label>
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <button type="button" onClick={save} disabled={saving} className="flex items-center gap-2 rounded-sm bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" />} {editingId ? "পরিবর্তন সেভ করুন" : "সেট যোগ করুন"}
              </button>
              {editingId && (
                <button type="button" onClick={reset} disabled={saving} className="text-sm text-ink-soft underline">সম্পাদনা বাতিল</button>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display-bn text-lg text-ink">তৈরি করা সেট</h2>
        {bundles === null ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft"><Loader2 size={14} className="animate-spin" /> লোড হচ্ছে...</p>
        ) : bundles.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft/60">এখনো কোনো সেট বানানো হয়নি।</p>
        ) : (
          <ul className="mt-3 divide-y divide-line/60 rounded-sm border border-line bg-paper">
            {bundles.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-ink">
                    {b.title} {b.active === false && <span className="ml-1 rounded-full bg-clay-soft px-2 py-0.5 text-[10px] text-clay">লুকানো</span>}
                  </p>
                  <p className="text-xs text-ink-soft/70">{bn(b.bookIds?.length || 0)}টা বই · {bn(b.price)} টাকা</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(b)} className="flex items-center gap-1 rounded-sm border border-ink px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink hover:text-paper">
                    <Pencil size={12} /> সম্পাদনা
                  </button>
                  <button type="button" onClick={() => remove(b)} className="text-clay hover:text-clay/70" aria-label="মুছুন"><Trash2 size={15} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
