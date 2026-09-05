/**
 * প্রোগ্রাম অনুযায়ী ভর্তি ফি — এখানের টাকার অঙ্কগুলো শুধু placeholder/উদাহরণ।
 * আসল ফি অনুযায়ী নিচের সংখ্যাগুলো বদলে নিন — বাকি পুরো পেমেন্ট সিস্টেম এই
 * একটা ফাইলের উপর নির্ভর করে, তাই এখানে বদলালেই সব জায়গায় আপডেট হয়ে যাবে।
 */
export const PROGRAM_FEES: Record<string, number> = {
  "Regular Academic Program": 1500,
  "Revision Batch": 2000,
  "Recovery Batch": 1800,
  "Final Preparation Batch": 2500,
  "SSC / Dakhil Program": 3000,
  "University Admission Program": 3500,
};

export function getProgramFee(program: string): number {
  return PROGRAM_FEES[program] ?? 0;
}
