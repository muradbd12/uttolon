import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

// Admin-only income report (totals by day / month / method / program / class).
// Runs on the server with the Admin SDK so the numbers always cover every payment,
// not just the latest few hundred. Dates are grouped in Bangladesh time (UTC+6).
const BD_OFFSET_MS = 6 * 3600 * 1000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function bdDate(ms: number) {
  return new Date(ms + BD_OFFSET_MS).toISOString().slice(0, 10);
}
function toMillis(v: unknown): number {
  const t = v as { toMillis?: () => number } | null | undefined;
  return t && typeof t.toMillis === "function" ? t.toMillis() : 0;
}

type Row = { ts: number; amount: number; method: string; kind: "admission" | "monthly"; program: string; className: string };

function add(map: Map<string, { amount: number; count: number }>, key: string, amount: number) {
  const cur = map.get(key) || { amount: 0, count: 0 };
  cur.amount += amount;
  cur.count += 1;
  map.set(key, cur);
}
function list(map: Map<string, { amount: number; count: number }>) {
  return Array.from(map, ([label, v]) => ({ label, amount: v.amount, count: v.count })).sort((a, b) => b.amount - a.amount);
}

export async function GET(req: NextRequest) {
  let adminAuth: Auth, db: Firestore;
  try {
    adminAuth = getAdminAuth();
    db = getAdminDb();
  } catch (err) {
    console.error("[income-report] Firebase Admin init failed:", err);
    return NextResponse.json({ error: "server_config_error" }, { status: 500 });
  }

  try {
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!idToken) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const allowedAdmins = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (!decoded.email || !allowedAdmins.includes(decoded.email.toLowerCase())) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const fromParam = req.nextUrl.searchParams.get("from") || "";
    const toParam = req.nextUrl.searchParams.get("to") || "";
    const from = DATE_RE.test(fromParam) ? fromParam : "";
    const to = DATE_RE.test(toParam) ? toParam : "";

    const [admissionsSnap, paymentsSnap, feesSnap, studentsSnap] = await Promise.all([
      db.collection("admissions").get(),
      db.collectionGroup("payments").get(),
      db.collection("fees").where("amountPaid", ">", 0).get(),
      db.collection("users").where("role", "==", "student").get(),
    ]);

    const admissionInfo = new Map<string, { program: string; className: string }>();
    admissionsSnap.docs.forEach((d) => {
      const x = d.data();
      admissionInfo.set(d.id, { program: (x.program as string) || "", className: (x.className as string) || "" });
    });
    const studentClass = new Map<string, string>();
    studentsSnap.docs.forEach((d) => studentClass.set(d.id, (d.data().className as string) || ""));

    const rows: Row[] = [];
    paymentsSnap.docs.forEach((d) => {
      const info = admissionInfo.get(d.ref.parent.parent?.id || "");
      const x = d.data();
      rows.push({
        ts: toMillis(x.paidAt),
        amount: Number(x.amount) || 0,
        method: ((x.method as string) || "").trim(),
        kind: "admission",
        program: info?.program || "",
        className: info?.className || "",
      });
    });
    feesSnap.docs.forEach((d) => {
      const x = d.data();
      rows.push({
        ts: toMillis(x.updatedAt),
        amount: Number(x.amountPaid) || 0,
        method: ((x.paymentMethod as string) || "").trim(),
        kind: "monthly",
        program: "",
        className: studentClass.get((x.studentUid as string) || "") || "",
      });
    });

    const ranged = from || to;
    const inRange = rows.filter((r) => {
      if (!ranged) return true;
      if (!r.ts) return false;
      const day = bdDate(r.ts);
      if (from && day < from) return false;
      if (to && day > to) return false;
      return true;
    });

    const byDay = new Map<string, { amount: number; count: number }>();
    const byMonth = new Map<string, { amount: number; count: number }>();
    const byMethod = new Map<string, { amount: number; count: number }>();
    const byProgram = new Map<string, { amount: number; count: number }>();
    const byClass = new Map<string, { amount: number; count: number }>();
    let admission = 0;
    let monthly = 0;

    inRange.forEach((r) => {
      if (r.kind === "admission") admission += r.amount;
      else monthly += r.amount;
      if (r.ts) {
        const day = bdDate(r.ts);
        add(byDay, day, r.amount);
        add(byMonth, day.slice(0, 7), r.amount);
      }
      add(byMethod, r.method || "উল্লেখ নেই", r.amount);
      add(byProgram, r.kind === "monthly" ? "মাসিক ফি (সব প্রোগ্রাম)" : r.program || "প্রোগ্রাম উল্লেখ নেই", r.amount);
      add(byClass, r.className || "ক্লাস উল্লেখ নেই", r.amount);
    });

    const asc = (m: Map<string, { amount: number; count: number }>) =>
      list(m).sort((a, b) => a.label.localeCompare(b.label));

    return NextResponse.json({
      range: { from, to },
      totals: { all: admission + monthly, admission, monthly, count: inRange.length },
      byDay: asc(byDay).map((x) => ({ date: x.label, amount: x.amount })),
      byMonth: asc(byMonth).map((x) => ({ month: x.label, amount: x.amount })),
      byMethod: list(byMethod),
      byProgram: list(byProgram),
      byClass: list(byClass),
    });
  } catch (err) {
    console.error("[income-report] unexpected error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
