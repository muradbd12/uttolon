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
              <p className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
                  <Phone size={14} />
                </span>
                01824-020933 · 01577-886349
              </p>
              <p className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
                  <Mail size={14} />
                </span>
                info@uttolonbd.com
              </p>
              <p className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
                  <MapPin size={14} />
                </span>
                <span className="pt-1.5">Qatari Tower, College Road, Amishapara, Sonaimuri, Noakhali</span>
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
