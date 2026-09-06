import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { identifierToEmail } from "@/lib/identifier";

// এই API route শুধু Admin কল করতে পারবেন (Super বা Academic, দুজনই) —
// শুধু student/guardian/teacher-এর তথ্য এডিট করা যাবে, অন্য কোনো
// Admin-এর তথ্য এখান থেকে বদলানো যাবে না।
export async function POST(req: NextRequest) {
  let adminAuth;
  try {
    adminAuth = getAdminAuth();
  } catch (err) {
    console.error("[update-user] Firebase Admin init failed:", err);
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
      console.error("[update-user] verifyIdToken failed:", err);
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
    const { targetUid, name, identifier, className, subject, guardianMobile, linkedStudentUid } = body as {
      targetUid?: string;
      name?: string;
      identifier?: string;
      className?: string;
      subject?: string;
      guardianMobile?: string;
      linkedStudentUid?: string;
    };

    if (!targetUid || !name || !identifier) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const targetDoc = await db.collection("users").doc(targetUid).get();
    const targetData = targetDoc.exists ? targetDoc.data() : null;
    if (!targetData || !["student", "guardian", "teacher"].includes(targetData.role)) {
      return NextResponse.json({ error: "invalid_target" }, { status: 400 });
    }

    if (targetData.role === "student" && !guardianMobile) {
      return NextResponse.json({ error: "guardian_mobile_required" }, { status: 400 });
    }
    if (targetData.role === "guardian" && !linkedStudentUid) {
      return NextResponse.json({ error: "linked_student_required" }, { status: 400 });
    }

    const newEmail = identifierToEmail(identifier);

    // ইমেইল/নম্বর বদলে থাকলে Firebase Auth-এও আপডেট করা হচ্ছে
    if (newEmail !== (targetData.identifier ? identifierToEmail(targetData.identifier) : "")) {
      await adminAuth.updateUser(targetUid, { email: newEmail, displayName: name });
    } else {
      await adminAuth.updateUser(targetUid, { displayName: name });
    }

    await db
      .collection("users")
      .doc(targetUid)
      .update({
        name,
        identifier,
        className: className || null,
        subject: subject || null,
        guardianMobile: guardianMobile || null,
        linkedStudentUid: linkedStudentUid || null,
        updatedAt: new Date().toISOString(),
      });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[update-user] unexpected error:", err);
    const code = (err as { errorInfo?: { code?: string }; code?: string })?.errorInfo?.code
      ?? (err as { code?: string })?.code;
    if (code === "auth/email-already-exists") {
      return NextResponse.json({ error: "already_exists" }, { status: 409 });
    }
    const details = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "server_error", details }, { status: 500 });
  }
}
