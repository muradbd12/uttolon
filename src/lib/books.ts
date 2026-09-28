export type Book = {
  id: string;
  title: string;
  author?: string;
  category: "school" | "university";
  level: string; // যেমন: "Class 6", "SSC", "HSC", "ঢাবি ক ইউনিট"
  subject: string;
  price: number;
  coverImageUrl?: string;
  description?: string;
  inStock: boolean;
};

export const SCHOOL_LEVELS = [
  "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8",
  "Class 9", "Class 10", "SSC", "Dakhil", "Alim", "HSC",
];

export const UNIVERSITY_LEVELS = [
  "বিশ্ববিদ্যালয় ভর্তি — বিজ্ঞান", "বিশ্ববিদ্যালয় ভর্তি — মানবিক",
  "বিশ্ববিদ্যালয় ভর্তি — বাণিজ্য", "মেডিকেল ভর্তি", "ইঞ্জিনিয়ারিং ভর্তি",
];

export const ALL_LEVELS = [...SCHOOL_LEVELS, ...UNIVERSITY_LEVELS];

export const SUBJECTS = [
  "বাংলা", "English", "গণিত", "পদার্থবিজ্ঞান", "রসায়ন", "জীববিজ্ঞান",
  "উচ্চতর গণিত", "তথ্য ও যোগাযোগ প্রযুক্তি", "আরবি", "কুরআন ও তাজবীদ",
  "ইতিহাস", "ভূগোল", "সমাজবিজ্ঞান", "IELTS", "গাইড/সহায়ক বই", "অন্যান্য",
];

// WhatsApp-এ অর্ডার করার লিংক — এখনই একটা সম্পূর্ণ কার্ট/চেকআউট
// সিস্টেম না বানিয়ে, প্রতিষ্ঠানের নিজস্ব WhatsApp নম্বরে সরাসরি
// অর্ডার বার্তা পাঠানোর ব্যবস্থা — এটা সম্পূর্ণ ফ্রি, কোনো পেমেন্ট
// গেটওয়ে লাগে না।
const WHATSAPP_NUMBER = "8801824020933";

export function whatsappOrderLink(book: Pick<Book, "title" | "price">) {
  const message = `আসসালামু আলাইকুম, আমি "${book.title}" (৳${book.price}) বইটি অর্ডার করতে চাই।`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
