// Phase 2 প্রস্তুতি — এখনো ব্যবহার শুরু হয়নি।
//
// এই ফাইলটা তখনই কাজ করবে যখন নিচের env variable-গুলো .env.local ফাইলে
// (Firebase Console থেকে পাওয়া আসল মান দিয়ে) যোগ করা হবে। ততক্ষণ এই ফাইলটা
// import না করলে অ্যাপের কোনো ক্ষতি হবে না — এটা শুধু প্রস্তুত করে রাখা হলো।
import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
