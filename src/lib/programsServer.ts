import { getAdminDb } from "@/lib/firebase-admin";
import { DEFAULT_PROGRAMS, type Program } from "./programs";

// Server-side copy of the program list (for the program pages and the sitemap).
// Falls back to the built-in defaults if nothing is saved yet or Firestore can't be read.
export async function getProgramsServer(): Promise<Program[]> {
  try {
    const snap = await getAdminDb().collection("programs").get();
    const list = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Program, "id">) }))
      .filter((p) => p.active !== false && !!p.title)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));
    return list.length > 0 ? list : DEFAULT_PROGRAMS;
  } catch {
    return DEFAULT_PROGRAMS;
  }
}
