"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-sm border border-teal/30 bg-teal-soft p-8 text-center">
        <CheckCircle2 className="mx-auto text-teal-deep" size={28} />
        <h3 className="mt-3 font-display-bn text-lg text-ink">বার্তাটি প্রস্তুত করা হয়েছে</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          ব্যাকএন্ড যুক্ত না হওয়া পর্যন্ত বার্তা এখনো পাঠানো/সংরক্ষিত হয়নি। জরুরি হলে
          সরাসরি ফোনে যোগাযোগ করুন।
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-5"
    >
      <label className="block">
        <span className="text-sm font-medium text-ink">নাম</span>
        <input required type="text" className={`mt-1.5 ${inputClass}`} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">ফোন নম্বর</span>
        <input required type="tel" className={`mt-1.5 ${inputClass}`} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">বিষয়</span>
        <input required type="text" className={`mt-1.5 ${inputClass}`} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">বার্তা</span>
        <textarea required rows={4} className={`mt-1.5 ${inputClass}`} />
      </label>
      <button
        type="submit"
        className="w-full rounded-sm bg-ink py-3.5 text-sm font-medium text-paper transition-colors hover:bg-gold-deep sm:w-auto sm:px-10"
      >
        বার্তা পাঠান
      </button>
    </form>
  );
}
