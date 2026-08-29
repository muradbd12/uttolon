"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { FolderOpen, ExternalLink, Loader2, AlertTriangle } from "lucide-react";

type Resource = {
  id: string;
  title: string;
  resourceType: string;
  className: string;
  subject: string;
  chapter?: string;
  link: string;
};

export default function ResourceLibrary() {
  const [resources, setResources] = useState<Resource[] | null>(null);
  const [error, setError] = useState(false);
  const [classFilter, setClassFilter] = useState("সব");
  const [subjectFilter, setSubjectFilter] = useState("সব");
  const [typeFilter, setTypeFilter] = useState("সব");

  useEffect(() => {
    async function load() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setResources(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Resource)));
      } catch {
        setError(true);
      }
    }
    load();
  }, []);

  const classes = useMemo(
    () => ["সব", ...Array.from(new Set((resources || []).map((r) => r.className)))],
    [resources]
  );
  const subjects = useMemo(
    () => ["সব", ...Array.from(new Set((resources || []).map((r) => r.subject)))],
    [resources]
  );
  const types = useMemo(
    () => ["সব", ...Array.from(new Set((resources || []).map((r) => r.resourceType)))],
    [resources]
  );

  const filtered = (resources || []).filter(
    (r) =>
      (classFilter === "সব" || r.className === classFilter) &&
      (subjectFilter === "সব" || r.subject === subjectFilter) &&
      (typeFilter === "সব" || r.resourceType === typeFilter)
  );

  const selectClass = "rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink";

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-line p-12 text-center">
        <AlertTriangle size={20} className="text-clay" />
        <p className="text-sm text-ink-soft/60">রিসোর্স লোড করা যায়নি — একটু পরে আবার চেষ্টা করুন।</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className={selectClass}>
          {classes.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className={selectClass}>
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectClass}>
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        {resources === null ? (
          <div className="flex items-center justify-center gap-2 py-16 text-ink-soft">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">লোড হচ্ছে...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-line p-12 text-center">
            <FolderOpen size={22} className="text-ink-soft/40" />
            <p className="text-sm text-ink-soft/60">এই মুহূর্তে এই ফিল্টারে কোনো রিসোর্স নেই।</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((r) => (
              <li key={r.id} className="rounded-sm border border-line bg-paper-raised p-5">
                <span className="font-label w-fit rounded-full bg-teal-soft px-2.5 py-1 text-[10px] uppercase tracking-wide text-teal-deep">
                  {r.resourceType}
                </span>
                <h3 className="mt-3 text-[15px] text-ink">{r.title}</h3>
                <p className="mt-1 text-xs text-ink-soft/60">
                  {r.className} · {r.subject} {r.chapter ? `· ${r.chapter}` : ""}
                </p>
                <a
                  href={r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex w-fit items-center gap-1.5 text-sm font-medium text-ink hover:text-gold-deep"
                >
                  দেখুন / ডাউনলোড করুন <ExternalLink size={13} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
