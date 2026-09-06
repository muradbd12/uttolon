import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

// হোমপেজের পরিসংখ্যান — এটা ইচ্ছাকৃতভাবে Admin SDK দিয়ে সার্ভার-সাইডে
// হিসাব করে শুধু সংখ্যাগুলো (aggregate count) ফেরত দেয়, কোনো
// ব্যক্তিগত তথ্য (নাম, ফোন নম্বর ইত্যাদি) না। এভাবে Firestore
// Security Rules-এ users/students-এর জন্য public read খুলে দেওয়ার
// দরকার হয় না — সেটা হলে যে কেউ সবার ফোন নম্বর দেখে ফেলতে পারতো।
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getAdminDb();
    const [studentsCount, teachersCount, assessmentsCount] = await Promise.all([
      db.collection("users").where("role", "==", "student").count().get(),
      db.collection("users").where("role", "==", "teacher").count().get(),
      db.collection("assessments").count().get(),
    ]);

    return NextResponse.json({
      students: studentsCount.data().count,
      teachers: teachersCount.data().count,
      courses: 5, // ৫টা স্থায়ী প্রোগ্রাম — /programs পেজের সাথে মিলিয়ে
      assessments: assessmentsCount.data().count,
    });
  } catch (err) {
    console.error("[public/stats] error:", err);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
