"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// এই ৪টা সেকশন নিজেদের ভেতরেই নেভিগেশন/চেহারা সামলায় (লগইন পেজ,
// ড্যাশবোর্ড, বা এখন Admin-এর নতুন সাইডবার) — তাই এখানে ওয়েবসাইটের
// সাধারণ Header/Footer (Apply Now-সহ পাবলিক মেনু) দেখানোর দরকার নেই,
// দেখালে দুই ধরনের নেভিগেশন একসাথে দেখাত।
const CHROME_FREE_PREFIXES = ["/admin", "/student", "/guardian", "/teacher"];

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const hideChrome = CHROME_FREE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
