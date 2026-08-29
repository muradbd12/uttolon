import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-paper/90">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <span className="font-display-bn text-2xl text-paper">উত্তোলন</span>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper/65">
            শুধু পড়ানো নয়, শেখার একটি সম্পূর্ণ ব্যবস্থা। Concept, Practice,
            Assessment, Recovery ও Result — প্রতিটি ধাপে শিক্ষার্থীর পাশে।
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="#"
              aria-label="Facebook Page"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/20 text-xs font-semibold text-paper/70 transition-colors hover:border-gold hover:text-gold"
            >
              f
            </a>
            <a
              href="#"
              aria-label="YouTube Channel"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/20 text-[10px] font-semibold text-paper/70 transition-colors hover:border-gold hover:text-gold"
            >
              YT
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-label text-xs uppercase tracking-[0.15em] text-paper/50">Quick Links</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-paper/75">
            <li><Link href="/about" className="hover:text-gold">উত্তোলন সম্পর্কে</Link></li>
            <li><Link href="/programs" className="hover:text-gold">প্রোগ্রাম</Link></li>
            <li><Link href="/teachers" className="hover:text-gold">শিক্ষক</Link></li>
            <li><Link href="/admission" className="hover:text-gold">ভর্তি</Link></li>
            <li><Link href="/blog" className="hover:text-gold">ব্লগ</Link></li>
            <li><Link href="/notices" className="hover:text-gold">নোটিশ</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-label text-xs uppercase tracking-[0.15em] text-paper/50">Student &amp; Guardian</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-paper/75">
            <li><Link href="/student/login" className="hover:text-gold">স্টুডেন্ট লগইন</Link></li>
            <li><Link href="/guardian/login" className="hover:text-gold">গার্ডিয়ান লগইন</Link></li>
            <li><Link href="/resources" className="hover:text-gold">রিসোর্স</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-label text-xs uppercase tracking-[0.15em] text-paper/50">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-paper/75">
            <li className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 shrink-0 text-gold" />
              <span>ঠিকানা শীঘ্রই যুক্ত হবে</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={15} className="shrink-0 text-gold" />
              <span>শীঘ্রই যুক্ত হবে</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={15} className="shrink-0 text-gold" />
              <span>শীঘ্রই যুক্ত হবে</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="mx-auto max-w-7xl px-5 py-5 text-xs text-paper/50 sm:px-8">
          © {new Date().getFullYear()} Uttolon Learning System. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
