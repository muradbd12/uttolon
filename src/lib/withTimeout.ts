// নেটওয়ার্ক/ডেটাবেস সমস্যা হলে (যেমন ভুল কনফিগারেশন) কিছু Firestore
// কল অনির্দিষ্টকালের জন্য ঝুলে থাকতে পারে, কোনো error বা success কিছুই
// না দিয়ে — ব্যবহারকারী তখন অনন্তকাল "লোড হচ্ছে..." দেখতে থাকেন। এই
// হেল্পার একটা সময়সীমা বেঁধে দেয়, যাতে নির্দিষ্ট সময় পরও কিছু না
// হলে honest error দেখানো যায়।
export function withTimeout<T>(promise: Promise<T>, ms = 15000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("সময় শেষ — সার্ভারের সাড়া পাওয়া যায়নি")), ms);
    }),
  ]);
}
