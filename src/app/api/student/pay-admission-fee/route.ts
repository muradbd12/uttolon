import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// লগইন করা Student বা তার Guardian ড্যাশবোর্ড থেকে ভর্তি ফি বকেয়া
// পরিশোধ করার জন্য এই route ব্যবহার হয়। মোবাইল/আবেদন আইডি লাগে না —
// Firebase ID token যাচাই করেই কে কার ফি পরিশোধ করার অনুমতি রাখেন
// তা ঠিক করা হয় (নিজে student হলে নিজের, guardian হলে তার
// linkedStudentUids-এর মধ্যে থাকা কারো)।
export async function POST(req: NextRequest) {
  let auth, db;
  try {
    auth = getAdminAuth();
    db = getAdminDb();
  } catch (err) {
    console.error("[pay-admission-fee] Firebase Admin init failed:", err);
    return NextResponse.json({ error: "server_config_error" }, { status: 500 });
  }

  try {
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!idToken) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const decoded = await auth.verifyIdToken(idToken);

    const body = await req.json();
    const targetStudentUid = String(body.studentUid || decoded.uid);
    const method = String(body.method || "").trim() || "ক্যাশ (হাতে হাতে)";
    const requestedAmount = Math.round(Number(body.amount) || 0);

    if (requestedAmount <= 0) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const callerDoc = await db.collection("users").doc(decoded.uid).get();
    const caller = callerDoc.exists ? callerDoc.data() : null;

    const isSelf = decoded.uid === targetStudentUid;
    const linked: string[] = caller?.linkedStudentUids || (caller?.linkedStudentUid ? [caller.linkedStudentUid] : []);
    const isGuardian = caller?.role === "guardian" && linked.includes(targetStudentUid);
    const isAdmin = caller?.role === "admin";

    if (!isSelf && !isGuardian && !isAdmin) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const snap = await db
      .collection("admissions")
      .where("studentUid", "==", targetStudentUid)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const ref = snap.docs[0].ref;

    const result = await db.runTransaction(async (tx) => {
      const docSnap = await tx.get(ref);
      if (!docSnap.exists) {
        throw new Error("not_found");
      }
      const data = docSnap.data() as Record<string, unknown>;
      const fee = Number(data.totalFee) || 0;
      const alreadyPaid = Number(data.totalPaid) || 0;
      const due = Math.max(fee - alreadyPaid, 0);
      const amount = Math.min(requestedAmount, due);
      if (amount <= 0) {
        throw new Error("nothing_due");
      }
      const newTotalPaid = alreadyPaid + amount;
      const newDue = fee - newTotalPaid;

      const paymentRef = ref.collection("payments").doc();
      tx.set(paymentRef, {
        amount,
        method,
        monthOrPurpose: "ভর্তি ফি (কিস্তি)",
        paidAt: FieldValue.serverTimestamp(),
      });
      tx.update(ref, { totalPaid: newTotalPaid, due: newDue });

      return {
        amount,
        totalFee: fee,
        totalPaid: newTotalPaid,
        due: newDue,
        studentNameBn: data.studentNameBn ?? null,
        studentNameEn: data.studentNameEn ?? null,
        className: data.className ?? null,
        group: data.group ?? null,
        program: data.program ?? null,
        mobile: data.mobile ?? null,
        shortId: data.shortId ?? null,
      };
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "not_found") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (message === "nothing_due") {
      return NextResponse.json({ error: "nothing_due" }, { status: 400 });
    }
    console.error("[pay-admission-fee] unexpected error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
