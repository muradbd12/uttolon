"use client";

import { useState } from "react";
import { Info } from "lucide-react";

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

export default function AuthForm({
  idLabel,
  idPlaceholder,
}: {
  idLabel: string;
  idPlaceholder: string;
}) {
  const [tried, setTried] = useState(false);

  if (tried) {
    return (
      <div className="rounded-sm border border-gold/30 bg-gold-soft/40 p-6">
        <div className="flex gap-3">
          <Info size={18} className="mt-0.5 shrink-0 text-gold-deep" />
          <div>
            <h3 className="font-display-bn text-base text-ink">লগইন সিস্টেম এখনো সংযুক্ত হয়নি</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              এই মুহূর্তে অ্যাকাউন্ট যাচাই করার ব্যাকএন্ড এখনো যুক্ত হয়নি, তাই কোনো
              ID/Password দিয়ে এখনো প্রবেশ করা যাবে না। এই ফিচারটি চালু হলে এখানেই
              জানানো হবে।
            </p>
            <button
              type="button"
              onClick={() => setTried(false)}
              className="mt-4 text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
            >
              ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
      }}
      className="space-y-5"
    >
      <label className="block">
        <span className="text-sm font-medium text-ink">{idLabel}</span>
        <input required type="text" className={`mt-1.5 ${inputClass}`} placeholder={idPlaceholder} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">পাসওয়ার্ড</span>
        <input required type="password" className={`mt-1.5 ${inputClass}`} />
      </label>
      <button
        type="submit"
        className="w-full rounded-sm bg-ink py-3.5 text-sm font-medium text-paper transition-colors hover:bg-gold-deep"
      >
        লগইন করুন
      </button>
    </form>
  );
}
