import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

// এই route শুধু লগইন করা অ্যাডমিনই কল করতে পারবেন (create-user route-এর
// মতোই ADMIN_EMAILS দিয়ে যাচাই হয়)। এটা এই ব্যাচের আগে জমা হওয়া পুরনো
// ভর্তি আবেদনগুলো ঠিক করে:
//   ১. যাদের shortId নেই (আগে দুই-ধাপে সেভ হতো বলে অনেক পুরনো
//      আবেদনে shortId বসতেই পারেনি) — সেটা বসিয়ে দেয়, এতে /payment
//      পেজে মোবাইল+আইডি দিয়ে খোঁজা যাবে
//   ২. যাদের কোনো স্টুডেন্ট অ্যাকাউন্টের সাথে যুক্ত (studentUid) নেই,
//      কিন্তু মোবাইল নম্বর মিলিয়ে ঠিক একটাই মিলে যাওয়া অ্যাকাউন্ট
//      পাওয়া যায় — সেটার সাথে যুক্ত করে দেয়
// এটা শুধু ফাঁকা থাকা ফিল্ড পূরণ করে, আগে থেকে থাকা কোনো তথ্য বদলায়
// না — তাই এটা একাধিকবার চালালেও কোনো ক্ষতি নেই।
export async function POST(req: NextRequest) {
  let adminAuth: Auth, db: Firestore;
  try {
    adminAuth = getAdminAuth();
    db = getAdminDb();
  } catch (err) {
    console.error("[backfill-admissions] Firebase Admin init failed:", err);
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
      console.error("[backfill-admissions] verifyIdToken failed:", err);
      return NextResponse.json({ error: "server_config_error" }, { status: 500 });
    }

    const allowedAdmins = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (!decoded.email || !allowedAdmins.includes(decoded.email.toLowerCase())) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const [admissionsSnap, studentsSnap] = await Promise.all([
      db.collection("admissions").get(),
      db.collection("users").where("role", "==", "student").get(),
    ]);

    const studentUidByIdentifier = new Map<string, string[]>();
    studentsSnap.docs.forEach((d) => {
      const identifier = (d.data().identifier as string) || "";
      if (!identifier) return;
      const list = studentUidByIdentifier.get(identifier) || [];
      list.push(d.id);
      studentUidByIdentifier.set(identifier, list);
    });

    let shortIdFixed = 0;
    let studentUidLinked = 0;
    let noMatch = 0;
    let alreadyOk = 0;

    const batches: FirebaseFirestore.WriteBatch[] = [];
    let currentBatch = db.batch();
    let opsInBatch = 0;

    function addOp(ref: FirebaseFirestore.DocumentReference, data: Record<string, unknown>) {
      currentBatch.update(ref, data);
      opsInBatch += 1;
      if (opsInBatch >= 400) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        opsInBatch = 0;
      }
    }

    admissionsSnap.docs.forEach((d) => {
      const data = d.data();
      const update: Record<string, unknown> = {};
      let touched = false;

      if (!data.shortId) {
        update.shortId = d.id.slice(0, 8).toUpperCase();
        shortIdFixed += 1;
        touched = true;
      }

      if (!data.studentUid) {
        const mobile = (data.mobile as string) || "";
        const candidates = mobile ? studentUidByIdentifier.get(mobile) || [] : [];
        if (candidates.length === 1) {
          update.studentUid = candidates[0];
          studentUidLinked += 1;
          touched = true;
        } else {
          noMatch += 1;
        }
      }

      if (touched) {
        addOp(d.ref, update);
      } else {
        alreadyOk += 1;
      }
    });

    if (opsInBatch > 0) {
      batches.push(currentBatch);
    }

    for (const batch of batches) {
      await batch.commit();
    }

    return NextResponse.json({
      totalAdmissions: admissionsSnap.size,
      shortIdFixed,
      studentUidLinked,
      noMatch,
      alreadyOk,
    });
  } catch (err) {
    console.error("[backfill-admissions] unexpected error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
