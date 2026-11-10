"use client";

import type { Certificate } from "@/lib/certificates";

type CertData = Pick<Certificate, "certNo" | "verifyCode" | "studentName" | "className" | "studentId" | "title" | "description" | "issuedDate">;

// Printable landscape A4 certificate. Print it with printIsolated(id, { landscape: true }).
export default function CertificateCard({ cert, id = "printable-certificate" }: { cert: CertData; id?: string }) {
  const dateText = cert.issuedDate
    ? new Date(`${cert.issuedDate}T00:00:00`).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })
    : "";
  const sub = [cert.className, cert.studentId ? `স্টুডেন্ট আইডি: ${cert.studentId}` : ""].filter(Boolean).join("  ·  ");

  return (
    <div id={id} className="mx-auto w-full max-w-[1000px] bg-white text-ink print:h-[190mm] print:w-[277mm] print:max-w-none">
      <div
        className="relative flex aspect-[297/210] w-full flex-col items-center justify-between p-4 text-center sm:p-8 print:aspect-auto print:h-full print:p-[10mm]"
        style={{ background: "linear-gradient(180deg,#fffdf6,#fbf5e3)", border: "7px solid #14213b" }}
      >
        <div className="pointer-events-none absolute inset-2 sm:inset-3" style={{ border: "2px solid #c9932e" }} />
        {["left-3 top-3 border-l-4 border-t-4", "right-3 top-3 border-r-4 border-t-4", "bottom-3 left-3 border-b-4 border-l-4", "bottom-3 right-3 border-b-4 border-r-4"].map((c) => (
          <span key={c} className={`pointer-events-none absolute h-6 w-6 sm:h-9 sm:w-9 ${c}`} style={{ borderColor: "#14213b" }} />
        ))}

        <div className="relative flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/uttolon-logo.png" alt="উত্তোলন" className="h-10 w-10 object-contain sm:h-16 sm:w-16 print:h-16 print:w-16" />
          <p className="mt-1 font-display-bn text-lg sm:text-2xl print:text-2xl">উত্তোলন</p>
          <p className="font-label text-[8px] uppercase tracking-[0.22em] text-ink-soft sm:text-[11px] print:text-[11px]">Uttolon Learning System</p>
        </div>

        <div className="relative flex w-full flex-col items-center">
          <p className="font-display-bn text-2xl text-[#96691c] sm:text-5xl print:text-5xl">সনদপত্র</p>
          <p className="font-label text-[9px] uppercase tracking-[0.35em] text-ink-soft sm:text-xs print:text-xs">Certificate</p>
          <p className="mt-2 text-[11px] text-ink-soft sm:mt-4 sm:text-base print:mt-4 print:text-base">এই মর্মে প্রত্যয়ন করা যাচ্ছে যে</p>
          <p
            className="mt-1 max-w-[90%] px-6 pb-1 font-display-bn text-xl font-semibold leading-tight sm:mt-2 sm:text-4xl print:mt-2 print:text-4xl"
            style={{ borderBottom: "2px solid #c9932e" }}
          >
            {cert.studentName}
          </p>
          {sub && <p className="mt-1.5 text-[10px] text-ink-soft sm:text-sm print:text-sm">{sub}</p>}
          <p className="mt-2 text-[11px] text-ink-soft sm:mt-4 sm:text-base print:mt-4 print:text-base">উত্তোলন কর্তৃক প্রদত্ত</p>
          <p className="mt-0.5 max-w-[88%] font-display-bn text-sm font-semibold sm:text-2xl print:text-2xl">{cert.title}</p>
          {cert.description && (
            <p className="mt-1.5 max-w-[80%] text-[10px] leading-relaxed text-ink-soft sm:mt-3 sm:text-sm print:mt-3 print:text-sm">
              {cert.description}
            </p>
          )}
        </div>

        <div className="relative flex w-full items-end justify-between gap-2 text-[9px] sm:text-sm print:text-sm">
          <div className="text-left">
            <p className="font-semibold">তারিখ</p>
            <p className="text-ink-soft">{dateText}</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">সনদ নং {cert.certNo}</p>
            <p className="text-[8px] text-ink-soft sm:text-xs print:text-xs">
              যাচাই: uttolonbd.com/verify — কোড <strong className="tracking-wider">{cert.verifyCode}</strong>
            </p>
          </div>
          <div className="text-center">
            <div className="mb-0.5 w-20 sm:w-40 print:w-40" style={{ borderTop: "1.5px solid #14213b" }} />
            <p className="font-semibold">কর্তৃপক্ষের স্বাক্ষর</p>
          </div>
        </div>
      </div>
    </div>
  );
}
