"use client";

import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { QURAN_RATINGS, QURAN_TYPES, mapQuranLog, ratingStyle, type QuranLog, type QuranRating, type QuranType } from "@/lib/quran";
import { Loader2, AlertCircle, CheckCircle2, Trash2, Plus, Search } from "lucide-react";

type Student = { uid: string; name: string; className: string };

const bn = (n: number) => n.toLocaleString("bn-BD");
const today = () => new Date().toISOString().slice(0, 10);
const inputCls =
  "w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-ink";

export default function QuranLogManager() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [logs, setLogs] = useState<QuranLog[] | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [find, setFind] = useState("");
  const [uid, setUid] = useState("");
  const [date, setDate] = useState(today());
  const [type, setType] = useState<QuranType>("new");
  const [range, setRange] = useState("");
  const [rating, setRating] = useState<QuranRating>("good");
  const [para, setPara] = useState("");
  const [note, setNote] = useState("");

  async function loadLogs() {
    try {
      const snap = await getDocs(query(collection(getFirebaseDb(), "quranLogs"), orderBy("createdAt", "desc"), limit(60)));
      setLogs(snap.docs.map((d) => mapQuranLog(d.id, d.data())));
    } catch {
      setLogs([]);
      setMsg({ ok: false, text: "তালিকা আনা যায়নি — Firestore Rules (quranLogs-এর নিয়মসহ) Publish করা আছে কিনা দেখুন।" });
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(getFirebaseDb(), "users"), where("role", "==", "student")));
        setStudents(
          snap.docs
            .map((d) => ({
              uid: d.id,
              name: (d.data().name as string) || "নাম নেই",
              className: (d.data().className as string) || "",
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      } catch {
        setStudents([]);
      }
    })();
    loadLogs();
  }, []);

  const options = useMemo(() => {
    const q = find.trim().toLowerCase();
    return (students || []).filter((s) => !q || `${s.name} ${s.className}`.toLowerCase().includes(q));
  }, [students, find]);

  async function save() {
    setMsg(null);
    const st = (students || []).find((s) => s.uid === uid);
    if (!st) return setMsg({ ok: false, text: "আগে শিক্ষার্থী বাছুন।" });
    if (!range.trim()) return setMsg({ ok: false, text: "কোন সূরা/আয়াত/পারা পড়ানো হলো তা লিখুন।" });
    setSaving(true);
    try {
      await addDoc(collection(getFirebaseDb(), "quranLogs"), {
        studentUid: st.uid,
        studentName: st.name,
        className: st.className,
        date,
        type,
        range: range.trim(),
        rating,
        paraCompleted: para ? Number(para) : null,
        note: note.trim(),
        createdBy: getFirebaseAuth().currentUser?.uid || null,
        createdAt: serverTimestamp(),
      });
      setRange("");
      setNote("");
      setPara("");
      setMsg({ ok: true, text: `${st.name}-এর পাঠ রেকর্ড হয়েছে।` });
      await loadLogs();
    } catch {
      setMsg({ ok: false, text: "সেভ হয়নি — Firestore Rules Publish করা আছে কিনা ও ইন্টারনেট দেখুন।" });
    } finally {
      setSaving(false);
    }
  }

  async function remove(l: QuranLog) {
    if (!window.confirm(`${l.studentName}-এর "${l.range}" রেকর্ডটা মুছে ফেলবেন?`)) return;
    try {
      await deleteDoc(doc(getFirebaseDb(), "quranLogs", l.id));
      setLogs((prev) => (prev ? prev.filter((x) => x.id !== l.id) : prev));
    } catch {
      setMsg({ ok: false, text: "মোছা যায়নি।" });
    }
  }

  return (
    <div className="space-y-8">
      {msg && (
        <p
          className={`flex items-start gap-2 rounded-sm border px-3 py-2 text-sm ${
            msg.ok ? "border-teal/30 bg-teal-soft text-teal-deep" : "border-clay/30 bg-clay-soft text-clay"
          }`}
        >
          {msg.ok ? <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> : <AlertCircle size={15} className="mt-0.5 shrink-0" />}
          {msg.text}
        </p>
      )}

      <div className="rounded-sm border border-line bg-paper p-5">
        <h2 className="font-display-bn text-lg text-ink">আজকের পাঠ রেকর্ড করুন</h2>
        {students === null ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft"><Loader2 size={14} className="animate-spin" /> লোড হচ্ছে...</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center gap-2 rounded-sm border border-line bg-paper-raised px-3 py-2">
                <Search size={14} className="text-ink-soft/50" />
                <input value={find} onChange={(e) => setFind(e.target.value)} placeholder="শিক্ষার্থীর নাম বা ক্লাস দিয়ে খুঁজুন" className="w-full bg-transparent text-sm text-ink outline-none" />
              </div>
              <select value={uid} onChange={(e) => setUid(e.target.value)} className={inputCls}>
                <option value="">— শিক্ষার্থী বাছুন ({bn(options.length)} জন) —</option>
                {options.map((s) => (
                  <option key={s.uid} value={s.uid}>
                    {s.name}{s.className ? ` — ${s.className}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            <select value={type} onChange={(e) => setType(e.target.value as QuranType)} className={inputCls}>
              {Object.entries(QURAN_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input value={range} onChange={(e) => setRange(e.target.value)} placeholder="কী পড়ানো হলো (যেমন: সূরা বাকারা, আয়াত ১–১০)" className={`${inputCls} sm:col-span-2`} />
            <select value={rating} onChange={(e) => setRating(e.target.value as QuranRating)} className={inputCls}>
              {Object.entries(QURAN_RATINGS).map(([k, v]) => (
                <option key={k} value={k}>পারদর্শিতা: {v}</option>
              ))}
            </select>
            <select value={para} onChange={(e) => setPara(e.target.value)} className={inputCls}>
              <option value="">কোনো পারা সম্পন্ন হয়নি</option>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>{bn(p)} নম্বর পারা সম্পন্ন হলো</option>
              ))}
            </select>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="অভিভাবক/শিক্ষার্থীর জন্য মন্তব্য (ঐচ্ছিক)" className={`${inputCls} sm:col-span-2`} />
            <button type="button" onClick={save} disabled={saving} className="flex w-fit items-center gap-2 rounded-sm bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60 sm:col-span-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} রেকর্ড করুন
            </button>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display-bn text-lg text-ink">সাম্প্রতিক রেকর্ড</h2>
        {logs === null ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft"><Loader2 size={14} className="animate-spin" /> লোড হচ্ছে...</p>
        ) : logs.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft/60">এখনো কোনো পাঠ রেকর্ড করা হয়নি।</p>
        ) : (
          <ul className="mt-3 divide-y divide-line/60 rounded-sm border border-line bg-paper">
            {logs.map((l) => (
              <li key={l.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-ink">
                    {l.studentName} <span className="font-normal text-ink-soft/60">{l.className}</span>
                  </p>
                  <p className="text-ink">{l.range}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-ink-soft/70">{l.date}</span>
                    <span className="rounded-full bg-paper-raised px-2 py-0.5 text-[11px] text-ink-soft">{QURAN_TYPES[l.type]}</span>
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: ratingStyle[l.rating].bg, color: ratingStyle[l.rating].fg }}>
                      {QURAN_RATINGS[l.rating]}
                    </span>
                    {l.paraCompleted ? <span className="rounded-full bg-teal-soft px-2 py-0.5 text-[11px] font-semibold text-teal-deep">{bn(l.paraCompleted)} নং পারা সম্পন্ন</span> : null}
                  </div>
                  {l.note && <p className="mt-1 text-xs text-ink-soft">{l.note}</p>}
                </div>
                <button type="button" onClick={() => remove(l)} className="text-clay hover:text-clay/70" aria-label="মুছুন">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
