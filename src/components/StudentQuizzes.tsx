"use client";

import { useEffect, useRef, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { useUserProfile } from "@/lib/useUserProfile";
import { withTimeout } from "@/lib/withTimeout";
import { Loader2, AlertCircle, Clock, CheckCircle2, XCircle, PlayCircle, ListChecks, TimerOff } from "lucide-react";

type Question = { q: string; options: string[] };
type Quiz = {
  id: string;
  title: string;
  subject: string;
  className: string;
  durationMin: number | null;
  questions: Question[];
};
type Result = { quizId: string; score: number; total: number };
type Review = { score: number; total: number; correct: boolean[]; key: number[]; answers: number[]; timedOut?: boolean };
type Timing = { deadlineMs: number | null; offsetMs: number };

const bn = (n: number) => n.toLocaleString("bn-BD");
const LETTERS = ["ক", "খ", "গ", "ঘ", "ঙ"];

async function authHeader() {
  const token = await getFirebaseAuth().currentUser?.getIdToken();
  if (!token) throw new Error("unauthorized");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function Taker({ quiz, timing, onDone, onCancel }: { quiz: Quiz; timing: Timing; onDone: (r: Review) => void; onCancel: () => void }) {
  const [answers, setAnswers] = useState<number[]>(() => quiz.questions.map(() => -1));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const computeLeft = () =>
    timing.deadlineMs === null ? null : Math.max(0, Math.round((timing.deadlineMs - (Date.now() + timing.offsetMs)) / 1000));
  const [left, setLeft] = useState<number | null>(computeLeft);
  const submittedRef = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  async function submit(auto = false) {
    if (submittedRef.current) return;
    const unanswered = answersRef.current.filter((a) => a < 0).length;
    if (!auto && unanswered > 0 && !window.confirm(`${bn(unanswered)}টা প্রশ্নের উত্তর দেওয়া হয়নি — তবুও জমা দেবে?`)) return;
    submittedRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const res = await withTimeout(
        fetch("/api/student/submit-quiz", {
          method: "POST",
          headers: await authHeader(),
          body: JSON.stringify({ quizId: quiz.id, answers: answersRef.current }),
        })
      );
      const data = await res.json();
      if (res.status === 409) {
        setError("এই টেস্ট তুমি আগেই জমা দিয়েছ।");
        return;
      }
      if (res.status === 400 && data?.error === "not_started") {
        setError("টেস্ট শুরু হয়নি — আগের পাতায় ফিরে আবার \"টেস্ট শুরু করো\" চাপো।");
        submittedRef.current = false;
        return;
      }
      if (!res.ok) throw new Error("failed");
      if (data.timedOut) {
        onDone({ score: 0, total: data.total, correct: [], key: [], answers: [], timedOut: true });
        return;
      }
      onDone({ ...(data as Omit<Review, "answers">), answers: answersRef.current });
    } catch {
      submittedRef.current = false;
      setError("জমা হয়নি — ইন্টারনেট দেখে আবার চেষ্টা করো।");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (left === null) return;
    if (left <= 0) {
      void submit(true);
      return;
    }
    const t = setTimeout(() => setLeft(computeLeft()), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const mm = left !== null ? Math.floor(left / 60) : 0;
  const ss = left !== null ? left % 60 : 0;

  return (
    <div className="mt-4 border-t border-line pt-4">
      {left !== null && (
        <p
          className={`sticky top-14 z-10 mb-3 flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${
            left <= 60 ? "bg-clay-soft text-clay" : "bg-gold-soft text-gold-deep"
          }`}
        >
          <Clock size={14} /> {bn(mm)}:{String(ss).padStart(2, "0")}
        </p>
      )}
      <div className="space-y-5">
        {quiz.questions.map((q, qi) => (
          <div key={qi}>
            <p className="text-[15px] font-medium text-ink">
              {bn(qi + 1)}. {q.q}
            </p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {q.options.map((o, oi) => (
                <label
                  key={oi}
                  className={`flex cursor-pointer items-start gap-2 rounded-sm border px-3 py-2 text-sm ${
                    answers[qi] === oi ? "border-ink bg-gold-soft/40 text-ink" : "border-line text-ink-soft hover:border-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${qi}`}
                    checked={answers[qi] === oi}
                    onChange={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
                    className="mt-1"
                  />
                  <span>
                    <strong>{LETTERS[oi]}.</strong> {o}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {error && (
        <p className="mt-3 flex items-start gap-1.5 text-sm text-clay">
          <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void submit(false)}
          disabled={busy}
          className="flex items-center gap-2 rounded-sm bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
        >
          {busy && <Loader2 size={14} className="animate-spin" />} জমা দাও
        </button>
        {timing.deadlineMs === null && (
          <button type="button" onClick={onCancel} disabled={busy} className="text-sm text-ink-soft underline">
            এখন না
          </button>
        )}
        <span className="text-xs text-ink-soft/60">
          {timing.deadlineMs === null
            ? "একবার জমা দিলে আর দ্বিতীয়বার দেওয়া যাবে না।"
            : "সময় একবার শুরু হলে থামে না — পেজ রিফ্রেশ করলেও চলতে থাকে। একবার জমা দিলে আর দ্বিতীয়বার দেওয়া যাবে না।"}
        </span>
      </div>
    </div>
  );
}

function ReviewView({ quiz, r }: { quiz: Quiz; r: Review }) {
  if (r.timedOut) {
    return (
      <p className="mt-4 flex items-start gap-2 rounded-sm border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay">
        <TimerOff size={16} className="mt-0.5 shrink-0" />
        সময় শেষ হয়ে যাওয়ার পরে জমা হয়েছে, তাই এই টেস্টের স্কোর ০ ধরা হয়েছে। প্রয়োজন মনে করলে শিক্ষককে জানাও।
      </p>
    );
  }
  const pct = r.total ? Math.round((r.score / r.total) * 100) : 0;
  return (
    <div className="mt-4 border-t border-line pt-4">
      <p className="text-lg font-bold text-ink">
        তোমার স্কোর: {bn(r.score)} / {bn(r.total)} ({bn(pct)}%)
      </p>
      <div className="mt-4 space-y-4">
        {quiz.questions.map((q, qi) => (
          <div key={qi} className="rounded-sm border border-line p-3">
            <p className="flex items-start gap-1.5 text-[15px] text-ink">
              {r.correct[qi] ? (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal-deep" />
              ) : (
                <XCircle size={16} className="mt-0.5 shrink-0 text-clay" />
              )}
              <span>
                {bn(qi + 1)}. {q.q}
              </span>
            </p>
            <p className="mt-1.5 text-xs text-ink-soft">
              তোমার উত্তর: {r.answers[qi] >= 0 ? `${LETTERS[r.answers[qi]]}. ${q.options[r.answers[qi]]}` : "দেওয়া হয়নি"}
            </p>
            {!r.correct[qi] && (
              <p className="mt-0.5 text-xs font-semibold text-teal-deep">
                সঠিক উত্তর: {LETTERS[r.key[qi]]}. {q.options[r.key[qi]]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StudentQuizzes() {
  const profile = useUserProfile();
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [error, setError] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [timing, setTiming] = useState<Timing>({ deadlineMs: null, offsetMs: 0 });
  const [starting, setStarting] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [review, setReview] = useState<Record<string, Review>>({});

  useEffect(() => {
    if (!profile?.uid) return;
    let cancelled = false;
    (async () => {
      try {
        const db = getFirebaseDb();
        const [qSnap, rSnap] = await Promise.all([
          getDocs(query(collection(db, "quizzes"), where("published", "==", true))),
          getDocs(query(collection(db, "quizResults"), where("studentUid", "==", profile.uid))),
        ]);
        if (cancelled) return;
        const list = qSnap.docs
          .map((d) => {
            const x = d.data();
            return {
              id: d.id,
              title: (x.title as string) || "",
              subject: (x.subject as string) || "",
              className: (x.className as string) || "",
              durationMin: (x.durationMin as number) || null,
              questions: (x.questions as Question[]) || [],
            };
          })
          .filter((q) => !q.className || !profile.className || q.className === profile.className);
        setQuizzes(list);
        const map: Record<string, Result> = {};
        rSnap.docs.forEach((d) => {
          const x = d.data() as Result;
          map[x.quizId] = x;
        });
        setResults(map);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.uid, profile?.className]);

  async function start(q: Quiz) {
    setStartError(null);
    setStarting(q.id);
    try {
      const res = await withTimeout(
        fetch("/api/student/start-quiz", { method: "POST", headers: await authHeader(), body: JSON.stringify({ quizId: q.id }) })
      );
      if (res.status === 409) {
        setStartError("এই টেস্ট তুমি আগেই দিয়েছ — পেজ রিফ্রেশ করে স্কোর দেখো।");
        return;
      }
      if (!res.ok) throw new Error("failed");
      const d = (await res.json()) as { durationMin: number | null; startedAtMs: number | null; serverNowMs: number };
      setTiming({
        deadlineMs: d.durationMin && d.startedAtMs ? d.startedAtMs + d.durationMin * 60000 : null,
        offsetMs: d.serverNowMs - Date.now(),
      });
      setActive(q.id);
    } catch {
      setStartError("টেস্ট শুরু করা যায়নি — ইন্টারনেট দেখে আবার চেষ্টা করো।");
    } finally {
      setStarting(null);
    }
  }

  if (error)
    return (
      <p className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay">
        <AlertCircle size={15} /> টেস্টের তালিকা আনা যায়নি — একটু পরে আবার চেষ্টা করো।
      </p>
    );
  if (!quizzes)
    return (
      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <Loader2 size={15} className="animate-spin" /> লোড হচ্ছে...
      </p>
    );
  if (quizzes.length === 0)
    return (
      <p className="flex items-center gap-2 py-10 text-sm text-ink-soft/70">
        <ListChecks size={18} /> এখনো তোমার জন্য কোনো অনলাইন টেস্ট দেওয়া হয়নি।
      </p>
    );

  return (
    <div className="space-y-4">
      {startError && (
        <p className="flex items-start gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
          <AlertCircle size={15} className="mt-0.5 shrink-0" /> {startError}
        </p>
      )}
      {quizzes.map((q) => {
        const done = results[q.id];
        const rv = review[q.id];
        return (
          <div key={q.id} className="rounded-sm border border-line bg-paper p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-label text-[11px] uppercase tracking-wide text-ink-soft/60">{q.subject}</p>
                <h2 className="mt-0.5 font-display-bn text-lg text-ink">{q.title}</h2>
                <p className="mt-1 text-xs text-ink-soft">
                  {bn(q.questions.length)}টা প্রশ্ন
                  {q.durationMin ? ` · ${bn(q.durationMin)} মিনিট` : ""}
                  {q.className ? ` · ${q.className}` : ""}
                </p>
              </div>
              {done ? (
                <span className="flex items-center gap-1 rounded-full bg-teal-soft px-3 py-1 text-sm font-bold text-teal-deep">
                  <CheckCircle2 size={14} /> {bn(done.score)}/{bn(done.total)}
                </span>
              ) : active === q.id ? null : (
                <button
                  type="button"
                  onClick={() => void start(q)}
                  disabled={starting === q.id}
                  className="flex items-center gap-1.5 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
                >
                  {starting === q.id ? <Loader2 size={15} className="animate-spin" /> : <PlayCircle size={15} />} টেস্ট শুরু করো
                </button>
              )}
            </div>
            {!done && !active && q.durationMin && (
              <p className="mt-2 text-xs text-ink-soft/70">
                "শুরু করো" চাপার সাথে সাথে {bn(q.durationMin)} মিনিটের সময় চলতে শুরু করে — মাঝপথে থামানো বা রিফ্রেশ করে আবার শুরু করা যায় না।
              </p>
            )}
            {active === q.id && !done && (
              <Taker
                quiz={q}
                timing={timing}
                onCancel={() => setActive(null)}
                onDone={(r) => {
                  setReview((prev) => ({ ...prev, [q.id]: r }));
                  setResults((prev) => ({ ...prev, [q.id]: { quizId: q.id, score: r.score, total: r.total } }));
                  setActive(null);
                }}
              />
            )}
            {rv && <ReviewView quiz={q} r={rv} />}
          </div>
        );
      })}
    </div>
  );
}
