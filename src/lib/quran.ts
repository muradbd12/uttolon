export const QURAN_TYPES = {
  new: "নতুন পাঠ",
  revision: "পুনরাবৃত্তি",
  tajweed: "তাজবীদ অনুশীলন",
} as const;

export const QURAN_RATINGS = {
  good: "ভালো",
  ok: "মোটামুটি",
  needs: "আরও অনুশীলন দরকার",
} as const;

export type QuranType = keyof typeof QURAN_TYPES;
export type QuranRating = keyof typeof QURAN_RATINGS;

export type QuranLog = {
  id: string;
  studentUid: string;
  studentName: string;
  className: string;
  date: string;
  type: QuranType;
  range: string;
  rating: QuranRating;
  paraCompleted: number | null;
  note: string;
  ms: number;
};

export function mapQuranLog(id: string, x: Record<string, unknown>): QuranLog {
  const t = x.type as string;
  const r = x.rating as string;
  const created = x.createdAt as { toMillis?: () => number } | undefined;
  return {
    id,
    studentUid: (x.studentUid as string) || "",
    studentName: (x.studentName as string) || "",
    className: (x.className as string) || "",
    date: (x.date as string) || "",
    type: t in QURAN_TYPES ? (t as QuranType) : "new",
    range: (x.range as string) || "",
    rating: r in QURAN_RATINGS ? (r as QuranRating) : "ok",
    paraCompleted: typeof x.paraCompleted === "number" ? (x.paraCompleted as number) : null,
    note: (x.note as string) || "",
    ms: created && typeof created.toMillis === "function" ? created.toMillis() : 0,
  };
}

export const ratingStyle: Record<QuranRating, { bg: string; fg: string }> = {
  good: { bg: "#d1fae5", fg: "#047857" },
  ok: { bg: "#fef3c7", fg: "#b45309" },
  needs: { bg: "#ffe4e6", fg: "#be123c" },
};
