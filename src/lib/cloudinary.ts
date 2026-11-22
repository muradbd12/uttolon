import { resizeImageFile } from "./imageResize";

// Cloudinary (free, no card) is used for every upload on the site — Firebase Storage
// needs a paid plan with a card. Admins never paste image/file links: they upload here.
//
// Limits:
//  - Photos: you may pick up to 30 MB (phone photos are big). Anything over ~1.5 MB is
//    shrunk in the browser first (max 2000px side, JPEG), so Cloudinary's free 10 MB
//    per-image limit is never a problem.
//  - Documents (PDF etc.): Cloudinary free plan accepts up to 10 MB each.
//  - Videos: up to 100 MB on the free plan.
const MAX_IMAGE_PICK = 30 * 1024 * 1024;
const COMPRESS_ABOVE = 1.5 * 1024 * 1024;
const MAX_DOC = 10 * 1024 * 1024;
const MAX_VIDEO = 100 * 1024 * 1024;

async function send(resource: "image" | "auto" | "video", file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary কনফিগার করা হয়নি — NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ও NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET Vercel-এ যোগ করা আছে কিনা যাচাই করুন।"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resource}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Cloudinary আপলোড ব্যর্থ হয়েছে: ${errText || res.status}`);
  }

  const data = await res.json();
  return data.secure_url as string;
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("শুধু ছবির ফাইল দিন (JPG/PNG)।");
  if (file.size > MAX_IMAGE_PICK) throw new Error("ছবির সাইজ ৩০ MB-এর বেশি — একটু ছোট ছবি দিন।");
  const prepared = file.size > COMPRESS_ABOVE ? await resizeImageFile(file, 2000, 0.85) : file;
  return send("image", prepared);
}

// For resources: photos go through the photo path above; PDFs/documents and videos upload as they are.
export async function uploadFileToCloudinary(file: File): Promise<string> {
  if (file.type.startsWith("image/")) return uploadImageToCloudinary(file);
  const isVideo = file.type.startsWith("video/");
  if (isVideo && file.size > MAX_VIDEO) throw new Error("ভিডিওর সাইজ ১০০ MB-এর বেশি — Cloudinary ফ্রি প্ল্যানে এর চেয়ে বড় ভিডিও নেওয়া যায় না।");
  if (!isVideo && file.size > MAX_DOC) throw new Error("ফাইলের সাইজ ১০ MB-এর বেশি — Cloudinary ফ্রি প্ল্যানে এর চেয়ে বড় ফাইল নেওয়া যায় না। ফাইলটা ছোট করে দিন।");
  return send(isVideo ? "video" : "auto", file);
}
