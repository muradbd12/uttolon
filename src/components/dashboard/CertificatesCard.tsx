"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { BadgeCheck, Printer, X } from "lucide-react";
import { getFirebaseDb } from "@/lib/firebase";
import { mapCertificate, type Certificate } from "@/lib/certificates";
import { printIsolated } from "@/lib/printReceipt";
import CertificateCard from "@/components/CertificateCard";

// Student / guardian dashboard: certificates issued to this student, with view + print.
// Hidden completely when the student has none.
export default function CertificatesCard({ studentUid }: { studentUid: string | null | undefined }) {
  const [certs, setCerts] = useState<Certificate[] | null>(null);
  const [open, setOpen] = useState<Certificate | null>(null);

  useEffect(() => {
    setOpen(null);
    if (!studentUid) {
      setCerts(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(query(collection(getFirebaseDb(), "certificates"), where("studentUid", "==", studentUid)));
        if (cancelled) return;
        setCerts(snap.docs.map((d) => mapCertificate(d.id, d.data())).sort((a, b) => b.issuedDate.localeCompare(a.issuedDate) || b.ms - a.ms));
      } catch {
        if (!cancelled) setCerts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentUid]);

  if (!certs || certs.length === 0) return null;

  return (
    <div className="rounded-sm border border-line bg-paper p-6">
      <div className="flex items-center gap-2">
        <BadgeCheck size={17} style={{ color: "#c9932e" }} />
        <h2 className="font-display-bn text-lg text-ink">সনদপত্র</h2>
      </div>
      <ul className="mt-3 divide-y divide-line/60">
        {certs.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
            <div>
              <p className="font-medium text-ink">{c.title}</p>
              <p className="text-xs text-ink-soft/70">{c.certNo} · {c.issuedDate}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(open?.id === c.id ? null : c)}
              className="flex items-center gap-1 rounded-sm border border-ink px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink hover:text-paper"
            >
              <Printer size={12} /> {open?.id === c.id ? "বন্ধ করুন" : "দেখুন / প্রিন্ট"}
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <div className="mt-4 border-t border-line pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
            <p className="text-sm font-semibold text-ink">{open.title}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => printIsolated("printable-certificate", { landscape: true })}
                className="flex items-center gap-1.5 rounded-sm bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-gold-deep"
              >
                <Printer size={13} /> প্রিন্ট করুন
              </button>
              <button type="button" onClick={() => setOpen(null)} className="flex items-center gap-1 rounded-sm border border-line px-2.5 py-1.5 text-xs text-ink-soft hover:border-ink">
                <X size={13} /> বন্ধ
              </button>
            </div>
          </div>
          <div className="mt-3 overflow-x-auto">
            <CertificateCard cert={open} />
          </div>
        </div>
      )}
    </div>
  );
}
