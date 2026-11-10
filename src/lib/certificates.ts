export type Certificate = {
  id: string;
  certNo: string;
  verifyCode: string;
  studentUid: string;
  studentName: string;
  className: string;
  studentId: string;
  title: string;
  description: string;
  issuedDate: string; // YYYY-MM-DD
  ms: number;
};

// Quick-pick certificate titles for the admin form (free text is allowed too).
export const CERT_TITLE_PRESETS = [
  "কোর্স সফলভাবে সম্পন্নকরণ সনদ",
  "Recovery Batch সম্পন্নকরণ সনদ",
  "কুরআন শিক্ষা — পারা সম্পন্নকরণ সনদ",
  "গণিত অলিম্পিয়াড অংশগ্রহণ সনদ",
  "IELTS প্রশিক্ষণ সম্পন্নকরণ সনদ",
  "আরবি ভাষা কোর্স সম্পন্নকরণ সনদ",
  "শ্রেষ্ঠ উপস্থিতি সনদ",
  "সাফল্যের সনদ",
];

export function mapCertificate(id: string, x: Record<string, unknown>): Certificate {
  const created = x.createdAt as { toMillis?: () => number } | undefined;
  return {
    id,
    certNo: (x.certNo as string) || "",
    verifyCode: (x.verifyCode as string) || "",
    studentUid: (x.studentUid as string) || "",
    studentName: (x.studentName as string) || "",
    className: (x.className as string) || "",
    studentId: (x.studentId as string) || "",
    title: (x.title as string) || "",
    description: (x.description as string) || "",
    issuedDate: (x.issuedDate as string) || "",
    ms: created && typeof created.toMillis === "function" ? created.toMillis() : 0,
  };
}
