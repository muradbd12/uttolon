"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { Loader2, AlertCircle, Trash2, Info, User } from "lucide-react";

type TeacherOption = { uid: string; name: string; subject: string | null };
type Profile = {
  teacherUid: string;
  name: string;
  subject: string;
  institution: string;
  department: string;
  experience: string;
  bio: string;
  photoUrl: string;
  published: boolean;
};

const inputClass =
  "w-full rounded-sm border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-ink";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB

export default function AdminTeacherProfileForm() {
  const [teachers, setTeachers] = useState<TeacherOption[] | null>(null);
  const [selectedUid, setSelectedUid] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [profiles, setProfiles] = useState<(Profile & { id: string })[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    try {
      const db = getFirebaseDb();
      const snapshot = await getDocs(collection(db, "teacherProfiles"));
      setProfiles(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Profile & { id: string })));
    } catch {
      setProfiles([]);
    }
  }, []);

  useEffect(() => {
    async function loadTeachers() {
      try {
        const db = getFirebaseDb();
        const q = query(collection(db, "users"), where("role", "==", "teacher"));
        const snapshot = await getDocs(q);
        setTeachers(
          snapshot.docs.map((d) => ({
            uid: d.id,
            name: (d.data().name as string) || "নাম নেই",
            subject: (d.data().subject as string) || null,
          }))
        );
      } catch {
        setTeachers([]);
      }
    }
    loadTeachers();
    queueMicrotask(loadProfiles);
  }, [loadProfiles]);

  useEffect(() => {
    if (!selectedUid) {
      queueMicrotask(() => {
        setProfile(null);
        setPhotoFile(null);
        setPhotoPreview(null);
      });
      return;
    }
    async function loadExisting() {
      try {
        const snap = await getDoc(doc(getFirebaseDb(), "teacherProfiles", selectedUid));
        setProfile(snap.exists() ? (snap.data() as Profile) : null);
        setPhotoPreview(snap.exists() ? (snap.data().photoUrl as string) || null : null);
      } catch {
        setProfile(null);
      }
    }
    loadExisting();
  }, [selectedUid]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("শুধু ছবি ফাইল (jpg/png) দেওয়া যাবে।");
      setStatus("error");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setErrorMsg("ছবির সাইজ ৫ MB-এর বেশি হতে পারবে না।");
      setStatus("error");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setStatus("idle");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUid) return;
    setStatus("saving");
    setErrorMsg("");
    const form = new FormData(e.currentTarget);
    const teacher = teachers?.find((t) => t.uid === selectedUid);

    try {
      let photoUrl = profile?.photoUrl || "";
      if (photoFile) {
        photoUrl = await uploadImageToCloudinary(photoFile);
      }

      await setDoc(doc(getFirebaseDb(), "teacherProfiles", selectedUid), {
        teacherUid: selectedUid,
        name: teacher?.name || "",
        subject: teacher?.subject || "",
        institution: (form.get("institution") as string)?.trim() || "",
        department: (form.get("department") as string)?.trim() || "",
        experience: (form.get("experience") as string)?.trim() || "",
        bio: (form.get("bio") as string)?.trim() || "",
        photoUrl,
        published: profile?.published || false,
        updatedAt: serverTimestamp(),
      });
      setStatus("saved");
      setPhotoFile(null);
      loadProfiles();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "সংরক্ষণ করা যায়নি — আবার চেষ্টা করুন।");
    }
  }

  async function togglePublished(p: Profile & { id: string }) {
    setBusyId(p.id);
    try {
      await updateDoc(doc(getFirebaseDb(), "teacherProfiles", p.id), { published: !p.published });
      setProfiles((prev) =>
        prev ? prev.map((x) => (x.id === p.id ? { ...x, published: !x.published } : x)) : prev
      );
    } catch {
      setStatus("error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteProfile(id: string) {
    if (!window.confirm("এই শিক্ষকের পাবলিক প্রোফাইলটা মুছে ফেলতে চান?")) return;
    setBusyId(id);
    try {
      await deleteDoc(doc(getFirebaseDb(), "teacherProfiles", id));
      setProfiles((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
    } catch {
      setStatus("error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-2 rounded-sm border border-gold/30 bg-gold-soft/40 p-3 text-sm text-ink">
        <Info size={15} className="mt-0.5 shrink-0 text-gold-deep" />
        <p>
          আগে /admin/users থেকে শিক্ষকের লগইন অ্যাকাউন্ট বানিয়ে নিন, তারপর এখানে সেই
          শিক্ষককে বেছে নিয়ে পাবলিক প্রোফাইল (ছবি, প্রতিষ্ঠান, অভিজ্ঞতা, পরিচিতি) যোগ
          করুন। &quot;Publish&quot; না করা পর্যন্ত ওয়েবসাইটে দেখা যাবে না।
        </p>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-ink">শিক্ষক নির্বাচন করুন</span>
        <select
          value={selectedUid}
          onChange={(e) => setSelectedUid(e.target.value)}
          className={`mt-1.5 ${inputClass}`}
        >
          <option value="">{teachers === null ? "লোড হচ্ছে..." : "নির্বাচন করুন"}</option>
          {teachers?.map((t) => (
            <option key={t.uid} value={t.uid}>
              {t.name} {t.subject ? `— ${t.subject}` : ""}
            </option>
          ))}
        </select>
      </label>

      {selectedUid && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-line bg-paper p-6">
          {status === "error" && errorMsg && (
            <div className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}
          {status === "saved" && (
            <div className="rounded-sm border border-teal/30 bg-teal-soft px-3 py-2 text-sm text-teal-deep">
              সংরক্ষিত হয়েছে।
            </div>
          )}

          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-paper-raised text-ink-soft/40">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="প্রিভিউ" className="h-full w-full object-cover" />
              ) : (
                <User size={26} />
              )}
            </span>
            <label className="block">
              <span className="text-sm font-medium text-ink">ছবি (সর্বোচ্চ ৫ MB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="mt-1.5 block text-sm text-ink-soft"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              name="institution"
              type="text"
              defaultValue={profile?.institution || ""}
              placeholder="প্রতিষ্ঠান (যেমন: Noakhali Science and Technology University)"
              className={inputClass}
            />
            <input
              name="department"
              type="text"
              defaultValue={profile?.department || ""}
              placeholder="বিভাগ (ঐচ্ছিক)"
              className={inputClass}
            />
          </div>
          <input
            name="experience"
            type="text"
            defaultValue={profile?.experience || ""}
            placeholder="অভিজ্ঞতা (যেমন: ৩ বছর)"
            className={inputClass}
          />
          <textarea
            name="bio"
            rows={3}
            defaultValue={profile?.bio || ""}
            placeholder="সংক্ষিপ্ত পরিচিতি"
            className={inputClass}
          />

          <button
            type="submit"
            disabled={status === "saving"}
            className="flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-gold-deep disabled:opacity-60"
          >
            {status === "saving" && <Loader2 size={14} className="animate-spin" />}
            সংরক্ষণ করুন
          </button>
        </form>
      )}

      {profiles && profiles.length > 0 && (
        <div>
          <h3 className="font-display-bn text-base text-ink">সব প্রোফাইল</h3>
          <ul className="mt-3 space-y-3">
            {profiles.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 rounded-sm border border-line p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-paper-raised text-ink-soft/40">
                    {p.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.photoUrl} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <User size={18} />
                    )}
                  </span>
                  <div>
                    <p className="text-[15px] text-ink">{p.name}</p>
                    <p className="text-xs text-ink-soft/60">{p.subject}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-sm px-2 py-0.5 text-xs font-medium ${
                      p.published ? "bg-teal-soft text-teal-deep" : "bg-line text-ink-soft"
                    }`}
                  >
                    {p.published ? "Published" : "Draft"}
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePublished(p)}
                    disabled={busyId === p.id}
                    className="rounded-sm border border-line px-2.5 py-1 text-xs text-ink hover:border-ink disabled:opacity-50"
                  >
                    {p.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProfile(p.id)}
                    disabled={busyId === p.id}
                    className="flex items-center gap-1 rounded-sm border border-line px-2.5 py-1 text-xs text-ink-soft hover:border-clay hover:text-clay disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
