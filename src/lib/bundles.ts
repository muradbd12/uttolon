// A "book set" — several books sold together at one (usually discounted) price,
// e.g. the University Admission Book Set. Managed by the admin.
export type Bundle = {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  bookIds: string[];
  price: number;
  active?: boolean; // false = hidden from the shop
  order?: number;
};
