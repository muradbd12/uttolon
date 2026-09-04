export type ReceiptData = {
  studentNameBn?: string;
  studentNameEn?: string;
  dob?: string;
  gender?: string;
  className?: string;
  group?: string;
  rollNumber?: string;
  studentIdNumber?: string;
  religion?: string;
  nationality?: string;
  mobile?: string;
  email?: string;

  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  guardianMobile?: string;
  guardianOccupation?: string;
  monthlyIncome?: string;

  address?: string;
  thana?: string;
  district?: string;
  postCode?: string;

  previousInstitution?: string;
  examName?: string;
  passingYear?: string;
  previousResult?: string;
  weakSubjects?: string;
  specialComments?: string;

  program?: string;
  batch?: string;
  preferredSubject?: string;
  classSchedule?: string;

  referralSource?: string;
  referralOther?: string;
};

function Item({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[8.5px] text-ink-soft/60">{label}</dt>
      <dd className="text-[10.5px] leading-tight text-ink">{value || "—"}</dd>
    </div>
  );
}

function SectionBar({ title }: { title: string }) {
  return (
    <div className="mt-1.5 rounded-sm bg-teal-deep px-2 py-0.5 text-[9px] font-bold text-paper print:break-inside-avoid">
      {title}
    </div>
  );
}

