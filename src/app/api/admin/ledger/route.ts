import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

// Admin-only payment ledger. Uses the Admin SDK so no extra Firestore rules or
// indexes are needed. Same admin check (ADMIN_EMAILS) as the other admin routes.
const MAX_ROWS = 500;

type Row = {
  id: string;
  ts: number;
  student: string;
  kind: "admission" | "monthly";
  detail: string;
  method: string;
  ref: string;
  amount: number;
};

function toMillis(v: unknown): number {
  const t = v as { toMillis?: () => number } | null | undefined;
  return t && typeof t.toMillis === "function" ? t.toMillis() : 0;
}

export async function GET(req: NextRequest) {
  let adminAuth: Auth, db: Firestore;
  try {
    adminAuth = getAdminAuth();
    db = getAdminDb();
  } catch (err) {
    console.error("[ledger] Firebase Admin init failed:", err);
    return NextResponse.json({ error: "server_config_error" }, { status: 500 });
  }

  try {
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!idToken) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch (err) {
      console.error("[ledger] verifyIdToken failed:", err);
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const allowedAdmins = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (!decoded.email || !allowedAdmins.includes(decoded.email.toLowerCase())) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const [admissionsSnap, paymentsSnap, feesSnap] = await Promise.all([
      db.collection("admissions").get(),
      db.collectionGroup("payments").get(),
      db.collection("fees").where("amountPaid", ">", 0).get(),
    ]);

    const admissionInfo = new Map<string, { name: string; shortId: string }>();
    admissionsSnap.docs.forEach((d) => {
      const data = d.data();
      admissionInfo.set(d.id, {
        name: (data.studentNameBn as string) || (data.studentNameEn as string) || "নাম নেই",
        shortId: (data.shortId as string) || d.id.slice(0, 8).toUpperCase(),
      });
    });

    const rows: Row[] = [];

    paymentsSnap.docs.forEach((d) => {
      const admissionId = d.ref.parent.parent?.id || "";
      const info = admissionInfo.get(admissionId);
      const data = d.data();
      rows.push({
        id: d.id,
        ts: toMillis(data.paidAt),
        student: info?.name || "অজানা আবেদন",
        kind: "admission",
        detail: (data.monthOrPurpose as string) || "ভর্তি ফি",
        method: (data.method as string) || "",
        ref: info?.shortId || "",
        amount: Number(data.amount) || 0,
      });
    });

    feesSnap.docs.forEach((d) => {
      const data = d.data();
      rows.push({
        id: d.id,
        ts: toMillis(data.updatedAt),
        student: (data.studentName as string) || "নাম নেই",
        kind: "monthly",
        detail: (data.month as string) || "",
        method: (data.paymentMethod as string) || "",
        ref: (data.transactionNumber as string) || "",
        amount: Number(data.amountPaid) || 0,
      });
    });

    rows.sort((a, b) => b.ts - a.ts);

    const totalAll = rows.reduce((s, r) => s + r.amount, 0);
    const totalAdmission = rows.filter((r) => r.kind === "admission").reduce((s, r) => s + r.amount, 0);
    const totalMonthly = totalAll - totalAdmission;

    return NextResponse.json({
      rows: rows.slice(0, MAX_ROWS),
      truncated: rows.length > MAX_ROWS,
      count: rows.length,
      totals: { all: totalAll, admission: totalAdmission, monthly: totalMonthly },
    });
  } catch (err) {
    console.error("[ledger] unexpected error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
