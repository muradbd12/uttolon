import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

const BN_MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return `${BN_MONTHS[m - 1]} ${y}`;
}

export type MonthlyDue = {
  id: string;
  admissionId: string;
  month: string;
  monthLabel: string;
  studentNameBn?: string;
  studentNameEn?: string;
  mobile?: string;
  amountDue: number;
  amountPaid: number;
  status: "due" | "partial" | "paid";
};

/**
 * ওই মাসের বেতনের রেকর্ড থাকলে সেটা ফেরত দেয়, না থাকলে নতুন তৈরি করে দেয়
 * (amountPaid: 0 দিয়ে শুরু হয়)। ডকুমেন্ট আইডি সবসময় `${admissionId}_${month}`,
 * তাই একই মাসে দুইবার তৈরি হওয়ার সুযোগ নেই।
 */
export async function ensureMonthlyDue(
  admissionId: string,
  monthlyFee: number,
  student: { studentNameBn?: string; studentNameEn?: string; mobile?: string },
  month: string = currentMonthKey()
): Promise<MonthlyDue> {
  const id = `${admissionId}_${month}`;
  const ref = doc(getFirebaseDb(), "monthlyDues", id);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return { id, ...(snap.data() as Omit<MonthlyDue, "id">) };
  }

  const fresh: Omit<MonthlyDue, "id"> = {
    admissionId,
    month,
    monthLabel: monthLabel(month),
    studentNameBn: student.studentNameBn,
    studentNameEn: student.studentNameEn,
    mobile: student.mobile,
    amountDue: monthlyFee,
    amountPaid: 0,
    status: monthlyFee > 0 ? "due" : "paid",
  };
  await setDoc(ref, { ...fresh, createdAt: serverTimestamp() });
  return { id, ...fresh };
}

export async function recordMonthlyPayment(monthlyDueId: string, amount: number, currentPaid: number, amountDue: number) {
  const newPaid = currentPaid + amount;
  const status: MonthlyDue["status"] = newPaid >= amountDue ? "paid" : newPaid > 0 ? "partial" : "due";
  await setDoc(
    doc(getFirebaseDb(), "monthlyDues", monthlyDueId),
    { amountPaid: newPaid, status },
    { merge: true }
  );
  return { amountPaid: newPaid, status };
}
