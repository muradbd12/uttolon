import { ImageResponse } from "next/og";

// Kept to Latin text only — Satori (the renderer behind ImageResponse) needs
// an explicit font file for non-Latin scripts, and there's no reliable way
// to bundle a Bengali font here without testing the live glyph rendering.
// Safer to keep this share-preview image in English for now.

export const alt = "Uttolon Learning System";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#14213b",
          color: "#f3f4ef",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 10,
              background: "#f3f4ef",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              color: "#c9932e",
              fontWeight: 700,
            }}
          >
            U
          </div>
          <div style={{ fontSize: 30, letterSpacing: 4, color: "#c9932e", textTransform: "uppercase" }}>
            Uttolon Learning System
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 60, lineHeight: 1.25, maxWidth: 980, fontWeight: 600 }}>
          A complete system for learning — not just teaching.
        </div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 26, color: "#c9d3d8" }}>
          Concept · Practice · Assessment · Recovery · Result
        </div>
      </div>
    ),
    { ...size }
  );
}
