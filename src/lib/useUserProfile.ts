"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./firebase";

export type UserProfile = {
  uid: string;
  name?: string;
  role?: string;
  identifier?: string;
  guardianMobile?: string | null;
  className?: string | null;
  subject?: string | null;
  linkedStudentUid?: string | null;
};

// লগইন করা ব্যবহারকারীর নিজের প্রোফাইল (users/{uid} ডকুমেন্ট) আনার জন্য
// ছোট shared hook — Student/Guardian/Teacher ড্যাশবোর্ড তিনটাতেই ব্যবহার হয়।
export function useUserProfile(): UserProfile | null {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let authInstance;
    try {
      authInstance = getFirebaseAuth();
    } catch {
      return;
    }
    const unsubscribe = onAuthStateChanged(authInstance, async (u) => {
      if (!u) {
        setProfile(null);
        return;
      }
      try {
        const snap = await getDoc(doc(getFirebaseDb(), "users", u.uid));
        setProfile(snap.exists() ? ({ uid: u.uid, ...snap.data() } as UserProfile) : { uid: u.uid });
      } catch {
        setProfile({ uid: u.uid });
      }
    });
    return () => unsubscribe();
  }, []);

  return profile;
}
