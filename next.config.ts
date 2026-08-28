import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin-এর মতো ভারী Node SDK Next.js-এর bundler দিয়ে বান্ডল
  // করার চেষ্টা করলে প্রায়ই Vercel-এ silently ভেঙে যায় (build-এ ধরা
  // পড়ে না, শুধু আসল request-এর সময় fail করে) — তাই এটাকে বান্ডলের
  // বাইরে রাখা হলো, Node নিজে থেকে require করবে।
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
