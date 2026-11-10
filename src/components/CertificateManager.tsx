"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { withTimeout } from "@/lib/withTimeout";
import { CERT_TITLE_PRESETS, mapCertificate, type Certificate } from "@/lib/certificates";
import { printIsolated } from "@/lib/printReceipt";
import CertificateCard from "@/components/CertificateCard";
import { Loader2, AlertCircle, CheckCircle2, Printer, Trash2, BadgeCheck, Search, X } from "lucide-react";

type Student = { uid: string; name: string; className: string };

const inputCls = "w-full rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-ink";
const today = () => new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 10);

export default function CertificateManager() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [certs, setCerts] = useState<Certificate[] | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<Certificate | null>(null);

  const [find, setFind] = useState("");
  const [uid, setUid] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today());

  async function loadCerts() {
    try {
      const snap = await getDocs(query(collection(getFirebaseDb(), "certificates"), orderBy("createdAt", "desc"), limit(100)));
      setCerts(snap.docs.map((d) => mapCertificate(d.id, d.data())));
    } catch {
      setCerts([]);
      setMsg({ ok: false, text: "সনদের তালিকা আনা যায়নি — Firestore Rules (certificates-এর নিয়মসহ) Publish করা আছে কিনা দেখুন।" });
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(getFirebaseDb(), "users"), where("role", "==", "student")));
        setStudents(
          snap.docs
            .map((d) => ({ uid: d.id, name: (d.data().name as string) || "নাম নেই", className: (d.data().className as string) || "" }))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      } catch {
        setStudents([]);
      }
    })();
    loadCerts();
  }, []);

  const options = useMemo(() => {
    const q = find.trim().toLowerCase();
    return (students || []).filter((s) => !q || `${s.name} ${s.className}`.toLowerCase().includes(q));
  }, [students, find]);

  async function issue() {
    setMsg(null);
    if (!uid) return setMsg({ ok: false, text: "আগে শিক্ষার্থী বাছুন।" });
    if (!title.trim()) return setMsg({ ok: false, text: "সনদের শিরোনাম দিন।" });
    setSaving(true);
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken();
      if (!token) throw new Error("unauthorized");
      const res = await withTimeout(
        fetch("/api/admin/issue-certificate", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ studentUid: uid, title: title.trim(), description: description.trim(), issuedDate: date }),
        })
      );
      if (!res.ok) throw new Error("failed");
      const out = (await res.json()) as { id: string; certNo: string; verifyCode: string };
      const st = (students || []).find((s) => s.uid === uid);
      setPreview({
        id: out.id,
        certNo: out.certNo,
        verifyCode: out.verifyCode,
        studentUid: uid,
        studentName: st?.name || "",
        className: st?.className || "",
        studentId: "",
        title: title.trim(),
        description: description.trim(),
        issuedDate: date,
        ms: Date.now(),
      });
      setTitle("");
      setDescription("");
      setMsg({ ok: true, text: `সনদ তৈরি হয়েছে (${out.certNo})। নিচে প্রিভিউ দেখে প্রিন্ট করুন।` });
      await loadCerts();
    } catch {
      setMsg({ ok: false, text: "সনদ তৈরি হয়নি — ইন্টারনেট দেখে আবার চেষ্টা করুন।" });
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: Certificate) {
    if (!window.confirm(`${c.studentName}-এর "${c.title}" (${c.certNo}) সনদটা মুছে ফেলবেন? মুছলে যাচাই পেজেও আর পাওয়া যাবে না।`)) return;
    try {
      await deleteDoc(doc(getFirebaseDb(), "certificates", c.id));
      setCerts((prev) => (prev ? prev.filter((x) => x.id !== c.id) : prev));
      if (preview?.id === c.id) setPreview(null);
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
          <BadgeCheck size={18} className="text-gold-deep" /> নতুন সনদ দিন
        </h2>
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
                <option value="">— শিক্ষার্থী বাছুন ({options.length.toLocaleString("bn-BD")} জন) —</option>
                {options.map((s) => (
                  <option key={s.uid} value={s.uid}>{s.name}{s.className ? ` — ${s.className}` : ""}</option>
                ))}
              </select>
            </div>
            <input list="cert-titles" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="সনদের শিরোনাম (তালিকা থেকে বাছুন বা নিজে লিখুন)" className={`${inputCls} sm:col-span-2`} />
            <datalist id="cert-titles">
              {CERT_TITLE_PRESETS.map((t) => (<option key={t} value={t} />))}
            </datalist>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="অতিরিক্ত বিবরণ (ঐচ্ছিক — যেমন: ২০২৬ সালের Recovery Batch-এ সফলভাবে ...)" className={`${inputCls} sm:col-span-2`} />
            <label className="text-xs text-ink-soft">
              সনদের তারিখ
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} mt-1`} />
            </label>
            <div className="flex items-end">
              <button type="button" onClick={issue} disabled={saving} className="flex items-center gap-2 rounded-sm bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <BadgeCheck size={14} />} সনদ তৈরি করুন
              </button>
            </div>
          </div>
        )}
      </div>

      {preview && (
        <div className="rounded-sm border border-line bg-paper p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
            <p className="text-sm font-semibold text-ink">সনদ {preview.certNo}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => printIsolated("printable-certificate", { landscape: true })} className="flex items-center gap-1.5 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold-deep">
                <Printer size={14} /> প্রিন্ট করুন
              </button>
              <button type="button" onClick={() => setPreview(null)} className="flex items-center gap-1 rounded-sm border border-line px-3 py-2 text-sm text-ink-soft hover:border-ink">
                <X size={14} /> বন্ধ করুন
              </button>
            </div>
          </div>
          <div className="mt-3 overflow-x-auto"><CertificateCard cert={preview} /></div>
          <p className="mt-2 text-xs text-ink-soft/70 print:hidden">প্রিন্ট ডায়ালগে "Landscape" নিজে থেকেই বসে যায়; না হলে Layout → Landscape বেছে নিন।</p>
        </div>
      )}

      <div>
        <h2 className="font-display-bn text-lg text-ink">দেওয়া সনদের তালিকা</h2>
        {certs === null ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft"><Loader2 size={14} className="animate-spin" /> লোড হচ্ছে...</p>
        ) : certs.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft/60">এখনো কোনো সনদ দেওয়া হয়নি।</p>
        ) : (
          <ul className="mt-3 divide-y divide-line/60 rounded-sm border border-line bg-paper">
            {certs.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-ink">{c.studentName} <span className="font-normal text-ink-soft/60">{c.className}</span></p>
                  <p className="text-ink">{c.title}</p>
                  <p className="text-xs text-ink-soft/70">{c.certNo} · {c.issuedDate} · কোড {c.verifyCode}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPreview(c)} className="flex items-center gap-1 rounded-sm border border-ink px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink hover:text-paper">
                    <Printer size={12} /> দেখুন/প্রিন্ট
                  </button>
                  <button type="button" onClick={() => remove(c)} className="text-clay hover:text-clay/70" aria-label="মুছুন"><Trash2 size={15} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
