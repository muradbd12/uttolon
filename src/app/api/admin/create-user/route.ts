import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { identifierToEmail } from "@/lib/identifier";

// এই API route শুধু লগইন করা অ্যাডমিনই কল করতে পারবেন — প্রতিবার
// Firebase ID token যাচাই করা হয়, এবং token-এর ইমেইল অবশ্যই
// ADMIN_EMAILS env variable-এ থাকা তালিকার সাথে মিলতে হবে।
export async function POST(req: NextRequest) {
  let adminAuth;
  try {
    adminAuth = getAdminAuth();
  } catch (err) {
    console.error("[create-user] Firebase Admin init failed:", err);
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
      console.error("[create-user] verifyIdToken failed:", err);
      const details = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: "server_config_error", details }, { status: 500 });
    }

    const allowedAdmins = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (allowedAdmins.length === 0) {
      console.error("[create-user] ADMIN_EMAILS env variable is empty/missing");
      return NextResponse.json({ error: "server_config_error" }, { status: 500 });
    }

    if (!decoded.email || !allowedAdmins.includes(decoded.email.toLowerCase())) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      role,
      identifier,
      password,
      guardianMobile,
      className,
      subject,
      linkedStudentUids,
      adminLevel,
    } = body as {
      name?: string;
      role?: "student" | "guardian" | "teacher" | "admin";
      identifier?: string;
      password?: string;
      guardianMobile?: string;
      className?: string;
      subject?: string;
      linkedStudentUids?: string[];
      adminLevel?: "super" | "academic";
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
    if (role === "guardian" && (!linkedStudentUids || linkedStudentUids.length === 0)) {
      return NextResponse.json({ error: "linked_student_required" }, { status: 400 });
    }
    if (!["student", "guardian", "teacher", "admin"].includes(role)) {
      return NextResponse.json({ error: "invalid_role" }, { status: 400 });
    }

    const db = getAdminDb();

    if (role === "admin") {
      if (!adminLevel || !["super", "academic"].includes(adminLevel)) {
        return NextResponse.json({ error: "admin_level_required" }, { status: 400 });
      }
      // নতুন Admin অ্যাকাউন্ট তৈরি করার অনুমতি শুধু Super Admin-এর —
      // এখানে caller নিজে Super Admin কিনা তা Firestore থেকে যাচাই
      // করা হচ্ছে (শুধু ADMIN_EMAILS-এ থাকাই যথেষ্ট না এই একটা কাজের
      // জন্য)।
      const callerDoc = await db.collection("users").doc(decoded.uid).get();
      const callerData = callerDoc.exists ? callerDoc.data() : null;
      if (!callerData || callerData.role !== "admin" || callerData.adminLevel !== "super") {
        return NextResponse.json({ error: "super_admin_required" }, { status: 403 });
      }
    }

    const email = identifierToEmail(identifier);

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

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
        linkedStudentUids: role === "guardian" ? linkedStudentUids : null,
        adminLevel: role === "admin" ? adminLevel : null,
        createdAt: new Date().toISOString(),
      });

    return NextResponse.json({ uid: userRecord.uid, email });
  } catch (err: unknown) {
    console.error("[create-user] unexpected error:", err);
    const code = (err as { errorInfo?: { code?: string }; code?: string })?.errorInfo?.code
      ?? (err as { code?: string })?.code;
    if (code === "auth/email-already-exists") {
      return NextResponse.json({ error: "already_exists" }, { status: 409 });
    }
    // এখানে আসল কারণটা সরাসরি response-এ পাঠানো হচ্ছে, যাতে Vercel-এর
    // Logs খুঁজতে না হয় — শুধু লগইন করা admin-ই এটা দেখেন, তাই এটা
    // নিরাপদ। error() কল থেকেও message বের করার চেষ্টা করা হলো।
    const details =
      code || (err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err));
    return NextResponse.json({ error: "server_error", details }, { status: 500 });
  }
}
