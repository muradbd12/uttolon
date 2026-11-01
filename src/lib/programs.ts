import { PROGRAM_FEES } from "./programFees";

// A program shown on the site and offered in the admission form.
// Admins can add/edit/hide programs from Admin → প্রোগ্রাম ও ফি.
// Until they save their own list, the built-in defaults below are used.
export type Program = {
  id: string;
  title: string; // English name — this exact text is saved on an admission
  bn: string; // Bangla name
  desc: string; // short text (homepage card)
  longDesc?: string; // longer text (/programs page); falls back to desc
  fee: number; // admission fee in taka
  highlight?: boolean;
  active?: boolean; // false = hidden from the site and the admission form
  order?: number;
};

type Base = { title: string; bn: string; desc: string; longDesc: string; highlight?: boolean };

const BASE: Base[] = [
  {
    title: "Regular Academic Program",
    bn: "নিয়মিত একাডেমিক প্রোগ্রাম",
    desc: "দীর্ঘমেয়াদী, কাঠামোবদ্ধ শিক্ষার জন্য।",
    longDesc:
      "যেসব শিক্ষার্থী দীর্ঘমেয়াদী, কাঠামোবদ্ধ শিক্ষা চায়, তাদের জন্য। Concept থেকে Practice — প্রতিটি বিষয় ধাপে ধাপে গড়ে তোলা হয়।",
  },
  {
    title: "Revision Batch",
    bn: "রিভিশন ব্যাচ",
    desc: "প্রাথমিক পড়াশোনা শেষ, এখন দরকার নিয়মিত পুনরাবৃত্তি।",
    longDesc:
      "যেসব শিক্ষার্থীর প্রাথমিক পড়াশোনা শেষ হয়েছে, কিন্তু নিয়মিত পুনরাবৃত্তি দরকার — তাদের জন্য পরিকল্পিত রিভিশন কাঠামো।",
  },
  {
    title: "Recovery Batch",
    bn: "রিকভারি ব্যাচ",
    desc: "একটি বা একাধিক বিষয়ে দুর্বল শিক্ষার্থীদের জন্য।",
    longDesc:
      "একটি বা একাধিক বিষয়ে/অধ্যায়ে দুর্বল শিক্ষার্থীদের জন্য বিশেষায়িত ব্যাচ — উত্তোলনের অন্যতম প্রধান বৈশিষ্ট্য।",
    highlight: true,
  },
  {
    title: "Final Preparation Batch",
    bn: "ফাইনাল প্রিপারেশন ব্যাচ",
    desc: "পরীক্ষার আগে নিবিড় রিভিশন ও মডেল টেস্ট।",
    longDesc:
      "পরীক্ষার আগে নিবিড় রিভিশন, মডেল টেস্ট, গুরুত্বপূর্ণ টপিক, exam strategy, ভুল বিশ্লেষণ ও সময় ব্যবস্থাপনা।",
  },
  {
    title: "SSC Program",
    bn: "SSC প্রোগ্রাম",
    desc: "Class 9, Class 10 ও SSC শিক্ষার্থীদের জন্য।",
    longDesc: "Class 9, Class 10 ও SSC শিক্ষার্থীদের জন্য সম্পূর্ণ সহায়তা।",
  },
  {
    title: "Dakhil Program",
    bn: "দাখিল প্রোগ্রাম",
    desc: "দাখিল শিক্ষার্থীদের জন্য সম্পূর্ণ সহায়তা।",
    longDesc: "দাখিল শিক্ষার্থীদের জন্য সম্পূর্ণ সহায়তা।",
  },
  {
    title: "Alim Program",
    bn: "আলিম প্রোগ্রাম",
    desc: "আলিম শিক্ষার্থীদের জন্য সম্পূর্ণ সহায়তা।",
    longDesc: "আলিম শিক্ষার্থীদের জন্য সম্পূর্ণ সহায়তা।",
  },
  {
    title: "HSC Program",
    bn: "HSC প্রোগ্রাম",
    desc: "HSC শিক্ষার্থীদের জন্য সম্পূর্ণ সহায়তা।",
    longDesc: "HSC শিক্ষার্থীদের জন্য সম্পূর্ণ সহায়তা।",
  },
  {
    title: "University Admission Program",
    bn: "বিশ্ববিদ্যালয় ভর্তি প্রোগ্রাম",
    desc: "বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য বিশেষ প্রস্তুতি।",
    longDesc: "বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য বিশেষভাবে সাজানো প্রস্তুতি।",
  },
  {
    title: "IELTS Program",
    bn: "IELTS প্রোগ্রাম",
    desc: "Listening, Reading, Writing ও Speaking-এ দক্ষতা বাড়ানোর জন্য প্রশিক্ষণ।",
    longDesc: "Listening, Reading, Writing ও Speaking — চারটি অংশেই দক্ষতা বাড়ানোর জন্য পরিকল্পিত প্রশিক্ষণ।",
  },
  {
    title: "Arabic Language Program",
    bn: "আরবি ভাষা প্রোগ্রাম",
    desc: "আরবি ভাষা, ব্যাকরণ ও বোধগম্যতা শেখার প্রোগ্রাম।",
    longDesc: "আরবি ভাষা, ব্যাকরণ, শব্দভাণ্ডার ও বোধগম্যতা শেখার জন্য ধাপে ধাপে সাজানো প্রোগ্রাম।",
  },
  {
    title: "Mathematics Olympiad Program",
    bn: "গণিত অলিম্পিয়াড প্রোগ্রাম",
    desc: "মেধাবী শিক্ষার্থীদের জন্য গণিত অলিম্পিয়াডের বিশেষ প্রস্তুতি।",
    longDesc: "মেধাবী ও আগ্রহী শিক্ষার্থীদের জন্য গণিত অলিম্পিয়াড উপযোগী বিশেষ সমস্যা সমাধান ও প্রস্তুতি।",
  },
  {
    title: "Quran Learning Program",
    bn: "কুরআন শিক্ষা প্রোগ্রাম",
    desc: "সঠিক উচ্চারণ ও অর্থসহ কুরআন শেখার প্রোগ্রাম — অফলাইন ও অনলাইন উভয়ভাবে।",
    longDesc: "সঠিক উচ্চারণ (তাজবীদ) ও অর্থসহ কুরআন শেখার প্রোগ্রাম — অফলাইন ও অনলাইন উভয় ব্যবস্থায়।",
  },
];

export const DEFAULT_PROGRAMS: Program[] = BASE.map((p, i) => ({
  id: `default-${i}`,
  active: true,
  order: i + 1,
  fee: PROGRAM_FEES[p.title] ?? 0,
  ...p,
}));
