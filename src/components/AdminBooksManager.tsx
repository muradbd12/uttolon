"use client";

import { useEffect, useState } from "react";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Plus, Trash2, Pencil, X, Loader2, BookOpen } from "lucide-react";
import { type Book, ALL_LEVELS, SUBJECTS } from "@/lib/books";
import { toEnglishDigits } from "@/lib/numberInput";

const emptyForm = {
  title: "", author: "", category: "school" as "school" | "university",
  level: ALL_LEVELS[0], subject: SUBJECTS[0], price: "", coverImageUrl: "",
  description: "", inStock: true,
};

export default function AdminBooksManager() {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const snap = await getDocs(collection(getFirebaseDb(), "books"));
      setBooks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Book, "id">) })));
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(b: Book) {
    setForm({
      title: b.title, author: b.author || "", category: b.category,
      level: b.level, subject: b.subject, price: String(b.price),
      coverImageUrl: b.coverImageUrl || "", description: b.description || "",
      inStock: b.inStock,
    });
    setEditingId(b.id);
    setShowForm(true);
  }

  async function handleSave() {
    const price = Math.max(Math.round(Number(form.price) || 0), 0);
    if (!form.title.trim() || price <= 0) return;
    setSaving(true);
    try {
      const db = getFirebaseDb();
      const data = {
        title: form.title.trim(),
        author: form.author.trim() || null,
        category: form.category,
        level: form.level,
        subject: form.subject,
        price,
        coverImageUrl: form.coverImageUrl.trim() || null,
        description: form.description.trim() || null,
        inStock: form.inStock,
      };
      if (editingId) {
        await updateDoc(doc(db, "books", editingId), data);
      } else {
        await addDoc(collection(db, "books"), { ...data, createdAt: serverTimestamp() });
      }
      setShowForm(false);
      await load();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("এই বইটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(getFirebaseDb(), "books", id));
      await load();
    } catch {
      setError(true);
    }
  }

  if (error) {
    return <p className="text-sm text-clay">তথ্য আনা/সেভ করা যায়নি — আবার চেষ্টা করুন।</p>;
  }

  if (!books) {
    return <p className="text-sm text-ink-soft">লোড হচ্ছে...</p>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={startAdd}
        className="flex items-center gap-2 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold-deep"
      >
        <Plus size={15} /> নতুন বই যোগ করুন
      </button>

      {showForm && (
        <div className="mt-5 rounded-sm border border-line bg-paper p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display-bn text-lg text-ink">
              {editingId ? "বই সম্পাদনা করুন" : "নতুন বই"}
            </h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-ink-soft hover:text-ink">
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-ink">বইয়ের নাম *</span>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1.5 w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">লেখক/প্রকাশনা</span>
              <input
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                className="mt-1.5 w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">দাম (৳) *</span>
              <input
                type="text"
                inputMode="numeric"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: toEnglishDigits(e.target.value) }))}
                className="mt-1.5 w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">ক্যাটাগরি</span>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as "school" | "university" }))}
                className="mt-1.5 w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              >
                <option value="school">স্কুল/মাদ্রাসা/কলেজ</option>
                <option value="university">বিশ্ববিদ্যালয় ভর্তি</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">শ্রেণি/স্তর</span>
              <select
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                className="mt-1.5 w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              >
                {ALL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">বিষয়</span>
              <select
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                className="mt-1.5 w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              >
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
              />
              <span className="text-sm text-ink">স্টকে আছে</span>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-ink">কভার ছবির লিংক (URL)</span>
              <input
                value={form.coverImageUrl}
                onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
                placeholder="https://..."
                className="mt-1.5 w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-ink">বিবরণ</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="mt-1.5 w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-4 flex items-center gap-2 rounded-sm bg-teal-deep px-5 py-2 text-sm font-medium text-paper hover:opacity-90 disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {editingId ? "আপডেট করুন" : "সেভ করুন"}
          </button>
        </div>
      )}

      <div className="mt-8 space-y-2">
        {books.length === 0 && <p className="text-sm text-ink-soft/60">এখনো কোনো বই যোগ করা হয়নি।</p>}
        {books.map((b) => (
          <div key={b.id} className="flex items-center justify-between gap-3 rounded-sm border border-line bg-paper p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-9 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-paper-raised">
                {b.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.coverImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <BookOpen size={16} className="text-ink-soft/30" />
                )}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{b.title}</p>
                <p className="text-xs text-ink-soft/60">{b.level} · {b.subject} · ৳{b.price}</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => startEdit(b)} className="text-ink-soft hover:text-ink">
                <Pencil size={15} />
              </button>
              <button type="button" onClick={() => handleDelete(b.id)} className="text-ink-soft hover:text-clay">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
