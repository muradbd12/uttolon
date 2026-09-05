import type { Metadata } from "next";
import PracticalLearningGallery from "@/components/PracticalLearningGallery";

export const metadata: Metadata = {
  title: "Practical Learning | Uttolon",
  description: "সূত্র মুখস্থ নয় — বাস্তব পরীক্ষণ ও পর্যবেক্ষণের মাধ্যমে শেখা। উত্তোলনের হাতে-কলমে শেখার ঝলক।",
};

export default function PracticalLearningPage() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="font-label text-xs uppercase tracking-[0.2em] text-teal">Practical Learning</p>
        <h1 className="mt-4 font-display-bn text-3xl text-ink sm:text-4xl">শেখা হবে হাতে-কলমে</h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          সূত্র মুখস্থ নয় — প্রতিটি ধারণা যাচাই হয় বাস্তব পরীক্ষণ ও পর্যবেক্ষণের মাধ্যমে।
          এখানে আমাদের ক্লাসরুমের কিছু বাস্তব মুহূর্ত তুলে ধরা হলো।
        </p>
        <PracticalLearningGallery />
      </div>
    </section>
  );
}