export default function AdmissionReceiptCard({
  data,
  applicationId,
  dateLabel,
}: {
  data: ReceiptData;
  applicationId?: string;
  dateLabel?: string;
}) {
  return (
    <div className="rounded-sm border border-line bg-paper p-3 text-[10.5px] sm:p-4 print:mt-0 print:border-none print:p-0">
      {/* ===== OFFICE COPY ===== */}
      <div className="flex items-center justify-between border-b-2 border-teal-deep pb-1.5 print:break-inside-avoid">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-tr from-gold to-teal-deep text-sm font-black text-paper">
            উ
          </div>
          <div>
            <p className="font-display-bn text-sm leading-none text-ink">উত্তোলন</p>
            <p className="font-display-en text-[9px] tracking-wide text-ink-soft">Uttolon Learning System</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block rounded-full bg-gold-soft px-2 py-0.5 text-[8.5px] font-bold uppercase text-gold-deep">
            অফিস কপি (Office Copy)
          </span>
          <p className="mt-0.5 font-display-en text-[10.5px] text-ink">
            {applicationId && <>আইডি: {applicationId}</>}
            {applicationId && dateLabel && " · "}
            {dateLabel && <>জমা: {dateLabel}</>}
          </p>
        </div>
      </div>

      <SectionBar title="শিক্ষার্থীর তথ্য" />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border border-t-0 border-line p-1.5 sm:grid-cols-4 print:break-inside-avoid">
        <Item label="নাম (বাংলায়)" value={data.studentNameBn} />
        <Item label="নাম (ইংরেজি)" value={data.studentNameEn} />
        <Item label="জন্ম তারিখ" value={data.dob} />
        <Item label="লিঙ্গ" value={data.gender} />
        <Item label="শ্রেণি / গ্রুপ" value={`${data.className || ""}${data.group ? " / " + data.group : ""}`} />
        <Item label="রোল নম্বর" value={data.rollNumber} />
        <Item label="ছাত্র/ছাত্রী আইডি" value={data.studentIdNumber} />
        <Item label="ধর্ম / জাতীয়তা" value={`${data.religion || "—"} / ${data.nationality || "—"}`} />
        <Item label="মোবাইল" value={data.mobile} />
        <Item label="ইমেইল" value={data.email} />
      </dl>

      <SectionBar title="পিতা-মাতা / অভিভাবকের তথ্য" />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border border-t-0 border-line p-1.5 sm:grid-cols-4 print:break-inside-avoid">
        <Item label="পিতার নাম" value={data.fatherName} />
        <Item label="মাতার নাম" value={data.motherName} />
        <Item label="অভিভাবকের নাম" value={data.guardianName} />
        <Item label="অভিভাবকের মোবাইল" value={data.guardianMobile} />
        <Item label="অভিভাবকের পেশা" value={data.guardianOccupation} />
        <Item label="মাসিক আয় (প্রায়)" value={data.monthlyIncome} />
      </dl>

      <SectionBar title="যোগাযোগের তথ্য" />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border border-t-0 border-line p-1.5 sm:grid-cols-4 print:break-inside-avoid">
        <Item label="ঠিকানা" value={data.address} />
        <Item label="থানা/উপজেলা" value={data.thana} />
        <Item label="জেলা" value={data.district} />
        <Item label="পোস্ট কোড" value={data.postCode} />
      </dl>

      <SectionBar title="একাডেমিক ও প্রোগ্রাম তথ্য" />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border border-t-0 border-line p-1.5 sm:grid-cols-4 print:break-inside-avoid">
        <Item label="পূর্ববর্তী প্রতিষ্ঠান" value={data.previousInstitution} />
        <Item label="পরীক্ষা / সাল" value={`${data.examName || "—"} / ${data.passingYear || "—"}`} />
        <Item label="প্রাপ্ত ফলাফল" value={data.previousResult} />
        <Item label="দুর্বল বিষয়" value={data.weakSubjects} />
        <Item label="প্রোগ্রাম" value={data.program} />
        <Item label="ব্যাচ" value={data.batch} />
        <Item label="পছন্দের বিষয়" value={data.preferredSubject} />
        <Item label="ক্লাস শিডিউল" value={data.classSchedule} />
        <Item label="কিভাবে জানলেন" value={data.referralSource === "অন্যান্য" ? data.referralOther : data.referralSource} />
      </dl>
      {data.specialComments && (
        <p className="mt-1 border border-t-0 border-line p-1.5 text-[10px] text-ink-soft">
          <span className="text-[8.5px] text-ink-soft/60">মন্তব্য: </span>{data.specialComments}
        </p>
      )}

      <div className="mt-1.5 rounded-sm border border-gold-soft bg-gold-soft/40 p-1.5 text-[9px] leading-snug text-ink-soft print:break-inside-avoid">
        <strong className="text-ink">অঙ্গীকারনামা:</strong> আমি/আমার সন্তান এই মর্মে অঙ্গীকার করিতেছি যে, উপরে
        উল্লেখিত সকল তথ্য সঠিক ও নির্ভুল। কোর্স চলাকালীন সময়ে কর্তৃপক্ষের যাবতীয়
        নিয়ম-শৃঙ্খলা মানিয়া চলিব এবং নির্ধারিত ফি পরিশোধে বাধ্য থাকিব।
        <div className="mt-2 flex justify-end">
          <span className="border-t border-ink-soft/40 px-6 pt-0.5 text-[9px] font-medium text-ink">
            ছাত্র/ছাত্রী বা অভিভাবকের স্বাক্ষর
          </span>
        </div>
      </div>

      <div className="mt-1.5 overflow-hidden rounded-sm border-2 border-ink print:break-inside-avoid">
        <div className="bg-ink py-1 text-center text-[9px] font-bold tracking-wider text-paper">
          অফিসিয়াল ব্যবহারের জন্য (OFFICIAL USE ONLY)
        </div>
        <div className="space-y-1.5 bg-paper-raised p-1.5 text-[9px]">
          <div className="grid grid-cols-2 gap-1.5 border-b border-line pb-1 sm:grid-cols-4">
            <div><strong>Batch:</strong> .............</div>
            <div><strong>Roll/ID:</strong> .............</div>
            <div><strong>Shift:</strong> .............</div>
            <div><strong>ভর্তির তারিখ:</strong> .............</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-b border-line pb-1">
            <strong className="text-ink-soft">Course:</strong>
            <label className="flex items-center gap-1"><input type="checkbox" /> Science</label>
            <label className="flex items-center gap-1"><input type="checkbox" /> Commerce</label>
            <label className="flex items-center gap-1"><input type="checkbox" /> Combined</label>
            <label className="flex items-center gap-1"><input type="checkbox" /> Only Exam</label>
          </div>
          <div className="grid grid-cols-3 gap-1.5 border-b border-line pb-1">
            <div><strong>Total Fee:</strong> .............</div>
            <div><strong>Concession:</strong> .............</div>
            <div><strong>Reference:</strong> .............</div>
          </div>
          <table className="w-full border-collapse border border-line bg-paper text-center text-[8px]">
            <thead>
              <tr className="bg-line/40">
                <th className="border border-line p-0.5">Date</th>
                <th className="border border-line p-0.5">Payment</th>
                <th className="border border-line p-0.5">Due</th>
                <th className="border border-line p-0.5">Receiver&apos;s Sign</th>
                <th className="border border-line p-0.5">Next Payment Date</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1].map((row) => (
                <tr key={row}>
                  <td className="border border-line p-1.5">&nbsp;</td>
                  <td className="border border-line p-1.5"></td>
                  <td className="border border-line p-1.5"></td>
                  <td className="border border-line p-1.5"></td>
                  <td className="border border-line p-1.5"></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-1"><input type="checkbox" /> ID Card</label>
              <label className="flex items-center gap-1"><input type="checkbox" /> Admit Card</label>
              <label className="flex items-center gap-1"><input type="checkbox" /> Suggestion</label>
              <label className="flex items-center gap-1"><input type="checkbox" /> Gift</label>
            </div>
            <div className="flex gap-6">
              <span className="border-t border-ink-soft/40 px-2 pt-0.5">Co-ordinator</span>
              <span className="border-t border-ink-soft/40 px-2 pt-0.5">Executive Director</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-1.5 flex flex-col items-center gap-0.5 border-t border-line pt-1 text-center text-[8px] text-ink-soft/70 sm:flex-row sm:justify-between">
        <span>কাতারী টাওয়ার, কলেজ রোড, আমিশাপাড়া, সোনাইমুড়ী, নোয়াখালী</span>
        <span className="font-medium text-ink">www.uttolonbd.com</span>
        <span>info@uttolonbd.com</span>
      </div>

      {/* ===== কাটার লাইন ===== */}
      <p className="mt-3 mb-1.5 text-center text-[8px] tracking-widest text-ink-soft/50 print:break-inside-avoid">
        ✂ ------------------------------ এখান থেকে কেটে নিন / শিক্ষার্থীর কপি ------------------------------ ✂
      </p>

      {/* ===== STUDENT COPY (condensed stub) ===== */}
      <div className="flex items-center justify-between rounded-sm border border-dashed border-ink-soft/40 bg-paper-raised px-3 py-2 print:break-inside-avoid">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-gradient-to-tr from-gold to-teal-deep text-xs font-black text-paper">
            উ
          </div>
          <div>
            <p className="font-display-bn text-[11px] leading-none text-ink">উত্তোলন — শিক্ষার্থীর কপি (Student Copy)</p>
            <p className="mt-0.5 text-[8.5px] text-ink-soft/60">
              {applicationId && <>আইডি: {applicationId}</>}
              {applicationId && dateLabel && " · "}
              {dateLabel && <>জমা: {dateLabel}</>}
            </p>
          </div>
        </div>
      </div>
      <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 rounded-sm border border-line p-1.5 text-[10px] sm:grid-cols-4 print:break-inside-avoid">
        <Item label="নাম" value={data.studentNameBn || data.studentNameEn} />
        <Item label="শ্রেণি / গ্রুপ" value={`${data.className || ""}${data.group ? " / " + data.group : ""}`} />
        <Item label="প্রোগ্রাম" value={data.program} />
        <Item label="ব্যাচ" value={data.batch} />
        <Item label="অভিভাবকের মোবাইল" value={data.guardianMobile} />
        <Item label="মোবাইল" value={data.mobile} />
      </dl>
      <p className="mt-1 text-center text-[8px] text-ink-soft/60 print:break-inside-avoid">
        এই কপিটি নিজের কাছে সংরক্ষণ করুন — ভর্তি সংক্রান্ত যেকোনো যোগাযোগে এই আইডি প্রয়োজন হবে।
      </p>
    </div>
  );
}
