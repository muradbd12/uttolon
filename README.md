# উত্তোলন (Uttolon) — ওয়েবসাইট

এই প্রজেক্টটি Next.js (App Router) + Tailwind CSS দিয়ে তৈরি — Uttolon মাস্টার স্পেসিফিকেশনের **Phase 1: পাবলিক ওয়েবসাইট**।

## এখন পর্যন্ত যা আছে (Phase 1 — আংশিক)

- Home — Hero, Trust Stats, Problem/Solution, Uttolon Learning System (৯ ধাপ), Driver Day, Programs preview, Recovery highlight, Practical Learning, Teachers (খালি অবস্থা), Student Progress demo, Success Stories (খালি অবস্থা), Scholarship, Knowledge Hub, Admission CTA, Contact block
- About — Brand story + চক্রাকার Learning Cycle diagram + দর্শন
- Programs — ৫টি মূল প্রোগ্রাম + SSC/দাখিল ২০২৭ ক্যাম্পেইন
- Admission — সম্পূর্ণ ফর্ম UI (এখনো ব্যাকএন্ড যুক্ত নয় — জমা দিলে শুধু একটি honest "এখনো সংরক্ষিত হয়নি" বার্তা দেখাবে)
- Contact — তথ্য ব্লক + ফর্ম UI

## এখনো বাকি

- Teacher directory, Blog, Notice board পূর্ণাঙ্গ পেজ
- Student / Guardian / Teacher / Admin লগইন ও ড্যাশবোর্ড (Phase 2)
- Assessment, Recovery tracking, Attendance (Phase 3)
- Fee management, Resource library, Notifications (Phase 4)
- Analytics (Phase 5)
- আসল লোগো, ছবি, ফোন/ইমেইল/ঠিকানা, শিক্ষকের তথ্য, পরিসংখ্যান (এখন সব জায়গায় honest placeholder আছে)

## লোকাল চালানো

```bash
npm install
npm run dev
```

তারপর ব্রাউজারে http://localhost:3000 খুলুন।

## Vercel-এ ডিপ্লয় (ডোমেইন ছাড়া লাইভ)

চ্যাটে দেওয়া ধাপগুলো অনুসরণ করুন — সংক্ষেপে: GitHub-এ রিপো বানিয়ে এই কোড push করুন, তারপর vercel.com-এ গিয়ে "Import Project" দিয়ে সেই রিপো import করুন। কোনো সেটিং পরিবর্তন না করেই "Deploy" চাপলে কয়েক মিনিটে একটি ফ্রি `.vercel.app` লিংকে সাইট লাইভ হয়ে যাবে।
