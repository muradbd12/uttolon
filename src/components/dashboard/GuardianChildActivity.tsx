"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ClipboardList, ListChecks, CheckCircle2, Clock, AlertTriangle, MessageSquare } from "lucide-react";
import { getFirebaseDb } from "@/lib/firebase";

type Hw = { id: string; title: string; subject: string; dueDate: string };
type Sub = { late: boolean; checked: boolean; teacherComment: string };
type QuizResult = { id: string; title: string; score: number; total: number; ms: number };
type PendingQuiz = { id: string; title: string; subject: string; durationMin: number | null };

const bn = (n: number) => n.toLocaleString("bn-BD");
const bdToday = () => new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 10);

// Guardian dashboard: how the selected child is doing with homework and online tests.
// Read-only — guardians can see, never change, anything here.
export default function GuardianChildActivity({
  studentUid,
  className,
  childName,
}: {
  studentUid: string | null | undefined;
  className: string | null | undefined;
  childName?: string | null;
}) {
  const [homework, setHomework] = useState<Hw[] | null>(null);
  const [subs, setSubs] = useState<Record<string, Sub>>({});
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [pending, setPending] = useState<PendingQuiz[]>([]);

  useEffect(() => {
    setHomework(null);
    setResults(null);
    setSubs({});
    setPending([]);
    if (!studentUid) return;
    let cancelled = false;
    const db = getFirebaseDb();

    (async () => {
      // homework for the child's class + the child's submissions
      try {
        const [hwSnap, subSnap] = await Promise.all([
          className ? getDocs(query(collection(db, "homework"), where("className", "==", className))) : Promise.resolve(null),
          getDocs(query(collection(db, "homeworkSubmissions"), where("studentUid", "==", studentUid))),
        ]);
        if (cancelled) return;
        setHomework(
          hwSnap
            ? hwSnap.docs
                .map((d) => ({ id: d.id, title: (d.data().title as string) || "", subject: (d.data().subject as string) || "", dueDate: (d.data().dueDate as string) || "" }))
                .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
            : []
        );
        const map: Record<string, Sub> = {};
        subSnap.docs.forEach((d) => {
          const x = d.data();
          map[x.homeworkId as string] = { late: !!x.late, checked: !!x.checked, teacherComment: (x.teacherComment as string) || "" };
        });
        setSubs(map);
      } catch {
        if (!cancelled) setHomework([]);
      }
    })();

    (async () => {
      // online tests: results the child already has, and published tests not yet taken
      try {
        const [resSnap, quizSnap] = await Promise.all([
          getDocs(query(collection(db, "quizResults"), where("studentUid", "==", studentUid))),
          getDocs(query(collection(db, "quizzes"), where("published", "==", true))),
        ]);
        if (cancelled) return;
        const done = new Set<string>();
        const rs = resSnap.docs
          .map((d) => {
            const x = d.data();
            done.add(x.quizId as string);
            return {
              id: d.id,
              title: (x.quizTitle as string) || "",
              score: Number(x.score) || 0,
              total: Number(x.total) || 0,
              ms: x.submittedAt?.toMillis ? (x.submittedAt.toMillis() as number) : 0,
            };
          })
          .sort((a, b) => b.ms - a.ms);
        setResults(rs);
        setPending(
          quizSnap.docs
            .filter((d) => !done.has(d.id))
            .filter((d) => {
              const c = (d.data().className as string) || "";
              return !c || !className || c === className;
            })
            .map((d) => ({
              id: d.id,
              title: (d.data().title as string) || "",
              subject: (d.data().subject as string) || "",
              durationMin: (d.data().durationMin as number) || null,
            }))
        );
      } catch {
        if (!cancelled) setResults([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [studentUid, className]);

  if (homework === null || results === null) return null;
  if (homework.length === 0 && results.length === 0 && pending.length === 0) return null;

  const today = bdToday();
  const submitted = homework.filter((h) => subs[h.id]).length;
  const overdue = homework.filter((h) => !subs[h.id] && h.dueDate && h.dueDate < today).length;
  const avg = results.length ? Math.round(results.reduce((s, r) => s + (r.total ? (r.score / r.total) * 100 : 0), 0) / results.length) : null;

  return (
    <div className="rounded-sm border border-line bg-paper p-6">
      <h2 className="font-display-bn text-lg text-ink">
        হোমওয়ার্ক ও অনলাইন টেস্ট{childName ? ` — ${childName}` : ""}
      </h2>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-teal-soft px-3 py-1 text-teal-deep">
          হোমওয়ার্ক জমা: {bn(submitted)}/{bn(homework.length)}
        </span>
        {overdue > 0 && (
          <span className="rounded-full bg-clay-soft px-3 py-1 text-clay">সময় পেরিয়েছে, জমা হয়নি: {bn(overdue)}টা</span>
        )}
        <span className="rounded-full bg-gold-soft px-3 py-1 text-gold-deep">
          টেস্ট দিয়েছে: {bn(results.length)}টা{avg !== null ? ` · গড় ${bn(avg)}%` : ""}
        </span>
        {pending.length > 0 && (
          <span className="rounded-full bg-paper-raised px-3 py-1 text-ink-soft">এখনো দেয়নি: {bn(pending.length)}টা টেস্ট</span>
        )}
      </div>

      {homework.length > 0 && (
        <div className="mt-5">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <ClipboardList size={15} /> হোমওয়ার্ক
          </p>
          <ul className="mt-2 divide-y divide-line/60">
            {homework.slice(0, 8).map((h) => {
              const s = subs[h.id];
              const isOverdue = !s && h.dueDate && h.dueDate < today;
              return (
                <li key={h.id} className="py-2.5 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-ink">{h.title}</p>
                      <p className="text-xs text-ink-soft/70">
                        {h.subject} · জমার সময়সীমা {h.dueDate || "—"}
                      </p>
                    </div>
                    {s ? (
                      <span className="flex items-center gap-1 rounded-full bg-teal-soft px-2.5 py-0.5 text-xs font-semibold text-teal-deep">
                        <CheckCircle2 size={12} /> জমা দিয়েছে{s.late ? " (দেরিতে)" : ""}
                      </span>
                    ) : isOverdue ? (
                      <span className="flex items-center gap-1 rounded-full bg-clay-soft px-2.5 py-0.5 text-xs font-semibold text-clay">
                        <AlertTriangle size={12} /> জমা দেয়নি
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-semibold text-gold-deep">
                        <Clock size={12} /> সময় আছে
                      </span>
                    )}
                  </div>
                  {s?.checked && (
                    <p className="mt-1.5 flex items-start gap-1.5 text-xs text-ink-soft">
                      <MessageSquare size={12} className="mt-0.5 shrink-0 text-gold-deep" />
                      <span>শিক্ষক দেখেছেন{s.teacherComment ? ` — ${s.teacherComment}` : ""}</span>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {(results.length > 0 || pending.length > 0) && (
        <div className="mt-5">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <ListChecks size={15} /> অনলাইন টেস্ট
          </p>
          <ul className="mt-2 divide-y divide-line/60">
            {results.slice(0, 8).map((r) => {
              const pct = r.total ? Math.round((r.score / r.total) * 100) : 0;
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                  <span className="text-ink">{r.title}</span>
                  <span className="font-bold" style={{ color: pct >= 60 ? "#047857" : pct >= 40 ? "#b45309" : "#be123c" }}>
                    {bn(r.score)}/{bn(r.total)} ({bn(pct)}%)
                  </span>
                </li>
              );
            })}
            {pending.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <span className="text-ink">
                  {p.title}
                  <span className="text-xs text-ink-soft/70"> · {p.subject}{p.durationMin ? ` · ${bn(p.durationMin)} মিনিট` : ""}</span>
                </span>
                <span className="rounded-full bg-paper-raised px-2.5 py-0.5 text-xs text-ink-soft">এখনো দেয়নি</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
