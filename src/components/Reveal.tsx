"use client";

import { useEffect, useRef, useState } from "react";

// মোবাইলে মাউস hover effect কাজ করে না (টাচস্ক্রিনে hover বলে কিছু
// নেই), তাই ডেস্কটপে hover-এ যেসব সূক্ষ্ম effect দেখা যায় সেগুলো
// মোবাইলে একদমই চোখে পড়ে না। এই কম্পোনেন্টটা তার বদলে স্ক্রল করে
// নিচে নামলে প্রতিটা সেকশন হালকা fade + slide করে দেখায় —
// ডেস্কটপ ও মোবাইল দুই জায়গাতেই কাজ করে, তাই মোবাইলেও পেজটা
// আর "একদম স্থির/সাধারণ" মনে হবে না।
export default function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
