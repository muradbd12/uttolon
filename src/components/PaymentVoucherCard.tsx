export type VoucherData = {
  studentNameBn?: string;
  studentNameEn?: string;
  applicationId?: string;
  className?: string;
  group?: string;
  program?: string;
  mobile?: string;

  voucherId: string;
  paymentDate: string;
  amountPaidNow: number;
  method: string;
  monthOrPurpose?: string;
  note?: string;

  totalFee: number;
  totalPaid: number;
  due: number;
};

function fmtTaka(n: number) {
  return `৳${n.toLocaleString("bn-BD")}`;
}

function Item({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[8.5px] text-ink-soft/60">{label}</dt>
      <dd className="text-[10.5px] leading-tight text-ink">{value || "—"}</dd>
    </div>
  );
}

export default function PaymentVoucherCard({ data }: { data: VoucherData }) {
  const isFullyPaid = data.due <= 0;
  const isPartial = data.due > 0 && data.totalPaid > 0;
  const statusLabel = isFullyPaid ? "সম্পূর্ণ পরিশোধ" : isPartial ? "আংশিক পরিশোধ" : "বকেয়া";
  const statusClass = isFullyPaid
    ? "bg-teal-soft text-teal-deep"
    : isPartial
    ? "bg-gold-soft text-gold-deep"
    : "bg-clay-soft text-clay";

  return (
    <div id="printable-voucher" className="rounded-sm border border-line bg-paper p-3 text-[10.5px] sm:p-4 print:mt-0 print:border-none print:p-0">
      <div className="flex items-center justify-between border-b-2 border-teal-deep pb-1.5 print:break-inside-avoid">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/uttolon-logo.png" alt="উত্তোলন" className="h-8 w-8 object-contain" />
          <div>
            <p className="font-display-bn text-sm leading-none text-ink">উত্তোলন</p>
            <p className="font-display-en text-[9px] tracking-wide text-ink-soft">Uttolon Learning System</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block rounded-full bg-gold-soft px-2 py-0.5 text-[8.5px] font-bold uppercase text-gold-deep">
            পেমেন্ট ভাউচার
          </span>
          <p className="mt-0.5 font-display-en text-[10.5px] text-ink">
            ভাউচার: {data.voucherId} · তারিখ: {data.paymentDate}
          </p>
        </div>
      </div>

      <div className="mt-1.5 rounded-sm bg-teal-deep px-2 py-0.5 text-[9px] font-bold text-paper">শিক্ষার্থীর তথ্য</div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border border-t-0 border-line p-1.5 sm:grid-cols-4 print:break-inside-avoid">
        <Item label="নাম (বাংলায়)" value={data.studentNameBn} />
        <Item label="নাম (ইংরেজি)" value={data.studentNameEn} />
        <Item label="আবেদন আইডি" value={data.applicationId} />
        <Item label="মোবাইল" value={data.mobile} />
        <Item label="শ্রেণি / গ্রুপ" value={`${data.className || ""}${data.group ? " / " + data.group : ""}`} />
        <Item label="প্রোগ্রাম" value={data.program} />
        <Item label="পদ্ধতি" value={data.method} />
        <Item label="উদ্দেশ্য / মাস" value={data.monthOrPurpose} />
      </dl>

      <div className="mt-2 rounded-sm border-2 border-ink p-2 print:break-inside-avoid">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">এই পেমেন্টে জমা</span>
          <span className={`rounded-full px-2 py-0.5 text-[8.5px] font-bold ${statusClass}`}>{statusLabel}</span>
        </div>
        <p className="mt-1 font-display-en text-xl font-bold text-ink">{fmtTaka(data.amountPaidNow)}</p>

        <div className="mt-2 grid grid-cols-3 gap-2 border-t border-line pt-2 text-center">
          <div>
            <p className="text-[8px] text-ink-soft/60">মোট ফি</p>
            <p className="text-[11px] font-bold text-ink">{fmtTaka(data.totalFee)}</p>
          </div>
          <div className="border-x border-line">
            <p className="text-[8px] text-ink-soft/60">সর্বমোট পরিশোধিত</p>
            <p className="text-[11px] font-bold text-teal-deep">{fmtTaka(data.totalPaid)}</p>
          </div>
          <div>
            <p className="text-[8px] text-ink-soft/60">বর্তমান বকেয়া</p>
            <p className={`text-[11px] font-bold ${data.due > 0 ? "text-clay" : "text-teal-deep"}`}>
              {fmtTaka(Math.max(data.due, 0))}
            </p>
          </div>
        </div>
      </div>

      {data.note && (
        <p className="mt-1.5 border border-line p-1.5 text-[10px] text-ink-soft print:break-inside-avoid">
          <span className="text-[8.5px] text-ink-soft/60">মন্তব্য: </span>{data.note}
        </p>
      )}

      <div className="mt-3 flex justify-between print:break-inside-avoid">
        <span className="border-t border-ink-soft/40 px-6 pt-0.5 text-[9px] font-medium text-ink">
          পরিশোধকারীর স্বাক্ষর
        </span>
        <span className="border-t border-ink-soft/40 px-6 pt-0.5 text-[9px] font-medium text-ink">
          গ্রহণকারীর স্বাক্ষর (অফিস)
        </span>
      </div>

      <div className="mt-2 flex flex-col items-center gap-0.5 border-t border-line pt-1 text-center text-[8px] text-ink-soft/70 sm:flex-row sm:justify-between">
        <span>কাতারী টাওয়ার, কলেজ রোড, আমিশাপাড়া, সোনাইমুড়ী, নোয়াখালী</span>
        <span className="font-medium text-ink">www.uttolonbd.com</span>
        <span>info@uttolonbd.com</span>
      </div>
    </div>
  );
}
