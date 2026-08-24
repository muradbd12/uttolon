// একটাই জায়গায় সাইটের URL রাখা হলো — ডোমেইন কেনার পর শুধু এই একটা লাইন
// বদলালেই sitemap, robots.txt ও SEO metadata সব জায়গায় নতুন ডোমেইন ব্যবহার হবে।
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://uttolon.vercel.app";
