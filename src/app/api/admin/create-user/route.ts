import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { identifierToEmail } from "@/lib/identifier";

// এই API route শুধু লগইন করা অ্যাডমিনই কল করতে পারবেন — প্রতিবার
// Firebase ID token যাচাই করা হয়, এবং token-এর ইমেইল অবশ্যই
// ADMIN_EMAILS env variable-এ থাকা তালিকার সাথে মিলতে হবে।
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!idToken) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);

    const allowedAdmins = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (!decoded.email || !allowedAdmins.includes(decoded.email.toLowerCase())) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, role, identifier, password, guardianMobile, className, subject, linkedStudentUid } = body as {
      name?: string;
      role?: "student" | "guardian" | "teacher";
      identifier?: string;
      password?: string;
      guardianMobile?: string;
      className?: string;
      subject?: string;
      linkedStudentUid?: string;
    };

    if (!name || !role || !identifier || !password) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "weak_password" }, { status: 400 });
    }
    if (role === "student" && !guardianMobile) {
      return NextResponse.json({ error: "guardian_mobile_required" }, { status: 400 });
    }
    if (role === "guardian" && !linkedStudentUid) {
      return NextResponse.json({ error: "linked_student_required" }, { status: 400 });
    }
    if (!["student", "guardian", "teacher"].includes(role)) {
      return NextResponse.json({ error: "invalid_role" }, { status: 400 });
    }

    const email = identifierToEmail(identifier);

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    const db = getAdminDb();
    await db
      .collection("users")
      .doc(userRecord.uid)
      .set({
        name,
        role,
        identifier,
        guardianMobile: guardianMobile || null,
        className: className || null,
        subject: subject || null,
        linkedStudentUid: linkedStudentUid || null,
        createdAt: new Date().toISOString(),
      });

    return NextResponse.json({ uid: userRecord.uid, email });
  } catch (err: unknown) {
    const code = (err as { errorInfo?: { code?: string }; code?: string })?.errorInfo?.code
      ?? (err as { code?: string })?.code;
    if (code === "auth/email-already-exists") {
      return NextResponse.json({ error: "already_exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
