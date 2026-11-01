import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { DEFAULT_PROGRAMS } from "@/lib/programs";

// হোমপেজের পরিসংখ্যান — এটা ইচ্ছাকৃতভাবে Admin SDK দিয়ে সার্ভার-সাইডে
// হিসাব করে শুধু সংখ্যাগুলো (aggregate count) ফেরত দেয়, কোনো
// ব্যক্তিগত তথ্য (নাম, ফোন নম্বর ইত্যাদি) না। এভাবে Firestore
// Security Rules-এ users/students-এর জন্য public read খুলে দেওয়ার
// দরকার হয় না — সেটা হলে যে কেউ সবার ফোন নম্বর দেখে ফেলতে পারতো।
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getAdminDb();
    const [studentsCount, teachersCount, assessmentsCount, programsSnap] = await Promise.all([
      db.collection("users").where("role", "==", "student").count().get(),
      db.collection("users").where("role", "==", "teacher").count().get(),
      db.collection("assessments").count().get(),
      db.collection("programs").get().catch(() => null),
    ]);
    const activePrograms = programsSnap ? programsSnap.docs.filter((d) => d.data().active !== false).length : 0;

    return NextResponse.json({
      students: studentsCount.data().count,
      teachers: teachersCount.data().count,
      courses: activePrograms || DEFAULT_PROGRAMS.length, // admin-managed list; falls back to the built-in defaults
      assessments: assessmentsCount.data().count,
    });
  } catch (err) {
    console.error("[public/stats] error:", err);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
