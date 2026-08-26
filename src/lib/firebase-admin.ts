// এই ফাইলটা শুধুমাত্র সার্ভার-সাইডে (API route-এর ভেতরে) ব্যবহার হবে —
// কখনো কোনো client component-এ import করা যাবে না, কারণ এটা একটা
// অত্যন্ত সংবেদনশীল Service Account key ব্যবহার করে যা ব্রাউজারে
// প্রকাশ পেলে পুরো Firebase প্রজেক্টের নিয়ন্ত্রণ অন্যের হাতে চলে যেতে পারে।
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;

function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY env variable missing");
  }
  const serviceAccount = JSON.parse(raw);
  adminApp = initializeApp({ credential: cert(serviceAccount) });
  return adminApp;
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
