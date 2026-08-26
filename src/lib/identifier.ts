// শিক্ষার্থী/গার্ডিয়ান/শিক্ষক ইমেইল অথবা মোবাইল নম্বর — যেকোনো একটা দিয়ে
// লগইন করতে পারবেন। Firebase Auth মূলত ইমেইল-ভিত্তিক, তাই মোবাইল নম্বর
// দিলে ভেতরে ভেতরে একটা synthetic ইমেইলে রূপান্তর করা হয় (ব্যবহারকারী
// এটা দেখেন না, শুধু নিজের নম্বর/পাসওয়ার্ড দিয়েই লগইন করেন)।
export function identifierToEmail(identifier: string): string {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) return trimmed.toLowerCase();
  const digits = trimmed.replace(/\D/g, "");
  return `${digits}@uttolon.internal`;
}
