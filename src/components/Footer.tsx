import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const CONTACT = {
  address: "Qatari Tower, College Road, Amishapara, Sonaimuri, Noakhali",
  phones: ["01824-020933", "01577-886349"],
  email: "info@uttolonbd.com",
  facebook: "https://www.facebook.com/share/1GjxNBcK3u/",
  youtube: "https://www.youtube.com/@uttolon",
};

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
              href={CONTACT.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook Page"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/20 text-paper/70 transition-colors hover:border-gold hover:text-gold"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
              </svg>
            </a>
            <a
              href={CONTACT.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube Channel"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/20 text-paper/70 transition-colors hover:border-gold hover:text-gold"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.5 6.5s-.23-1.64-.94-2.36c-.9-.95-1.9-.95-2.36-1.01C16.9 2.8 12 2.8 12 2.8h-.01s-4.9 0-8.2.33c-.46.06-1.46.06-2.36 1.01C.72 4.86.5 6.5.5 6.5S.27 8.42.27 10.35v1.31C.27 13.58.5 15.5.5 15.5s.23 1.64.93 2.36c.9.96 2.08.93 2.6 1.03 1.9.18 8.07.24 8.07.24s4.9-.01 8.2-.34c.46-.06 1.46-.06 2.36-1.02.7-.72.94-2.36.94-2.36s.23-1.92.23-3.85v-1.31c0-1.93-.23-3.85-.23-3.85ZM9.7 14.87V7.98l6.5 3.45-6.5 3.44Z" />
              </svg>
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
              <span>{CONTACT.address}</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone size={15} className="mt-0.5 shrink-0 text-gold" />
              <span>{CONTACT.phones.join(" · ")}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={15} className="shrink-0 text-gold" />
              <a href={`mailto:${CONTACT.email}`} className="hover:text-gold">
                {CONTACT.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-5 py-5 text-xs text-paper/50 sm:px-8">
          <span>© {new Date().getFullYear()} Uttolon Learning System. All Rights Reserved.</span>
          <span>
            Developed by{" "}
            <a
              href="https://murad.uttolonbd.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-paper/70 hover:text-gold"
            >
              Mosharraf Hossain Murad
            </a>
            , Electrical Engineer &amp; IT Specialist
          </span>
        </div>
      </div>
    </footer>
  );
}
