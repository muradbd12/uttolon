import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

// Public certificate check: needs the exact verification code printed on the certificate
// and returns only the minimum (name, title, class, date) — never a list of certificates.
export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get("code") || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{8}$/.test(code)) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }
  try {
    const db = getAdminDb();
    const snap = await db.collection("certificates").where("verifyCode", "==", code).limit(1).get();
    if (snap.empty) return NextResponse.json({ valid: false }, { status: 404 });
    const x = snap.docs[0].data();
    return NextResponse.json({
      valid: true,
      certNo: x.certNo || "",
      studentName: x.studentName || "",
      className: x.className || "",
      title: x.title || "",
      issuedDate: x.issuedDate || "",
    });
  } catch (err) {
    console.error("[verify-certificate] error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
