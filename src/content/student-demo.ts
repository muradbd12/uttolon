// এই পুরো ফাইলটাই ডেমো/নমুনা ডেটা — Firebase যুক্ত হওয়ার পর আসল ডেটা দিয়ে
// প্রতিস্থাপিত হবে। কোনো বাস্তব শিক্ষার্থীর তথ্য এখানে নেই।

export const demoStudent = {
  name: "নমুনা শিক্ষার্থী",
  studentId: "UTL-2026-001",
  className: "Class 10",
  program: "Final Preparation Batch",
  batch: "সন্ধ্যা ব্যাচ",
};

export const demoAttendance = {
  thisMonthPercent: 92,
  presentDays: 23,
  totalDays: 25,
};

export const demoClassesToday = [
  { subject: "Mathematics", time: "বিকাল ৪:০০ – ৫:১৫", teacher: "শিক্ষক নির্ধারিত হয়নি" },
  { subject: "Physics", time: "বিকাল ৫:৩০ – ৬:৪৫", teacher: "শিক্ষক নির্ধারিত হয়নি" },
];

export const demoAssessment = [
  { subject: "Mathematics", concept: 82, practice: 76, assessment: 71, recoveryActive: true },
  { subject: "Physics", concept: 68, practice: 60, assessment: 55, recoveryActive: true },
  { subject: "English", concept: 88, practice: 85, assessment: 80, recoveryActive: false },
];

export const demoHomework = [
  { subject: "Mathematics", title: "ত্রিকোণমিতি অনুশীলনী — ১০টি সমস্যা", due: "আগামীকাল" },
  { subject: "Physics", title: "গতি সংক্রান্ত অধ্যায়ের সারসংক্ষেপ লিখুন", due: "৩ দিনের মধ্যে" },
];

export const demoNotices = [
  { title: "মাসিক মূল্যায়ন পরীক্ষার সময়সূচি শীঘ্রই প্রকাশিত হবে", category: "Examination" },
  { title: "নতুন Recovery ব্যাচ শুরুর তারিখ পরে জানানো হবে", category: "Academic" },
];
