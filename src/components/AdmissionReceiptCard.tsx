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
      <dt className="text-xs text-ink-soft/60">{label}</dt>
      <dd className="text-ink">{value || "—"}</dd>
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
    <div className="rounded-sm border border-line bg-paper p-6 sm:p-8 print:mt-0 print:border-none print:p-0">
      <div className="flex items-center justify-between border-b-2 border-teal-deep pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-tr from-gold to-teal-deep text-lg font-black text-paper">
            উ
          </div>
          <div>
            <p className="font-display-bn text-xl leading-none text-ink">উত্তোলন</p>
            <p className="font-display-en text-xs tracking-wide text-ink-soft">Uttolon Learning System</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block rounded-full bg-gold-soft px-3 py-1 text-[11px] font-bold uppercase text-gold-deep">
            ভর্তি আবেদনের রশিদ (Office Copy)
          </span>
          {applicationId && <p className="mt-1 font-display-en text-sm text-ink">আইডি: {applicationId}</p>}
          {dateLabel && <p className="text-xs text-ink-soft/60">জমার তারিখ: {dateLabel}</p>}
        </div>
      </div>

      <div className="mt-4 rounded-sm bg-teal-deep px-3 py-1 text-xs font-bold text-paper">শিক্ষার্থীর তথ্য</div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 border border-t-0 border-line p-3 text-sm sm:grid-cols-3">
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

      <div className="mt-3 rounded-sm bg-teal-deep px-3 py-1 text-xs font-bold text-paper">পিতা-মাতা / অভিভাবকের তথ্য</div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 border border-t-0 border-line p-3 text-sm sm:grid-cols-3">
        <Item label="পিতার নাম" value={data.fatherName} />
        <Item label="মাতার নাম" value={data.motherName} />
        <Item label="অভিভাবকের নাম" value={data.guardianName} />
        <Item label="অভিভাবকের মোবাইল" value={data.guardianMobile} />
        <Item label="অভিভাবকের পেশা" value={data.guardianOccupation} />
        <Item label="মাসিক আয় (প্রায়)" value={data.monthlyIncome} />
      </dl>

      <div className="mt-3 rounded-sm bg-teal-deep px-3 py-1 text-xs font-bold text-paper">যোগাযোগের তথ্য</div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 border border-t-0 border-line p-3 text-sm sm:grid-cols-3">
        <Item label="ঠিকানা" value={data.address} />
        <Item label="থানা/উপজেলা" value={data.thana} />
        <Item label="জেলা" value={data.district} />
        <Item label="পোস্ট কোড" value={data.postCode} />
      </dl>

      <div className="mt-3 rounded-sm bg-teal-deep px-3 py-1 text-xs font-bold text-paper">একাডেমিক ও প্রোগ্রাম তথ্য</div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 border border-t-0 border-line p-3 text-sm sm:grid-cols-3">
        <Item label="পূর্ববর্তী প্রতিষ্ঠান" value={data.previousInstitution} />
        <Item label="পরীক্ষা / পাশের সাল" value={`${data.examName || "—"} / ${data.passingYear || "—"}`} />
        <Item label="প্রাপ্ত ফলাফল" value={data.previousResult} />
        <Item label="দুর্বল বিষয়" value={data.weakSubjects} />
        <Item label="প্রোগ্রাম" value={data.program} />
        <Item label="ব্যাচ" value={data.batch} />
        <Item label="পছন্দের বিষয়" value={data.preferredSubject} />
        <Item label="ক্লাস শিডিউল (পছন্দে)" value={data.classSchedule} />
        <Item label="কিভাবে জানলেন" value={data.referralSource === "অন্যান্য" ? data.referralOther : data.referralSource} />
      </dl>
      {data.specialComments && (
        <p className="mt-2 border border-t-0 border-line p-3 text-sm text-ink-soft">
          <span className="text-xs text-ink-soft/60">বিশেষ মন্তব্য: </span>{data.specialComments}
        </p>
      )}

      <div className="mt-4 rounded-sm border border-gold-soft bg-gold-soft/40 p-3 text-[11px] leading-relaxed text-ink-soft">
        <strong className="text-ink">অঙ্গীকারনামা:</strong> আমি/আমার সন্তান এই মর্মে অঙ্গীকার করিতেছি যে, উপরে
        উল্লেখিত সকল তথ্য সঠিক ও নির্ভুল। কোর্স চলাকালীন সময়ে কর্তৃপক্ষের যাবতীয়
        নিয়ম-শৃঙ্খলা মানিয়া চলিব এবং নির্ধারিত ফি পরিশোধে বাধ্য থাকিব।
        <div className="mt-6 flex justify-end">
          <span className="border-t border-ink-soft/40 px-6 pt-0.5 text-xs font-medium text-ink">
            ছাত্র/ছাত্রী বা অভিভাবকের স্বাক্ষর
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-sm border-2 border-ink">
        <div className="bg-ink py-1.5 text-center text-xs font-bold tracking-wider text-paper">
          অফিসিয়াল ব্যবহারের জন্য (OFFICIAL USE ONLY)
        </div>
        <div className="space-y-2.5 bg-paper-raised p-3 text-[11px]">
          <div className="grid grid-cols-2 gap-2 border-b border-line pb-2 sm:grid-cols-4">
            <div><strong>Batch:</strong> ....................</div>
            <div><strong>Roll/ID:</strong> ....................</div>
            <div><strong>Shift:</strong> ....................</div>
            <div><strong>ভর্তির তারিখ:</strong> ....................</div>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-b border-line pb-2">
            <strong className="text-ink-soft">Course:</strong>
            <label className="flex items-center gap-1"><input type="checkbox" /> Science Solution</label>
            <label className="flex items-center gap-1"><input type="checkbox" /> Commerce Solution</label>
            <label className="flex items-center gap-1"><input type="checkbox" /> Combined Solution</label>
            <label className="flex items-center gap-1"><input type="checkbox" /> Only Exam</label>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b border-line pb-2">
            <div><strong>Total Fee:</strong> ....................</div>
            <div><strong>Concession:</strong> ....................</div>
            <div><strong>Reference:</strong> ....................</div>
          </div>
          <table className="w-full border-collapse border border-line bg-paper text-center text-[10px]">
            <thead>
              <tr className="bg-line/40">
                <th className="border border-line p-1">Date</th>
                <th className="border border-line p-1">Payment</th>
                <th className="border border-line p-1">Due</th>
                <th className="border border-line p-1">Receiver&apos;s Sign</th>
                <th className="border border-line p-1">Next Payment Date</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2].map((row) => (
                <tr key={row}>
                  <td className="border border-line p-2.5">&nbsp;</td>
                  <td className="border border-line p-2.5"></td>
                  <td className="border border-line p-2.5"></td>
                  <td className="border border-line p-2.5"></td>
                  <td className="border border-line p-2.5"></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-1"><input type="checkbox" /> ID Card</label>
              <label className="flex items-center gap-1"><input type="checkbox" /> Admit Card</label>
              <label className="flex items-center gap-1"><input type="checkbox" /> Suggestion</label>
              <label className="flex items-center gap-1"><input type="checkbox" /> Gift</label>
            </div>
            <div className="flex gap-8">
              <span className="border-t border-ink-soft/40 px-3 pt-0.5">Co-ordinator</span>
              <span className="border-t border-ink-soft/40 px-3 pt-0.5">Executive Director</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-0.5 border-t border-line pt-3 text-center text-[10px] text-ink-soft/70 sm:flex-row sm:justify-between">
        <span>কাতারী টাওয়ার, কলেজ রোড, আমিশাপাড়া, সোনাইমুড়ী, নোয়াখালী</span>
        <span className="font-medium text-ink">www.uttolonbd.com</span>
        <span>info@uttolonbd.com</span>
      </div>
    </div>
  );
}
