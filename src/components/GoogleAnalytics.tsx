"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// Vercel Analytics-এর বদলে Google Analytics (GA4) বেছে নেওয়া হয়েছে —
// সম্পূর্ণ ফ্রি, কোনো কার্ড লাগে না, আর analytics.google.com-এ পূর্ণাঙ্গ
// একটা ড্যাশবোর্ড এমনিতেই তৈরি করা থাকে (ভিজিটর, পেজ, উৎস, ডিভাইস,
// অবস্থান) — নতুন করে কিছু বানানোর দরকার নেই।
export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const pathname = usePathname();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!measurementId || typeof window.gtag !== "function") return;
    // প্রথমবার gtag.js নিজে থেকেই initial page_view পাঠায়, তাই সেটা
    // এড়িয়ে শুধু পরবর্তী client-side navigation-গুলো ট্র্যাক করা হয়।
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    window.gtag("event", "page_view", {
      page_path: pathname,
    });
  }, [pathname, measurementId]);

  if (!measurementId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
