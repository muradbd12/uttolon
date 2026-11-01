"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { DEFAULT_PROGRAMS, type Program } from "@/lib/programs";
import { clearProgramsCache } from "@/lib/usePrograms";
import { toEnglishDigits } from "@/lib/numberInput";
import { Plus, Save, Trash2, Loader2, AlertCircle, CheckCircle2, Layers, Info } from "lucide-react";

type Draft = {
  title: string;
  bn: string;
  desc: string;
  longDesc: string;
  fee: string;
  order: string;
  highlight: boolean;
  active: boolean;
};

const EMPTY: Draft = { title: "", bn: "", desc: "", longDesc: "", fee: "", order: "", highlight: false, active: true };

function toDraft(p: Program): Draft {
  return {
    title: p.title,
    bn: p.bn || "",
    desc: p.desc || "",
    longDesc: p.longDesc || "",
    fee: String(p.fee ?? ""),
    order: p.order != null ? String(p.order) : "",
    highlight: !!p.highlight,
    active: p.active !== false,
  };
}

function toPayload(d: Draft) {
  return {
    title: d.title.trim(),
    bn: d.bn.trim(),
    desc: d.desc.trim(),
    longDesc: d.longDesc.trim(),
    fee: Number(toEnglishDigits(d.fee)) || 0,
    order: d.order.trim() ? Number(toEnglishDigits(d.order)) || 0 : 999,
    highlight: d.highlight,
    active: d.active,
  };
}

const inputCls =
  "mt-1 w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-ink";

function Editor({
  initial,
  isNew,
  busy,
  onSave,
  onDelete,
}: {
  initial: Draft;
  isNew?: boolean;
  busy: boolean;
  onSave: (d: Draft) => void;
  onDelete?: () => void;
}) {
  const [d, setD] = useState<Draft>(initial);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const feeNum = Number(toEnglishDigits(d.fee)) || 0;
  const valid = d.title.trim().length > 0 && feeNum > 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="block text-xs text-ink-soft">
        প্রোগ্রামের নাম (English)
        <input value={d.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="যেমন: IELTS Program" />
        {!isNew && (
          <span className="mt-1 block text-[11px] text-ink-soft/60">
            নাম বদলালে আগে জমা হওয়া আবেদনে পুরনো নামই থাকবে।
          </span>
        )}
      </label>
      <label className="block text-xs text-ink-soft">
        বাংলা নাম
        <input value={d.bn} onChange={(e) => set("bn", e.target.value)} className={inputCls} placeholder="যেমন: আইইএলটিএস প্রোগ্রাম" />
      </label>
      <label className="block text-xs text-ink-soft sm:col-span-2">
        সংক্ষিপ্ত বিবরণ (হোমপেজের কার্ডে)
        <input value={d.desc} onChange={(e) => set("desc", e.target.value)} className={inputCls} />
      </label>
      <label className="block text-xs text-ink-soft sm:col-span-2">
        বিস্তারিত বিবরণ (/programs পেজে — ফাঁকা রাখলে সংক্ষিপ্তটাই দেখাবে)
        <textarea value={d.longDesc} onChange={(e) => set("longDesc", e.target.value)} rows={2} className={inputCls} />
      </label>
      <label className="block text-xs text-ink-soft">
        ভর্তি ফি (টাকা)
        <input
          inputMode="numeric"
          value={d.fee}
          onChange={(e) => set("fee", toEnglishDigits(e.target.value))}
          className={inputCls}
          placeholder="যেমন: ৩০০০"
        />
      </label>
      <label className="block text-xs text-ink-soft">
        ক্রম (ছোট সংখ্যা আগে দেখায়)
        <input
          inputMode="numeric"
          value={d.order}
          onChange={(e) => set("order", toEnglishDigits(e.target.value))}
          className={inputCls}
          placeholder="যেমন: ৫"
        />
      </label>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:col-span-2">
        <label className="flex items-center gap-2 text-xs text-ink">
          <input type="checkbox" checked={d.active} onChange={(e) => set("active", e.target.checked)} />
          সাইট ও ভর্তি ফর্মে দেখাবে
        </label>
        <label className="flex items-center gap-2 text-xs text-ink">
          <input type="checkbox" checked={d.highlight} onChange={(e) => set("highlight", e.target.checked)} />
          বিশেষ হাইলাইট (গাঢ় কার্ড)
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
        <button
          type="button"
          disabled={busy || !valid}
          onClick={() => onSave(d)}
          className="flex items-center gap-1.5 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-50"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : isNew ? <Plus size={14} /> : <Save size={14} />}
          {isNew ? "যোগ করুন" : "সেভ করুন"}
        </button>
        {onDelete && (
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-sm border border-clay/40 px-3 py-2 text-sm text-clay hover:bg-clay-soft disabled:opacity-50"
          >
            <Trash2 size={14} /> মুছুন
          </button>
        )}
        {!valid && <span className="text-[11px] text-ink-soft/60">নাম ও ০-র বেশি ফি দিতে হবে</span>}
      </div>
    </div>
  );
}

