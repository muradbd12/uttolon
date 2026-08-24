// এই পুরো ফাইলটাই ডেমো/নমুনা ডেটা — Firebase যুক্ত হওয়ার পর আসল ডেটা দিয়ে
// প্রতিস্থাপিত হবে। কোনো বাস্তব শিক্ষার্থী বা অভিভাবকের তথ্য এখানে নেই।

export const demoGuardian = {
  name: "নমুনা অভিভাবক",
  child: {
    name: "নমুনা শিক্ষার্থী",
    studentId: "UTL-2026-001",
    className: "Class 10",
    program: "Final Preparation Batch",
  },
};

export const demoAttendance = {
  thisMonthPercent: 92,
  presentDays: 23,
  totalDays: 25,
};

export const demoAssessmentSummary = [
  { subject: "Mathematics", assessment: 71, recoveryActive: true },
  { subject: "Physics", assessment: 55, recoveryActive: true },
  { subject: "English", assessment: 80, recoveryActive: false },
];

export const demoTeacherComments = [
  {
    subject: "Mathematics",
    comment: "সাম্প্রতিক মূল্যায়নে ত্রিকোণমিতিতে দুর্বলতা দেখা গেছে, Recovery ক্লাসে অংশগ্রহণ নিয়মিত রাখা দরকার।",
  },
  {
    subject: "English",
    comment: "লেখার দক্ষতায় ভালো উন্নতি হয়েছে, ধারাবাহিকতা বজায় রাখলে ভালো ফল আশা করা যায়।",
  },
];

export const demoUpcomingExams = [
  { title: "মাসিক মূল্যায়ন — Mathematics", date: "তারিখ শীঘ্রই জানানো হবে" },
  { title: "মডেল টেস্ট — সম্পূর্ণ সিলেবাস", date: "তারিখ শীঘ্রই জানানো হবে" },
];

export const demoNotices = [
  { title: "মাসিক মূল্যায়ন পরীক্ষার সময়সূচি শীঘ্রই প্রকাশিত হবে", category: "Examination" },
  { title: "নতুন Recovery ব্যাচ শুরুর তারিখ পরে জানানো হবে", category: "Academic" },
];
