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
                <Phone size={15} className="text-gold-deep" /> 01824-020933 · 01577-886349
              </p>
              <p className="flex items-center gap-2">
                <Mail size={15} className="text-gold-deep" /> info@uttolonbd.com
              </p>
              <p className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-gold-deep" /> Qatari Tower, College Road,
                Amishapara, Sonaimuri, Noakhali
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
