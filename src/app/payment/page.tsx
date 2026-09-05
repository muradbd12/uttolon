import type { Metadata } from "next";
import PaymentLookup from "@/components/PaymentLookup";

export const metadata: Metadata = {
  title: "পেমেন্ট | Uttolon",
};

export default function PaymentPage() {
  return (
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <h1 className="font-display-bn text-2xl text-ink sm:text-3xl">পেমেন্ট করুন</h1>
        <p className="mt-2 text-sm text-ink-soft">
          আপনার মোবাইল নম্বর ও আবেদন আইডি দিয়ে বকেয়া দেখুন এবং পরিশোধ করুন।
        </p>
        <div className="mt-8">
          <PaymentLookup />
        </div>
      </div>
    </section>
  );
}
