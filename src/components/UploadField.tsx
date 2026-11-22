"use client";

import { useRef, useState } from "react";
import { Loader2, UploadCloud, X, AlertCircle, FileText, RefreshCcw } from "lucide-react";
import { uploadFileToCloudinary, uploadImageToCloudinary } from "@/lib/cloudinary";

// One upload box used instead of "paste a link" fields. kind="image" accepts photos only
// (up to 30 MB, shrunk automatically); kind="file" also accepts PDFs, documents and videos.
// If `name` is given, a hidden input carries the uploaded URL so plain <form> submits keep working.
export default function UploadField({
  value,
  onChange,
  kind = "image",
  name,
  label,
  hint,
  disabled,
}: {
  value: string;
  onChange: (url: string) => void;
  kind?: "image" | "file";
  name?: string;
  label?: string;
  hint?: string;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = kind === "image" ? "image/*" : "image/*,application/pdf,video/*,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt";
  const isImageUrl = kind === "image" || /\.(jpe?g|png|gif|webp|avif)(\?|$)/i.test(value);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const url = kind === "image" ? await uploadImageToCloudinary(file) : await uploadFileToCloudinary(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "আপলোড হয়নি — আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {label && <p className="text-sm font-medium text-ink">{label}</p>}
      {name && <input type="hidden" name={name} value={value} readOnly />}

      <div className="mt-1.5 flex flex-wrap items-center gap-3">
        {value ? (
          <>
            {isImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="আপলোড করা ছবি" className="h-24 w-20 rounded-sm border border-line object-cover" />
            ) : (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-sm border border-line bg-paper-raised px-3 py-2 text-sm text-ink hover:border-ink"
              >
                <FileText size={16} className="text-teal-deep" /> আপলোড করা ফাইল দেখুন
              </a>
            )}
            <div className="flex flex-col items-start gap-1.5">
              <button
                type="button"
                disabled={busy || disabled}
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1 rounded-sm border border-ink px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink hover:text-paper disabled:opacity-50"
              >
                {busy ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />} বদলান
              </button>
              <button type="button" disabled={busy || disabled} onClick={() => onChange("")} className="flex items-center gap-1 text-xs text-clay hover:underline">
                <X size={12} /> সরান
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            disabled={busy || disabled}
            onClick={() => inputRef.current?.click()}
            className="flex min-h-[84px] w-full max-w-sm flex-col items-center justify-center gap-1 rounded-sm border-2 border-dashed border-line bg-paper-raised px-4 py-3 text-center text-sm text-ink-soft hover:border-ink hover:text-ink disabled:opacity-50"
          >
            {busy ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} />}
            <span>{busy ? "আপলোড হচ্ছে..." : kind === "image" ? "ছবি বাছুন" : "ফাইল বাছুন"}</span>
            <span className="text-[11px] text-ink-soft/60">
              {hint || (kind === "image" ? "সর্বোচ্চ ৩০ MB — বড় ছবি নিজে থেকে ছোট হয়ে যায়" : "PDF/ছবি/ডকুমেন্ট ১০ MB পর্যন্ত, ভিডিও ১০০ MB পর্যন্ত")}
            </span>
          </button>
        )}
        <input ref={inputRef} type="file" accept={accept} onChange={pick} className="hidden" />
      </div>

      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-clay">
          <AlertCircle size={13} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
