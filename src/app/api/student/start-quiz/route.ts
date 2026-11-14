import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

// Starts (or resumes) a timed online test. The start time is written once, on the server,
// so refreshing the page can never restart the countdown. Tests without a time limit
// simply return { durationMin: null }.
export async function POST(req: NextRequest) {
  let auth, db;
  try {
    auth = getAdminAuth();
    db = getAdminDb();
  } catch (err) {
    console.error("[start-quiz] Firebase Admin init failed:", err);
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

    const body = await req.json();
    const quizId = String(body.quizId || "");
    if (!quizId) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

    const userSnap = await db.collection("users").doc(decoded.uid).get();
    const user = userSnap.exists ? userSnap.data() : null;
    if (!user || user.role !== "student") return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const quizSnap = await db.collection("quizzes").doc(quizId).get();
    if (!quizSnap.exists) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const quiz = quizSnap.data() as { published?: boolean; className?: string; durationMin?: number | null };
    if (!quiz.published) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (quiz.className && user.className && quiz.className !== user.className) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const resultId = `${quizId}_${decoded.uid}`;
    const done = await db.collection("quizResults").doc(resultId).get();
    if (done.exists) return NextResponse.json({ error: "already_submitted" }, { status: 409 });

    const durationMin = quiz.durationMin && quiz.durationMin > 0 ? Number(quiz.durationMin) : null;
    if (!durationMin) {
      return NextResponse.json({ durationMin: null, startedAtMs: null, serverNowMs: Date.now() });
    }

    const attemptRef = db.collection("quizAttempts").doc(resultId);
    const startedAtMs = await db.runTransaction(async (tx) => {
      const snap = await tx.get(attemptRef);
      if (snap.exists) return Number(snap.data()?.startedAtMs) || Date.now();
      const now = Date.now();
      tx.set(attemptRef, { quizId, studentUid: decoded.uid, startedAtMs: now, durationMin });
      return now;
    });

    return NextResponse.json({ durationMin, startedAtMs, serverNowMs: Date.now() });
  } catch (err) {
    console.error("[start-quiz] unexpected error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
