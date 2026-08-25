// এই পুরো ফাইলটাই ডেমো/নমুনা ডেটা — Firebase যুক্ত হওয়ার পর আসল ডেটা দিয়ে
// প্রতিস্থাপিত হবে। কোনো বাস্তব শিক্ষক বা শিক্ষার্থীর তথ্য এখানে নেই।

export const demoTeacher = {
  name: "নমুনা শিক্ষক",
  subject: "Mathematics",
  institution: "প্রতিষ্ঠান এখনো নির্ধারিত হয়নি",
};

export const demoClassesToday = [
  { batch: "Final Preparation — সন্ধ্যা ব্যাচ", time: "বিকাল ৪:০০ – ৫:১৫", room: "রুম নির্ধারিত হয়নি" },
  { batch: "Recovery Batch — A", time: "বিকাল ৫:৩০ – ৬:৩০", room: "রুম নির্ধারিত হয়নি" },
];

export const demoRecoveryStudents = [
  { studentId: "UTL-2026-001", subject: "Mathematics", weakArea: "ত্রিকোণমিতি" },
  { studentId: "UTL-2026-014", subject: "Mathematics", weakArea: "বীজগণিত — সূচক ও লগারিদম" },
  { studentId: "UTL-2026-022", subject: "Mathematics", weakArea: "জ্যামিতি — বৃত্ত" },
];

export const demoHomeworkAssigned = [
  { batch: "Final Preparation — সন্ধ্যা ব্যাচ", title: "ত্রিকোণমিতি অনুশীলনী — ১০টি সমস্যা", assignedOn: "গতকাল" },
  { batch: "Recovery Batch — A", title: "সূচক ও লগারিদম — মৌলিক সমস্যা", assignedOn: "২ দিন আগে" },
];

export const demoNotices = [
  { title: "মাসিক মূল্যায়নের নম্বর এন্ট্রি আগামী সপ্তাহে শুরু হবে", category: "Examination" },
  { title: "নতুন Recovery ব্যাচ শুরুর তারিখ পরে জানানো হবে", category: "Academic" },
];
