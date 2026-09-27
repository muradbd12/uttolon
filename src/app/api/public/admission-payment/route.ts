import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

function normalizeName(s: unknown) {
  return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

// এই API route পাবলিক (লগইন ছাড়া) ব্যবহারকারীদের জন্য — ভর্তি ফি
// খুঁজে দেখা ও পরিশোধ করার কাজ এখান দিয়েই হয়। এটা Firebase Admin SDK
// ব্যবহার করে, যেটা Security Rules-এর আওতার বাইরে থেকে কাজ করে —
// তাই ক্লায়েন্ট (ব্রাউজার) সাইডে admissions কালেকশনের read/update
// অনুমতি পাবলিকের জন্য খুলে দেওয়ার দরকার নেই। আবেদন আইডি (shortId)
// এর সাথে মোবাইল নম্বর অথবা শিক্ষার্থীর নাম — যেকোনো একটা মিলিয়ে
// যাচাই করেই শুধু তথ্য দেখানো/পেমেন্ট নেওয়া হয়।
export async function POST(req: NextRequest) {
  let db;
  try {
    db = getAdminDb();
  } catch (err) {
    console.error("[admission-payment] Firebase Admin init failed:", err);
    return NextResponse.json({ error: "server_config_error" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const action = body?.action as string;

    // ===== ধাপ ১: আবেদন আইডি + (মোবাইল অথবা নাম) দিয়ে খুঁজে বের করা =====
    if (action === "lookup") {
      const code = String(body.code || "").trim().toUpperCase();
      const mobile = body.mobile ? String(body.mobile).trim() : "";
      const name = body.name ? String(body.name).trim() : "";
      if (!code || (!mobile && !name)) {
        return NextResponse.json({ error: "missing_fields" }, { status: 400 });
      }

      const snap = await db.collection("admissions").where("shortId", "==", code).limit(1).get();
      if (snap.empty) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }

      const d = snap.docs[0];
      const data = d.data();
      const matchesMobile = mobile && data.mobile === mobile;
      const matchesName =
        name &&
        (normalizeName(data.studentNameBn) === normalizeName(name) ||
          normalizeName(data.studentNameEn) === normalizeName(name));

      if (!matchesMobile && !matchesName) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }

      return NextResponse.json({
        id: d.id,
        studentNameBn: data.studentNameBn ?? null,
        studentNameEn: data.studentNameEn ?? null,
        mobile: data.mobile ?? null,
        className: data.className ?? null,
        group: data.group ?? null,
        program: data.program ?? null,
        totalFee: data.totalFee ?? 0,
        totalPaid: data.totalPaid ?? 0,
        due: data.due ?? 0,
      });
    }

    // ===== ধাপ ২: পেমেন্ট সেভ করা =====
    if (action === "pay") {
      const admissionId = String(body.admissionId || "");
      const code = String(body.code || "").trim().toUpperCase();
      const mobile = body.mobile ? String(body.mobile).trim() : "";
      const name = body.name ? String(body.name).trim() : "";
      const method = String(body.method || "").trim() || "ক্যাশ (হাতে হাতে)";
      const requestedAmount = Math.round(Number(body.amount) || 0);

      if (!admissionId || !code || (!mobile && !name) || requestedAmount <= 0) {
        return NextResponse.json({ error: "missing_fields" }, { status: 400 });
      }

      const ref = db.collection("admissions").doc(admissionId);

      const result = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) {
          throw new Error("not_found");
        }
        const data = snap.data() as Record<string, unknown>;

        // আইডি ও (মোবাইল অথবা নাম) মিলতে হবে — যাতে কেউ অন্য কারো
        // আবেদনের ডকুমেন্ট আইডি অনুমান করে তার নামে টাকা "পরিশোধ"
        // দেখাতে না পারে।
        const matchesMobile = mobile && data.mobile === mobile;
        const matchesName =
          name &&
          (normalizeName(data.studentNameBn) === normalizeName(name) ||
            normalizeName(data.studentNameEn) === normalizeName(name));
        if (data.shortId !== code || (!matchesMobile && !matchesName)) {
          throw new Error("not_found");
        }

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
        };
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "not_found") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (message === "nothing_due") {
      return NextResponse.json({ error: "nothing_due" }, { status: 400 });
    }
    console.error("[admission-payment] unexpected error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
