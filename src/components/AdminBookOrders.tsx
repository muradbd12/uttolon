"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { WHATSAPP_NUMBER } from "@/lib/books";
import { AlertCircle, Loader2, MessageCircle, Phone, Trash2 } from "lucide-react";

type Status = "new" | "confirmed" | "delivered" | "cancelled";
type Line = { type: "book" | "bundle"; title: string; price: number; qty: number; items?: string[] };
type Order = {
  id: string;
  orderNo: string;
  name: string;
  mobile: string;
  address: string;
  note: string;
  lines: Line[];
  total: number;
  status: Status;
  ms: number;
};

const bn = (n: number) => n.toLocaleString("bn-BD");
const STATUS: Record<Status, { label: string; bg: string; fg: string }> = {
  new: { label: "নতুন", bg: "#fef3c7", fg: "#b45309" },
  confirmed: { label: "নিশ্চিত", bg: "#dbeafe", fg: "#1d4ed8" },
  delivered: { label: "ডেলিভারি হয়েছে", bg: "#d1fae5", fg: "#047857" },
  cancelled: { label: "বাতিল", bg: "#ffe4e6", fg: "#be123c" },
};

function waLink(mobile: string, text: string) {
  let n = mobile.replace(/\D/g, "");
  if (n.startsWith("01")) n = `88${n}`;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

export default function AdminBookOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<"all" | Status>("new");

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(getFirebaseDb(), "bookOrders"), orderBy("createdAt", "desc"), limit(200)));
        setOrders(
          snap.docs.map((d) => {
            const x = d.data();
            return {
              id: d.id,
              orderNo: (x.orderNo as string) || "",
              name: (x.name as string) || "",
              mobile: (x.mobile as string) || "",
              address: (x.address as string) || "",
              note: (x.note as string) || "",
              lines: (x.lines as Line[]) || [],
              total: Number(x.total) || 0,
              status: (x.status as Status) in STATUS ? (x.status as Status) : "new",
              ms: x.createdAt?.toMillis ? (x.createdAt.toMillis() as number) : 0,
            };
          })
        );
      } catch {
        setError(true);
      }
    })();
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders?.length || 0 };
    (orders || []).forEach((o) => (c[o.status] = (c[o.status] || 0) + 1));
    return c;
  }, [orders]);

  async function setStatus(o: Order, status: Status) {
    try {
      await updateDoc(doc(getFirebaseDb(), "bookOrders", o.id), { status });
      setOrders((prev) => (prev ? prev.map((x) => (x.id === o.id ? { ...x, status } : x)) : prev));
    } catch {
      window.alert("বদলানো যায়নি — Firestore Rules Publish করা আছে কিনা দেখুন।");
    }
  }

  async function remove(o: Order) {
    if (!window.confirm(`অর্ডার ${o.orderNo} (${o.name}) মুছে ফেলবেন?`)) return;
    try {
      await deleteDoc(doc(getFirebaseDb(), "bookOrders", o.id));
      setOrders((prev) => (prev ? prev.filter((x) => x.id !== o.id) : prev));
    } catch {
      window.alert("মোছা যায়নি।");
    }
  }

  if (error)
    return (
      <p className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay">
        <AlertCircle size={15} /> অর্ডার আনা যায়নি — Firestore Rules (bookOrders-এর নিয়মসহ) Publish করা আছে কিনা দেখুন।
      </p>
    );
  if (!orders)
    return (
      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <Loader2 size={15} className="animate-spin" /> লোড হচ্ছে...
      </p>
    );

  const shown = orders.filter((o) => filter === "all" || o.status === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(["new", "confirmed", "delivered", "cancelled", "all"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${filter === k ? "border-ink bg-ink text-paper" : "border-line bg-white text-ink-soft hover:border-ink"}`}
          >
            {k === "all" ? "সব" : STATUS[k].label} ({bn(counts[k] || 0)})
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {shown.length === 0 && <p className="py-10 text-center text-sm text-ink-soft/60">কোনো অর্ডার নেই।</p>}
        {shown.map((o) => (
          <div key={o.id} className="rounded-sm border border-line bg-paper p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[15px] font-bold text-ink">
                  {o.orderNo} <span className="ml-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: STATUS[o.status].bg, color: STATUS[o.status].fg }}>{STATUS[o.status].label}</span>
                </p>
                <p className="text-xs text-ink-soft/70">
                  {o.ms ? new Date(o.ms).toLocaleString("bn-BD", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : ""}
                </p>
              </div>
              <p className="text-lg font-bold text-ink">{bn(o.total)} টাকা</p>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="font-semibold text-ink">{o.name}</p>
                <p className="mt-0.5 text-ink-soft">{o.mobile}</p>
                <p className="mt-0.5 whitespace-pre-wrap text-ink-soft">{o.address}</p>
                {o.note && <p className="mt-1 text-xs text-ink-soft/80">মন্তব্য: {o.note}</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  <a href={`tel:${o.mobile}`} className="flex items-center gap-1 rounded-sm border border-line px-2.5 py-1 text-xs text-ink hover:border-ink"><Phone size={12} /> কল</a>
                  <a
                    href={waLink(o.mobile, `আসসালামু আলাইকুম ${o.name}, উত্তোলন থেকে আপনার বইয়ের অর্ডার (${o.orderNo}) নিয়ে যোগাযোগ করছি।`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-sm border border-teal-deep px-2.5 py-1 text-xs text-teal-deep hover:bg-teal-soft"
                  >
                    <MessageCircle size={12} /> WhatsApp
                  </a>
                </div>
              </div>
              <ul className="space-y-1 rounded-sm bg-paper-raised p-3 text-sm">
                {o.lines.map((l, i) => (
                  <li key={i} className="text-ink">
                    {l.type === "bundle" && <span className="mr-1 rounded-full bg-gold-soft px-1.5 py-0.5 text-[10px] font-semibold text-gold-deep">সেট</span>}
                    {l.title} × {bn(l.qty)} = <strong>{bn(l.price * l.qty)} টাকা</strong>
                    {l.items && l.items.length > 0 && <span className="block text-[11px] text-ink-soft/70">সেটে আছে: {l.items.join(", ")}</span>}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <span className="text-xs text-ink-soft">অবস্থা বদলান:</span>
              {(["new", "confirmed", "delivered", "cancelled"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  disabled={o.status === k}
                  onClick={() => setStatus(o, k)}
                  className="rounded-sm border border-line px-2.5 py-1 text-xs text-ink hover:border-ink disabled:border-ink disabled:bg-ink disabled:text-paper"
                >
                  {STATUS[k].label}
                </button>
              ))}
              <button type="button" onClick={() => remove(o)} className="ml-auto text-clay hover:text-clay/70" aria-label="মুছুন"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