export default function AdminProgramsManager() {
  const [items, setItems] = useState<Program[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function load() {
    try {
      const snap = await getDocs(collection(getFirebaseDb(), "programs"));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Program, "id">) }))
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));
      setItems(list);
    } catch {
      setItems([]);
      setMessage({
        type: "err",
        text: "তালিকা পড়া যায়নি — Firebase Console-এ Firestore Rules (programs-এর নিয়মসহ) Publish করা আছে কিনা দেখুন।",
      });
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function run(id: string, action: () => Promise<void>, okText: string) {
    setBusyId(id);
    setMessage(null);
    try {
      await action();
      clearProgramsCache();
      await load();
      setMessage({ type: "ok", text: okText });
    } catch {
      setMessage({
        type: "err",
        text: "সেভ হয়নি — Firestore Rules-এ programs-এর নিয়ম Publish করা আছে কিনা এবং ইন্টারনেট ঠিক আছে কিনা দেখুন।",
      });
    } finally {
      setBusyId(null);
    }
  }

  function duplicateTitle(title: string, exceptId?: string) {
    return !!items?.some((p) => p.id !== exceptId && p.title.trim().toLowerCase() === title.trim().toLowerCase());
  }

  async function seedDefaults() {
    await run(
      "seed",
      async () => {
        const db = getFirebaseDb();
        const batch = writeBatch(db);
        DEFAULT_PROGRAMS.forEach((p) => {
          const { id, ...rest } = p;
          void id;
          batch.set(doc(collection(db, "programs")), rest);
        });
        await batch.commit();
      },
      "ডিফল্ট প্রোগ্রামগুলো সেভ হয়েছে — এখন যেকোনোটা এডিট করতে পারবেন।"
    );
  }

  if (items === null) {
    return (
      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <Loader2 size={15} className="animate-spin" /> লোড হচ্ছে...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <p
          className={`flex items-start gap-2 rounded-sm border px-3 py-2 text-sm ${
            message.type === "ok"
              ? "border-teal/30 bg-teal-soft text-teal-deep"
              : "border-clay/30 bg-clay-soft text-clay"
          }`}
        >
          {message.type === "ok" ? (
            <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
          )}
          {message.text}
        </p>
      )}

      {items.length === 0 && (
        <div className="rounded-sm border border-gold/40 bg-gold-soft/40 p-4">
          <p className="flex items-start gap-2 text-sm text-ink">
            <Info size={15} className="mt-0.5 shrink-0 text-gold-deep" />
            এখনো নিজের তালিকা সেভ করা হয়নি — সাইট ও ভর্তি ফর্ম এখন {DEFAULT_PROGRAMS.length}টা ডিফল্ট প্রোগ্রাম ও
            ডিফল্ট ফি ব্যবহার করছে। এডিট করতে আগে ডিফল্টগুলো একবার সেভ করে নিন (তারপর প্রতিটার ফি/নাম/বিবরণ
            বদলানো যাবে, নতুন যোগ বা লুকানোও যাবে)।
          </p>
          <button
            type="button"
            onClick={seedDefaults}
            disabled={busyId === "seed"}
            className="mt-3 flex items-center gap-2 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
          >
            {busyId === "seed" ? <Loader2 size={14} className="animate-spin" /> : <Layers size={14} />}
            ডিফল্ট {DEFAULT_PROGRAMS.length}টা প্রোগ্রাম সেভ করুন
          </button>
        </div>
      )}

      <details className="rounded-sm border border-line bg-paper p-4" open={items.length > 0 && items.length < 3}>
        <summary className="cursor-pointer text-sm font-medium text-ink">+ নতুন প্রোগ্রাম যোগ করুন</summary>
        <div className="mt-4">
          <Editor
            key={`new-${items.length}`}
            initial={EMPTY}
            isNew
            busy={busyId === "new"}
            onSave={(d) => {
              if (duplicateTitle(d.title)) {
                setMessage({ type: "err", text: "এই নামে আগেই একটা প্রোগ্রাম আছে।" });
                return;
              }
              void run(
                "new",
                async () => {
                  await addDoc(collection(getFirebaseDb(), "programs"), toPayload(d));
                },
                "নতুন প্রোগ্রাম যোগ হয়েছে।"
              );
            }}
          />
        </div>
      </details>

      {items.length > 0 && (
        <div className="space-y-4">
          {items.map((p) => (
            <div key={p.id} className="rounded-sm border border-line bg-paper p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="font-display-bn text-base text-ink">{p.bn || p.title}</span>
                <span className="text-xs text-ink-soft/60">{p.title}</span>
                {p.active === false && (
                  <span className="rounded-full bg-clay-soft px-2 py-0.5 text-[11px] text-clay">লুকানো</span>
                )}
              </div>
              <Editor
                key={`${p.id}-${p.title}-${p.fee}-${p.order}-${p.active}`}
                initial={toDraft(p)}
                busy={busyId === p.id}
                onSave={(d) => {
                  if (duplicateTitle(d.title, p.id)) {
                    setMessage({ type: "err", text: "এই নামে আগেই একটা প্রোগ্রাম আছে।" });
                    return;
                  }
                  void run(
                    p.id,
                    async () => {
                      await updateDoc(doc(getFirebaseDb(), "programs", p.id), toPayload(d));
                    },
                    "সেভ হয়েছে।"
                  );
                }}
                onDelete={() => {
                  if (!window.confirm(`"${p.title}" প্রোগ্রামটা মুছে ফেলবেন? (আগের আবেদনে কোনো প্রভাব পড়বে না)`)) return;
                  void run(
                    p.id,
                    async () => {
                      await deleteDoc(doc(getFirebaseDb(), "programs", p.id));
                    },
                    "প্রোগ্রাম মুছে ফেলা হয়েছে।"
                  );
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
