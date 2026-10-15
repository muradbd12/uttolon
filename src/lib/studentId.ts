import type { Firestore } from "firebase-admin/firestore";

// Server-side only. Hands out Uttolon student IDs like UTL-26-0001
// (UTL-<last two digits of year>-<4-digit running number for that year>).
// A transaction on a counter document guarantees no two students get the same number.
export async function allocateStudentId(db: Firestore, year: number = new Date().getFullYear()): Promise<string> {
  const ref = db.collection("counters").doc(`studentId-${year}`);
  const n = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const next = (snap.exists ? Number(snap.data()?.next) || 0 : 0) + 1;
    tx.set(ref, { next }, { merge: true });
    return next;
  });
  return `UTL-${String(year).slice(-2)}-${String(n).padStart(4, "0")}`;
}
