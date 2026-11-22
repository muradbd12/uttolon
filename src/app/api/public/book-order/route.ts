import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";

// Public book-shop order. The browser only sends WHAT is wanted (ids + quantities) and the
// customer's contact details; titles, prices and the total are all read from the database
// here, so nobody can order at a made-up price. The order gets a running number (BK-26-0001)
// and is saved for the admin to confirm; the customer then also sends it on WhatsApp.
type Item = { type: "book" | "bundle"; id: string; qty: number };
type Line = { type: "book" | "bundle"; id: string; title: string; price: number; qty: number; items?: string[] };

export async function POST(req: NextRequest) {
  let db;
  try {
    db = getAdminDb();
  } catch (err) {
    console.error("[book-order] Firebase Admin init failed:", err);
    return NextResponse.json({ error: "server_config_error" }, { status: 500 });
  }

  try {
    const body = await req.json();
    if (body.website) return NextResponse.json({ error: "invalid" }, { status: 400 }); // honeypot for bots

    const name = String(body.name || "").trim().slice(0, 80);
    const mobile = String(body.mobile || "").replace(/[^\d+]/g, "").slice(0, 16);
    const address = String(body.address || "").trim().slice(0, 300);
    const note = String(body.note || "").trim().slice(0, 300);
    const items: Item[] = Array.isArray(body.items) ? body.items.slice(0, 30) : [];

    if (name.length < 2 || mobile.replace(/\D/g, "").length < 10 || address.length < 5) {
      return NextResponse.json({ error: "missing_details" }, { status: 400 });
    }
    if (items.length === 0) return NextResponse.json({ error: "empty_cart" }, { status: 400 });

    const lines: Line[] = [];
    for (const it of items) {
      const qty = Math.max(1, Math.min(Math.round(Number(it.qty) || 1), 20));
      if (it.type === "book") {
        const snap = await db.collection("books").doc(String(it.id)).get();
        const b = snap.exists ? snap.data() : null;
        if (!b || b.inStock === false) {
          return NextResponse.json({ error: "item_unavailable", title: (b?.title as string) || "একটা বই" }, { status: 409 });
        }
        lines.push({ type: "book", id: snap.id, title: String(b.title || ""), price: Number(b.price) || 0, qty });
      } else if (it.type === "bundle") {
        const snap = await db.collection("bookBundles").doc(String(it.id)).get();
        const b = snap.exists ? snap.data() : null;
        if (!b || b.active === false) {
          return NextResponse.json({ error: "item_unavailable", title: (b?.title as string) || "একটা বুক সেট" }, { status: 409 });
        }
        const ids: string[] = Array.isArray(b.bookIds) ? b.bookIds.slice(0, 30) : [];
        const titles = (await Promise.all(ids.map((id) => db.collection("books").doc(String(id)).get()))).map((s) => (s.exists ? String(s.data()?.title || "") : "")).filter(Boolean);
        lines.push({ type: "bundle", id: snap.id, title: String(b.title || ""), price: Number(b.price) || 0, qty, items: titles });
      }
    }
    if (lines.length === 0) return NextResponse.json({ error: "empty_cart" }, { status: 400 });

    const total = lines.reduce((s, l) => s + l.price * l.qty, 0);

    const year = new Date(Date.now() + 6 * 3600 * 1000).getUTCFullYear();
    const counterRef = db.collection("counters").doc(`bookOrders-${year}`);
    const n = await db.runTransaction(async (tx) => {
      const snap = await tx.get(counterRef);
      const next = (snap.exists ? Number(snap.data()?.next) || 0 : 0) + 1;
      tx.set(counterRef, { next }, { merge: true });
      return next;
    });
    const orderNo = `BK-${String(year).slice(-2)}-${String(n).padStart(4, "0")}`;

    await db.collection("bookOrders").add({
      orderNo,
      name,
      mobile,
      address,
      note,
      lines,
      total,
      status: "new",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ orderNo, total, lines });
  } catch (err) {
    console.error("[book-order] unexpected error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
