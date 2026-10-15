"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Loader2, Trash2, Eraser, Check, AlertCircle } from "lucide-react";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { resizeImageFile } from "@/lib/imageResize";

type Props = {
  onPhotoChange: (url: string) => void;
  onSignatureChange: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
};

// Optional photo upload + on-screen signature pad for the admission form.
// Both go to Cloudinary (already set up for the site, free, no card needed).
export default function PhotoSignatureFields({ onPhotoChange, onSignatureChange, onBusyChange }: Props) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [signatureUrl, setSignatureUrl] = useState("");
  const [sigBusy, setSigBusy] = useState(false);
  const [sigError, setSigError] = useState<string | null>(null);
  const [hasInk, setHasInk] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const inkRef = useRef(false);

  useEffect(() => {
    onBusyChange(photoBusy || sigBusy);
  }, [photoBusy, sigBusy, onBusyChange]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#14213b";
    inkRef.current = false;
    setHasInk(false);
  }, []);

  useEffect(() => {
    if (!signatureUrl) initCanvas();
  }, [signatureUrl, initCanvas]);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("শুধু ছবি (JPG/PNG) দিন।");
      return;
    }
    setPhotoError(null);
    setPhotoBusy(true);
    try {
      const small = await resizeImageFile(file, 700, 0.85);
      const url = await uploadImageToCloudinary(small);
      setPhotoUrl(url);
      onPhotoChange(url);
    } catch {
      setPhotoError("ছবি আপলোড হয়নি — আবার চেষ্টা করুন, অথবা ছবি ছাড়াই এগিয়ে যান।");
    } finally {
      setPhotoBusy(false);
    }
  }

  function removePhoto() {
    setPhotoUrl("");
    onPhotoChange("");
  }

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const { x, y } = point(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.01, y);
    ctx.stroke();
  }

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const { x, y } = point(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!inkRef.current) {
      inkRef.current = true;
      setHasInk(true);
    }
  }

  function onUp() {
    drawing.current = false;
  }

  async function confirmSignature() {
    const canvas = canvasRef.current;
    if (!canvas || !hasInk) return;
    setSigBusy(true);
    setSigError(null);
    try {
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("no blob");
      const url = await uploadImageToCloudinary(new File([blob], "signature.png", { type: "image/png" }));
      setSignatureUrl(url);
      onSignatureChange(url);
    } catch {
      setSigError("স্বাক্ষর সংরক্ষণ হয়নি — আবার চেষ্টা করুন, অথবা স্বাক্ষর ছাড়াই এগিয়ে যান (প্রিন্ট করে হাতে সই করা যাবে)।");
    } finally {
      setSigBusy(false);
    }
  }

  function redraw() {
    setSignatureUrl("");
    onSignatureChange("");
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      {/* Photo */}
      <div>
        <p className="text-sm font-medium text-ink">পাসপোর্ট সাইজ ছবি</p>
        <p className="mt-0.5 text-xs text-ink-soft/60">ঐচ্ছিক — না দিলেও আবেদন জমা হবে</p>

        <div className="mt-3 flex items-center gap-4">
          <div className="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-paper-raised">
            {photoBusy ? (
              <Loader2 size={20} className="animate-spin text-ink-soft" />
            ) : photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="আবেদনকারীর ছবি" className="h-full w-full object-cover" />
            ) : (
              <Camera size={24} className="text-ink-soft/30" strokeWidth={1.3} />
            )}
          </div>
          <div className="space-y-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-line px-3 py-2 text-xs font-medium text-ink hover:border-ink">
              <Camera size={13} />
              {photoUrl ? "ছবি বদলান" : "ছবি বাছুন"}
              <input type="file" accept="image/*" onChange={handlePhoto} disabled={photoBusy} className="hidden" />
            </label>
            {photoUrl && (
              <button
                type="button"
                onClick={removePhoto}
                className="flex items-center gap-1 text-xs text-clay hover:underline"
              >
                <Trash2 size={12} /> সরান
              </button>
            )}
          </div>
        </div>
        {photoError && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-clay">
            <AlertCircle size={13} className="mt-0.5 shrink-0" /> {photoError}
          </p>
        )}
      </div>

      {/* Signature */}
      <div>
        <p className="text-sm font-medium text-ink">অভিভাবক/আবেদনকারীর স্বাক্ষর</p>
        <p className="mt-0.5 text-xs text-ink-soft/60">ঐচ্ছিক — আঙুল বা মাউস দিয়ে নিচের বক্সে সই করুন</p>

        {signatureUrl ? (
          <div className="mt-3">
            <div className="flex h-28 items-center justify-center rounded-sm border border-line bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={signatureUrl} alt="স্বাক্ষর" className="max-h-full max-w-full object-contain" />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-teal-deep">
              <Check size={13} /> স্বাক্ষর সংরক্ষিত হয়েছে
            </p>
            <button type="button" onClick={redraw} className="mt-1 text-xs text-ink-soft underline">
              আবার আঁকুন
            </button>
          </div>
        ) : (
          <div className="mt-3">
            <canvas
              ref={canvasRef}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              style={{ touchAction: "none" }}
              className="h-28 w-full cursor-crosshair rounded-sm border border-dashed border-ink-soft/40 bg-white"
              aria-label="স্বাক্ষর আঁকার বক্স"
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={initCanvas}
                disabled={sigBusy}
                className="flex items-center gap-1 rounded-sm border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink"
              >
                <Eraser size={12} /> মুছুন
              </button>
              <button
                type="button"
                onClick={confirmSignature}
                disabled={!hasInk || sigBusy}
                className="flex items-center gap-1 rounded-sm bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-gold-deep disabled:opacity-50"
              >
                {sigBusy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                স্বাক্ষর নিশ্চিত করুন
              </button>
            </div>
            {sigError && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-clay">
                <AlertCircle size={13} className="mt-0.5 shrink-0" /> {sigError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
