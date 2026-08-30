// Firebase Storage-এর বদলে Cloudinary ব্যবহার করা হচ্ছে — কারণ Google
// এখন Storage চালু করতে Blaze প্ল্যান (কার্ড যুক্ত করা) বাধ্যতামূলক করে
// দিয়েছে, বিনামূল্যে ব্যবহারের মধ্যে থাকলেও। Cloudinary-এর ফ্রি প্ল্যান
// কোনো কার্ড ছাড়াই কাজ করে।
export async function uploadImageToCloudinary(file: File): Promise<string> {
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

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
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
