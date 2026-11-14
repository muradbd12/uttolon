import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// Grades an online MCQ test on the server. The answer key lives in a separate
// teacher/admin-only document (quizKeys), so students can never read the correct
// answers from the browser before submitting. One attempt per student per test.
export async function POST(req: NextRequest) {
  let auth, db;
  try {
    auth = getAdminAuth();
    db = getAdminDb();
  } catch (err) {
    console.error("[submit-quiz] Firebase Admin init failed:", err);
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
    const answers: unknown = body.answers;
    if (!quizId || !Array.isArray(answers)) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const userSnap = await db.collection("users").doc(decoded.uid).get();
    const user = userSnap.exists ? userSnap.data() : null;
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const [quizSnap, keySnap] = await Promise.all([
      db.collection("quizzes").doc(quizId).get(),
      db.collection("quizKeys").doc(quizId).get(),
    ]);
    if (!quizSnap.exists || !keySnap.exists) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const quiz = quizSnap.data() as {
      title?: string;
      className?: string;
      published?: boolean;
      durationMin?: number | null;
      questions?: unknown[];
    };
    if (!quiz.published) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (quiz.className && user.className && quiz.className !== user.className) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const key = (keySnap.data()?.answers as number[]) || [];
    const total = (quiz.questions || []).length;
    if (total === 0 || key.length !== total || answers.length !== total) {
      return NextResponse.json({ error: "invalid_answers" }, { status: 400 });
    }

    // Timed tests: the start time was written on the server by /api/student/start-quiz, so
    // refreshing the page can't restart the clock. A submission arriving after the time limit
    // (plus a short grace for slow networks) is recorded as timed out with score 0.
    const durationMin = quiz.durationMin && quiz.durationMin > 0 ? Number(quiz.durationMin) : null;
    let timedOut = false;
    if (durationMin) {
      const attemptSnap = await db.collection("quizAttempts").doc(`${quizId}_${decoded.uid}`).get();
      if (!attemptSnap.exists) return NextResponse.json({ error: "not_started" }, { status: 400 });
      const startedAtMs = Number(attemptSnap.data()?.startedAtMs) || 0;
      timedOut = Date.now() > startedAtMs + durationMin * 60000 + 90000;
    }

    const clean = timedOut ? answers.map(() => -1) : answers.map((a) => (Number.isInteger(a) ? (a as number) : -1));
    const correct = clean.map((a, i) => a === key[i]);
    const score = timedOut ? 0 : correct.filter(Boolean).length;

    const resultRef = db.collection("quizResults").doc(`${quizId}_${decoded.uid}`);
    try {
      await db.runTransaction(async (tx) => {
        const existing = await tx.get(resultRef);
        if (existing.exists) throw new Error("already_submitted");
        tx.set(resultRef, {
          quizId,
          quizTitle: quiz.title || "",
          studentUid: decoded.uid,
          studentName: (user.name as string) || "",
          className: (user.className as string) || "",
          score,
          total,
          answers: clean,
          timedOut,
          submittedAt: FieldValue.serverTimestamp(),
        });
      });
    } catch (err) {
      if (err instanceof Error && err.message === "already_submitted") {
        return NextResponse.json({ error: "already_submitted" }, { status: 409 });
      }
      throw err;
    }

    if (timedOut) return NextResponse.json({ timedOut: true, score: 0, total });
    return NextResponse.json({ score, total, correct, key });
  } catch (err) {
    console.error("[submit-quiz] unexpected error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
