"use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where, writeBatch, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { SCHOOL_LEVELS } from "@/lib/books";
import { toEnglishDigits } from "@/lib/numberInput";
import { Plus, Trash2, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, BarChart3 } from "lucide-react";

type QuizRow = {
  id: string;
  title: string;
  subject: string;
  className: string;
  durationMin: number | null;
  questionCount: number;
  published: boolean;
};
type ResultRow = { id: string; studentName: string; className: string; score: number; total: number; ms: number };
type Draft = { q: string; options: string[]; correct: number };

const bn = (n: number) => n.toLocaleString("bn-BD");
const LETTERS = ["ক", "খ", "গ", "ঘ", "ঙ"];
const blankQ = (): Draft => ({ q: "", options: ["", "", "", ""], correct: 0 });
const inputCls =
  "w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-ink";

function Results({ quizId }: { quizId: string }) {
  const [rows, setRows] = useState<ResultRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(query(collection(getFirebaseDb(), "quizResults"), where("quizId", "==", quizId)));
        if (cancelled) return;
        setRows(
          snap.docs
            .map((d) => {
              const x = d.data();
              return {
                id: d.id,
                studentName: (x.studentName as string) || "নাম নেই",
                className: (x.className as string) || "",
                score: Number(x.score) || 0,
                total: Number(x.total) || 0,
                ms: x.submittedAt?.toMillis ? (x.submittedAt.toMillis() as number) : 0,
              };
            })
            .sort((a, b) => b.score - a.score || a.ms - b.ms)
        );
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  if (error) return <p className="mt-3 text-sm text-clay">ফলাফল আনা যায়নি।</p>;
  if (!rows) return <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft"><Loader2 size={14} className="animate-spin" /> লোড হচ্ছে...</p>;
  if (rows.length === 0) return <p className="mt-3 text-sm text-ink-soft/60">এখনো কেউ টেস্ট দেয়নি।</p>;

  const avg = Math.round(rows.reduce((s, r) => s + (r.total ? (r.score / r.total) * 100 : 0), 0) / rows.length);
  return (
    <div className="mt-3">
      <p className="text-sm text-ink-soft">
        {bn(rows.length)} জন দিয়েছে · গড় <span className="font-semibold text-ink">{bn(avg)}%</span>
      </p>
      <table className="mt-2 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-line text-left text-xs font-semibold text-ink-soft">
            <th className="py-1.5 pr-3">শিক্ষার্থী</th>
            <th className="py-1.5 pr-3">ক্লাস</th>
            <th className="py-1.5 pr-3">স্কোর</th>
            <th className="py-1.5">শতাংশ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line/60">
              <td className="py-1.5 pr-3 text-ink">{r.studentName}</td>
              <td className="py-1.5 pr-3 text-ink-soft">{r.className || "—"}</td>
              <td className="py-1.5 pr-3 font-semibold text-ink">
                {bn(r.score)}/{bn(r.total)}
              </td>
              <td className="py-1.5 text-ink-soft">{bn(r.total ? Math.round((r.score / r.total) * 100) : 0)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function QuizManager() {
  const [quizzes, setQuizzes] = useState<QuizRow[] | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [openResults, setOpenResults] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // create form
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [questions, setQuestions] = useState<Draft[]>([blankQ()]);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const snap = await getDocs(collection(getFirebaseDb(), "quizzes"));
      setQuizzes(
        snap.docs
          .map((d) => {
            const x = d.data();
            return {
              id: d.id,
              title: (x.title as string) || "",
              subject: (x.subject as string) || "",
              className: (x.className as string) || "",
              durationMin: (x.durationMin as number) || null,
              questionCount: Number(x.questionCount) || ((x.questions as unknown[]) || []).length,
              published: !!x.published,
              ms: x.createdAt?.toMillis ? (x.createdAt.toMillis() as number) : 0,
            };
          })
          .sort((a, b) => b.ms - a.ms)
          .map(({ ms, ...rest }) => {
            void ms;
            return rest;
          })
      );
    } catch {
      setQuizzes([]);
      setMsg({ ok: false, text: "তালিকা আনা যায়নি — Firestore Rules (quizzes-এর নিয়মসহ) Publish করা আছে কিনা দেখুন।" });
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setQ(i: number, patch: Partial<Draft>) {
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }
  function setOpt(i: number, oi: number, v: string) {
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? { ...q, options: q.options.map((o, k) => (k === oi ? v : o)) } : q)));
  }

  async function save() {
    setMsg(null);
    if (!title.trim()) return setMsg({ ok: false, text: "টেস্টের নাম দিন।" });
    const cleaned: { q: string; options: string[]; answer: number }[] = [];
    for (let i = 0; i < questions.length; i++) {
      const d = questions[i];
      if (!d.q.trim()) return setMsg({ ok: false, text: `প্রশ্ন ${bn(i + 1)}-এর লেখা ফাঁকা।` });
      const filled = d.options.map((o, idx) => ({ o: o.trim(), idx })).filter((x) => x.o);
      if (filled.length < 2) return setMsg({ ok: false, text: `প্রশ্ন ${bn(i + 1)}-এ অন্তত ২টা অপশন দিন।` });
      const pos = filled.findIndex((x) => x.idx === d.correct);
      if (pos < 0) return setMsg({ ok: false, text: `প্রশ্ন ${bn(i + 1)}-এর সঠিক উত্তরের অপশনটা ফাঁকা — ফাঁকা অপশনকে সঠিক চিহ্নিত করা যায় না।` });
      cleaned.push({ q: d.q.trim(), options: filled.map((x) => x.o), answer: pos });
    }

    setSaving(true);
    try {
      const db = getFirebaseDb();
      const ref = doc(collection(db, "quizzes"));
      const dur = Number(toEnglishDigits(duration)) || 0;
      const batch = writeBatch(db);
      batch.set(ref, {
        title: title.trim(),
        className,
        subject: subject.trim(),
        durationMin: dur > 0 ? dur : null,
        questions: cleaned.map(({ q, options }) => ({ q, options })),
        questionCount: cleaned.length,
        published: publishNow,
        createdBy: getFirebaseAuth().currentUser?.uid || null,
        createdAt: serverTimestamp(),
      });
      batch.set(doc(db, "quizKeys", ref.id), { answers: cleaned.map((c) => c.answer) });
      await batch.commit();
      setTitle("");
      setSubject("");
      setDuration("");
      setClassName("");
      setQuestions([blankQ()]);
      setMsg({ ok: true, text: publishNow ? "টেস্ট তৈরি ও প্রকাশ হয়েছে।" : "টেস্ট খসড়া হিসেবে সেভ হয়েছে (এখনো স্টুডেন্টরা দেখবে না)।" });
      await load();
    } catch {
      setMsg({ ok: false, text: "সেভ হয়নি — Firestore Rules Publish করা আছে কিনা ও ইন্টারনেট দেখুন।" });
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(q: QuizRow) {
    setBusyId(q.id);
    try {
      await updateDoc(doc(getFirebaseDb(), "quizzes", q.id), { published: !q.published });
      await load();
    } catch {
      setMsg({ ok: false, text: "বদলানো যায়নি।" });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(q: QuizRow) {
    if (!window.confirm(`"${q.title}" টেস্টটা মুছে ফেলবেন? (স্টুডেন্টদের আগের স্কোর রেকর্ড থেকে যাবে)`)) return;
    setBusyId(q.id);
    try {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, "quizzes", q.id));
      await deleteDoc(doc(db, "quizKeys", q.id));
      await load();
    } catch {
      setMsg({ ok: false, text: "মোছা যায়নি।" });
    } finally {
      setBusyId(null);
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

      <details className="rounded-sm border border-line bg-paper p-5" open>
        <summary className="cursor-pointer text-[15px] font-semibold text-ink">+ নতুন MCQ টেস্ট বানান</summary>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="টেস্টের নাম (যেমন: গণিত — অধ্যায় ৩ টেস্ট)" className={`${inputCls} sm:col-span-2`} />
            <select value={className} onChange={(e) => setClassName(e.target.value)} className={inputCls}>
              <option value="">সব ক্লাসের জন্য</option>
              {SCHOOL_LEVELS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="বিষয় (যেমন: গণিত)" className={inputCls} />
            <input
              value={duration}
              onChange={(e) => setDuration(toEnglishDigits(e.target.value))}
              inputMode="numeric"
              placeholder="সময় — মিনিট (ঐচ্ছিক; ফাঁকা = সময়সীমা নেই)"
              className={inputCls}
            />
          </div>

          {questions.map((d, i) => (
            <div key={i} className="rounded-sm border border-line p-3">
              <div className="flex items-start gap-2">
                <span className="mt-2 text-sm font-bold text-ink">{bn(i + 1)}.</span>
                <textarea value={d.q} onChange={(e) => setQ(i, { q: e.target.value })} rows={2} placeholder="প্রশ্ন লিখুন" className={inputCls} />
                {questions.length > 1 && (
                  <button type="button" onClick={() => setQuestions((p) => p.filter((_, k) => k !== i))} className="mt-1.5 text-clay" aria-label="প্রশ্ন মুছুন">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {d.options.map((o, oi) => (
                  <label key={oi} className="flex items-center gap-2">
                    <input type="radio" name={`correct-${i}`} checked={d.correct === oi} onChange={() => setQ(i, { correct: oi })} title="সঠিক উত্তর" />
                    <span className="text-sm font-bold text-ink-soft">{LETTERS[oi]}.</span>
                    <input value={o} onChange={(e) => setOpt(i, oi, e.target.value)} placeholder={`অপশন ${LETTERS[oi]}`} className={inputCls} />
                  </label>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-ink-soft/60">যে অপশনের পাশের গোল বোতাম বাছা আছে সেটাই সঠিক উত্তর।</p>
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setQuestions((p) => [...p, blankQ()])} className="flex items-center gap-1.5 rounded-sm border border-ink px-4 py-2 text-sm font-medium text-ink hover:bg-ink hover:text-paper">
              <Plus size={14} /> আরেকটা প্রশ্ন
            </button>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} />
              সাথে সাথে স্টুডেন্টদের জন্য প্রকাশ করুন
            </label>
          </div>
          <button type="button" onClick={save} disabled={saving} className="flex items-center gap-2 rounded-sm bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60">
            {saving && <Loader2 size={14} className="animate-spin" />} টেস্ট সেভ করুন
          </button>
          <p className="text-xs text-ink-soft/60">
            সঠিক উত্তরগুলো আলাদা, শুধু শিক্ষক/অ্যাডমিনের দেখার মতো জায়গায় থাকে — স্টুডেন্টরা কোনোভাবেই আগে দেখতে পারে না।
            টেস্ট সেভ করার পর প্রশ্ন বদলানো যায় না; ভুল হলে মুছে নতুন করে বানান।
          </p>
        </div>
      </details>

      <div>
        <h2 className="font-display-bn text-lg text-ink">তৈরি করা টেস্ট</h2>
        {quizzes === null ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft"><Loader2 size={14} className="animate-spin" /> লোড হচ্ছে...</p>
        ) : quizzes.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft/60">এখনো কোনো টেস্ট বানানো হয়নি।</p>
        ) : (
          <div className="mt-3 space-y-3">
            {quizzes.map((q) => (
              <div key={q.id} className="rounded-sm border border-line bg-paper p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[15px] font-semibold text-ink">{q.title}</p>
                    <p className="text-xs text-ink-soft/70">
                      {q.className || "সব ক্লাস"} · {q.subject || "—"} · {bn(q.questionCount)}টা প্রশ্ন
                      {q.durationMin ? ` · ${bn(q.durationMin)} মিনিট` : ""}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${q.published ? "bg-teal-soft text-teal-deep" : "bg-gold-soft text-gold-deep"}`}>
                    {q.published ? "প্রকাশিত" : "খসড়া"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setOpenResults(openResults === q.id ? null : q.id)} className="flex items-center gap-1.5 rounded-sm border border-ink px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink hover:text-paper">
                    <BarChart3 size={13} /> ফলাফল
                  </button>
                  <button type="button" disabled={busyId === q.id} onClick={() => togglePublish(q)} className="flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink disabled:opacity-50">
                    {q.published ? <EyeOff size={13} /> : <Eye size={13} />} {q.published ? "লুকান" : "প্রকাশ করুন"}
                  </button>
                  <button type="button" disabled={busyId === q.id} onClick={() => remove(q)} className="flex items-center gap-1.5 rounded-sm border border-clay/40 px-3 py-1.5 text-xs text-clay hover:bg-clay-soft disabled:opacity-50">
                    <Trash2 size={13} /> মুছুন
                  </button>
                </div>
                {openResults === q.id && <Results quizId={q.id} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
