import type { VoucherData } from "@/components/PaymentVoucherCard";

// One place that turns a monthly-fee record into the printable "মাসিক ফি রশিদ".
// Used by the admin fee form, the payment-history page and the student/guardian dashboards,
// so every monthly receipt looks and adds up the same way.
export type MonthlyFee = {
  month: string;
  amountDue: number;
  discount: number;
  fine: number;
  amountPaid: number;
  paymentMethod?: string;
  transactionNumber?: string;
  updatedAt?: { toDate?: () => Date };
};

export type ReceiptStudent = {
  uid?: string | null;
  name?: string | null;
  className?: string | null;
  studentId?: string | null;
  identifier?: string | null;
};

const dateBn = (d: Date) => d.toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });

export function buildMonthlyReceipt(en: MonthlyFee, student?: ReceiptStudent | null): VoucherData {
  const base = en.amountDue || 0;
  const discount = en.discount || 0;
  const fine = en.fine || 0;
  const paid = en.amountPaid || 0;
  const payable = Math.max(base - discount + fine, 0);
  const paidOn = en.updatedAt?.toDate ? dateBn(en.updatedAt.toDate()) : dateBn(new Date());
  const method = en.paymentMethod || "—";
  return {
    title: "মাসিক ফি রশিদ",
    idLabel: student?.studentId ? "স্টুডেন্ট আইডি" : "লগইন আইডি",
    studentNameBn: student?.name || "",
    studentNameEn: "",
    applicationId: student?.studentId || student?.identifier || "",
    className: student?.className || "",
    group: "",
    program: "",
    mobile: "",
    voucherId: `${student?.studentId || (student?.uid || "FEE").slice(0, 6).toUpperCase()}-${en.month}`,
    paymentDate: paidOn,
    amountPaidNow: paid,
    method: en.transactionNumber ? `${method} (${en.transactionNumber})` : method,
    monthOrPurpose: `মাসিক ফি — ${en.month}`,
    totalFee: payable,
    totalPaid: paid,
    due: Math.max(payable - paid, 0),
    breakdown: [
      { label: "মাসিক ফি", amount: base },
      ...(discount ? [{ label: "ছাড়", amount: -discount }] : []),
      ...(fine ? [{ label: "জরিমানা", amount: fine }] : []),
      { label: "মোট প্রদেয়", amount: payable },
    ],
  };
}
