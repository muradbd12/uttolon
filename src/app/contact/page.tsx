import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "যোগাযোগ | Uttolon",
  description: "উত্তোলনের সাথে যোগাযোগ করুন।",
};

const info = [
  { icon: MapPin, label: "ঠিকানা", value: "শীঘ্রই যুক্ত হবে" },
  { icon: Phone, label: "ফোন", value: "শীঘ্রই যুক্ত হবে" },
  { icon: Mail, label: "ইমেইল", value: "শীঘ্রই যুক্ত হবে" },
  { icon: Clock, label: "অফিস সময়", value: "শীঘ্রই যুক্ত হবে" },
];

export default function ContactPage() {
  return (
    <section>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2">
        <div>
          <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">যোগাযোগ</p>
          <h1 className="mt-4 font-display-bn text-3xl text-ink sm:text-4xl">কথা বলুন আমাদের সাথে</h1>
          <div className="mt-8 space-y-5">
            {info.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon size={17} className="mt-0.5 shrink-0 text-gold-deep" />
                <div>
                  <p className="text-sm text-ink-soft">{label}</p>
                  <p className="text-[15px] text-ink">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
