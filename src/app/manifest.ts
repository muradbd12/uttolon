import type { MetadataRoute } from "next";

// Makes the site installable on a phone's home screen ("app-like", no app store needed).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "উত্তোলন — Uttolon Learning System",
    short_name: "উত্তোলন",
    description: "Concept, Practice, Assessment, Recovery ও Result-ভিত্তিক শিক্ষা ব্যবস্থা।",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbfbf7",
    theme_color: "#14213b",
    lang: "bn",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "পেমেন্ট করুন", url: "/payment" },
      { name: "স্টুডেন্ট লগইন", url: "/student/login" },
      { name: "গার্ডিয়ান লগইন", url: "/guardian/login" },
      { name: "ভর্তি হোন", url: "/admission" },
    ],
  };
}
