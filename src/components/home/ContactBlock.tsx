import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function ContactBlock() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-label text-xs uppercase tracking-[0.2em] text-gold-deep">যোগাযোগ</p>
            <h2 className="mt-3 font-display-bn text-3xl text-ink sm:text-4xl">
              প্রশ্ন আছে? কথা বলুন আমাদের সাথে
            </h2>
            <div className="mt-6 space-y-3 text-sm text-ink-soft">
              <p className="flex items-center gap-2">
                <Phone size={15} className="text-gold-deep" /> ফোন নম্বর শীঘ্রই যুক্ত হবে
              </p>
              <p className="flex items-center gap-2">
                <Mail size={15} className="text-gold-deep" /> ইমেইল শীঘ্রই যুক্ত হবে
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={15} className="text-gold-deep" /> ঠিকানা শীঘ্রই যুক্ত হবে
              </p>
            </div>
          </div>
          <div className="flex lg:justify-end">
            <Link
              href="/contact"
              className="rounded-sm border border-ink px-6 py-3.5 text-sm font-medium text-ink hover:bg-ink hover:text-paper"
            >
              যোগাযোগ ফর্ম পূরণ করুন
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
