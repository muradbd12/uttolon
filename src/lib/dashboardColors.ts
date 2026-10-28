// Vivid accent colours for the admin dashboard (stat cards, quick actions,
// management cards, sidebar icons). Kept in one place so the look stays consistent.
export type Accent = { name: string; from: string; to: string; tint: string; ink: string };

export const PALETTE: Accent[] = [
  { name: "blue", from: "#3b82f6", to: "#1d4ed8", tint: "#dbeafe", ink: "#1d4ed8" },
  { name: "violet", from: "#8b5cf6", to: "#6d28d9", tint: "#ede9fe", ink: "#6d28d9" },
  { name: "emerald", from: "#10b981", to: "#047857", tint: "#d1fae5", ink: "#047857" },
  { name: "amber", from: "#f59e0b", to: "#d97706", tint: "#fef3c7", ink: "#b45309" },
  { name: "rose", from: "#f43f5e", to: "#be123c", tint: "#ffe4e6", ink: "#be123c" },
  { name: "cyan", from: "#06b6d4", to: "#0e7490", tint: "#cffafe", ink: "#0e7490" },
  { name: "indigo", from: "#6366f1", to: "#4338ca", tint: "#e0e7ff", ink: "#4338ca" },
  { name: "pink", from: "#ec4899", to: "#be185d", tint: "#fce7f3", ink: "#be185d" },
];

export function grad(c: Accent) {
  return `linear-gradient(135deg, ${c.from}, ${c.to})`;
}
