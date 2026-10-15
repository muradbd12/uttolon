import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { allocateStudentId } from "@/lib/studentId";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

// One-time/repeatable admin tool: gives a Student ID to every existing student
// account that does not have one yet. Never changes an ID that already exists.
export async function POST(req: NextRequest) {
  let adminAuth: Auth, db: Firestore;
  try {
    adminAuth = getAdminAuth();
    db = getAdminDb();
  } catch (err) {
    console.error("[assign-student-ids] Firebase Admin init failed:", err);
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

    const snap = await db.collection("users").where("role", "==", "student").get();
    const missing = snap.docs
      .filter((d) => !d.data().studentId)
      .sort((a, b) => String(a.data().createdAt || "9999").localeCompare(String(b.data().createdAt || "9999")));

    let assigned = 0;
    for (const d of missing) {
      const created = String(d.data().createdAt || "");
      const yearFromDoc = /^\d{4}/.test(created) ? Number(created.slice(0, 4)) : new Date().getFullYear();
      const studentId = await allocateStudentId(db, yearFromDoc);
      await d.ref.update({ studentId });
      assigned += 1;
    }

    return NextResponse.json({
      totalStudents: snap.size,
      assigned,
      alreadyHad: snap.size - missing.length,
    });
  } catch (err) {
    console.error("[assign-student-ids] unexpected error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
