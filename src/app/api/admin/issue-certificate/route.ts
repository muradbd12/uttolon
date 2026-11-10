import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { allocateCertificateNo } from "@/lib/studentId";

// Admin-only: issues a certificate to a student. The server hands out the running
// certificate number and a random verification code (so the public verify page can't be
// used to walk through other students' certificates one number at a time).
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no look-alikes (0/O, 1/I)

function makeCode() {
  const bytes = randomBytes(8);
  return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join("");
}

export async function POST(req: NextRequest) {
  let auth, db;
  try {
    auth = getAdminAuth();
    db = getAdminDb();
  } catch (err) {
    console.error("[issue-certificate] Firebase Admin init failed:", err);
    return NextResponse.json({ error: "server_config_error" }, { status: 500 });
  }

  try {
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!idToken) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    let decoded;
    try {
      decoded = await auth.verifyIdToken(idToken);
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

    const body = await req.json();
    const studentUid = String(body.studentUid || "");
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim().slice(0, 400);
    const dateIn = String(body.issuedDate || "");
    const issuedDate = /^\d{4}-\d{2}-\d{2}$/.test(dateIn) ? dateIn : new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 10);
    if (!studentUid || !title) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

    const userSnap = await db.collection("users").doc(studentUid).get();
    const user = userSnap.exists ? userSnap.data() : null;
    if (!user || user.role !== "student") return NextResponse.json({ error: "student_not_found" }, { status: 404 });

    const year = Number(issuedDate.slice(0, 4)) || new Date().getFullYear();
    const certNo = await allocateCertificateNo(db, year);

    let verifyCode = makeCode();
    for (let i = 0; i < 5; i++) {
      const clash = await db.collection("certificates").where("verifyCode", "==", verifyCode).limit(1).get();
      if (clash.empty) break;
      verifyCode = makeCode();
    }

    const ref = db.collection("certificates").doc();
    await ref.set({
      certNo,
      verifyCode,
      studentUid,
      studentName: (user.name as string) || "",
      className: (user.className as string) || "",
      studentId: (user.studentId as string) || "",
      title,
      description,
      issuedDate,
      issuedBy: decoded.uid,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: ref.id, certNo, verifyCode });
  } catch (err) {
    console.error("[issue-certificate] unexpected error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
