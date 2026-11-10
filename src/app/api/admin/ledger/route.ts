import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

// Admin-only payment ledger. Uses the Admin SDK so no extra Firestore rules or
// indexes are needed. Same admin check (ADMIN_EMAILS) as the other admin routes.
const MAX_ROWS = 500;

type Receipt = {
  title?: string;
  breakdown?: { label: string; amount: number }[];
  idLabel: string;
  applicationId: string;
  className: string;
  group: string;
  program: string;
  mobile: string;
  nameEn: string;
  voucherId: string;
  purpose: string;
  totalFee: number;
  paidUpTo: number;
  dueAfter: number;
};

type Row = {
  id: string;
  ts: number;
  student: string;
  kind: "admission" | "monthly";
  detail: string;
  method: string;
  ref: string;
  amount: number;
  receipt: Receipt;
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

    const [admissionsSnap, paymentsSnap, feesSnap, studentsSnap] = await Promise.all([
      db.collection("admissions").get(),
      db.collectionGroup("payments").get(),
      db.collection("fees").where("amountPaid", ">", 0).get(),
      db.collection("users").where("role", "==", "student").get(),
    ]);

    const admissionInfo = new Map<
      string,
      {
        name: string;
        nameEn: string;
        shortId: string;
        className: string;
        group: string;
        program: string;
        mobile: string;
        totalFee: number;
      }
    >();
    admissionsSnap.docs.forEach((d) => {
      const data = d.data();
      admissionInfo.set(d.id, {
        name: (data.studentNameBn as string) || (data.studentNameEn as string) || "নাম নেই",
        nameEn: (data.studentNameEn as string) || "",
        shortId: (data.shortId as string) || d.id.slice(0, 8).toUpperCase(),
        className: (data.className as string) || "",
        group: (data.group as string) || "",
        program: (data.program as string) || "",
        mobile: (data.mobile as string) || "",
        totalFee: Number(data.totalFee) || 0,
      });
    });

    const studentInfo = new Map<string, { className: string; studentId: string; identifier: string }>();
    studentsSnap.docs.forEach((d) => {
      const data = d.data();
      studentInfo.set(d.id, {
        className: (data.className as string) || "",
        studentId: (data.studentId as string) || "",
        identifier: (data.identifier as string) || "",
      });
    });

    // Admission payments: sort each admission's payments by time so we can number
    // them 1, 2, 3... and work out the running total after each one.
    const byAdmission = new Map<string, { id: string; ts: number; data: FirebaseFirestore.DocumentData }[]>();
    paymentsSnap.docs.forEach((d) => {
      const admissionId = d.ref.parent.parent?.id || "";
      const list = byAdmission.get(admissionId) || [];
      list.push({ id: d.id, ts: toMillis(d.data().paidAt), data: d.data() });
      byAdmission.set(admissionId, list);
    });

    const rows: Row[] = [];

    byAdmission.forEach((list, admissionId) => {
      list.sort((x, y) => x.ts - y.ts);
      const info = admissionInfo.get(admissionId);
      let running = 0;
      list.forEach((p, i) => {
        const amount = Number(p.data.amount) || 0;
        running += amount;
        const fee = info?.totalFee || 0;
        rows.push({
          id: p.id,
          ts: p.ts,
          student: info?.name || "অজানা আবেদন",
          kind: "admission",
          detail: (p.data.monthOrPurpose as string) || "ভর্তি ফি",
          method: (p.data.method as string) || "",
          ref: info?.shortId || "",
          amount,
          receipt: {
            idLabel: "আবেদন আইডি",
            applicationId: info?.shortId || "",
            className: info?.className || "",
            group: info?.group || "",
            program: info?.program || "",
            mobile: info?.mobile || "",
            nameEn: info?.nameEn || "",
            voucherId: `${(info?.shortId || admissionId).slice(0, 6).toUpperCase()}-V${i + 1}`,
            purpose: (p.data.monthOrPurpose as string) || "ভর্তি ফি",
            totalFee: fee,
            paidUpTo: running,
            dueAfter: Math.max(fee - running, 0),
          },
        });
      });
    });

    feesSnap.docs.forEach((d) => {
      const data = d.data();
      const st = studentInfo.get((data.studentUid as string) || "");
      const payable = Math.max((Number(data.amountDue) || 0) - (Number(data.discount) || 0) + (Number(data.fine) || 0), 0);
      const paid = Number(data.amountPaid) || 0;
      const month = (data.month as string) || "";
      const method = (data.paymentMethod as string) || "";
      const trx = (data.transactionNumber as string) || "";
      rows.push({
        id: d.id,
        ts: toMillis(data.updatedAt),
        student: (data.studentName as string) || "নাম নেই",
        kind: "monthly",
        detail: month,
        method,
        ref: trx,
        amount: paid,
        receipt: {
          title: "মাসিক ফি রশিদ",
          breakdown: [
            { label: "মাসিক ফি", amount: Number(data.amountDue) || 0 },
            ...(Number(data.discount) ? [{ label: "ছাড়", amount: -(Number(data.discount) || 0) }] : []),
            ...(Number(data.fine) ? [{ label: "জরিমানা", amount: Number(data.fine) || 0 }] : []),
            { label: "মোট প্রদেয়", amount: payable },
          ],
          idLabel: st?.studentId ? "স্টুডেন্ট আইডি" : "লগইন আইডি",
          applicationId: st?.studentId || st?.identifier || "",
          className: st?.className || "",
          group: "",
          program: "",
          mobile: "",
          nameEn: "",
          voucherId: `${st?.studentId || ((data.studentUid as string) || "FEE").slice(0, 6).toUpperCase()}-${month}`,
          purpose: `মাসিক ফি — ${month}`,
          totalFee: payable,
          paidUpTo: paid,
          dueAfter: Math.max(payable - paid, 0),
        },
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
