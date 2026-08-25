// Phase 2 — Admin লগইনের জন্য এখন সক্রিয়। Firebase Console-এ Email/Password
// sign-in method চালু ও একটা ইউজার তৈরি করার পরই এটা কাজ করবে।
import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

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

let authInstance: Auth | null = null;

// getAuth() নিজেই API key যাচাই করে, তাই এটা কখনো module লোড হওয়ার সময়
// (Next.js build বা server-render-এর সময়) ডাকা যাবে না — ডাকলে key
// missing/ভুল থাকা অবস্থায় পুরো build ভেঙে যায়। তাই এটা lazy রাখা হলো —
// শুধু ব্রাউজারে, দরকার হওয়ার মুহূর্তে (client component-এর ভেতরে,
// useEffect/handler-এ) getFirebaseAuth() দিয়ে কল করতে হবে, সরাসরি নয়।
export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(firebaseApp);
  }
  return authInstance;
}

let dbInstance: Firestore | null = null;

// একই কারণে (build-time crash এড়াতে) Firestore-ও lazy রাখা হলো — শুধু
// client component-এর ভেতরে getFirebaseDb() দিয়ে ডাকতে হবে।
export function getFirebaseDb(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(firebaseApp);
  }
  return dbInstance;
}
