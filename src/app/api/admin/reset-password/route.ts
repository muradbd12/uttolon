import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

// এই API route শুধু Admin (Super বা Academic, দুজনই) কল করতে পারবেন —
// শুধু student/guardian/teacher-এর পাসওয়ার্ড রিসেট করা যাবে, অন্য
// কোনো Admin-এর পাসওয়ার্ড এখান থেকে বদলানো যাবে না।
export async function POST(req: NextRequest) {
  let adminAuth;
  try {
    adminAuth = getAdminAuth();
  } catch (err) {
    console.error("[reset-password] Firebase Admin init failed:", err);
    const details = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "server_config_error", details }, { status: 500 });
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
      console.error("[reset-password] verifyIdToken failed:", err);
      const details = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: "server_config_error", details }, { status: 500 });
    }

    const db = getAdminDb();
    const callerDoc = await db.collection("users").doc(decoded.uid).get();
    const callerData = callerDoc.exists ? callerDoc.data() : null;
    if (!callerData || callerData.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { targetUid, newPassword } = body as { targetUid?: string; newPassword?: string };

    if (!targetUid || !newPassword) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "weak_password" }, { status: 400 });
    }

    const targetDoc = await db.collection("users").doc(targetUid).get();
    const targetData = targetDoc.exists ? targetDoc.data() : null;
    if (!targetData || !["student", "guardian", "teacher"].includes(targetData.role)) {
      return NextResponse.json({ error: "invalid_target" }, { status: 400 });
    }

    await adminAuth.updateUser(targetUid, { password: newPassword });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[reset-password] unexpected error:", err);
    const details = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "server_error", details }, { status: 500 });
  }
}
