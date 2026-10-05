import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "QuoraCup Padel — inscrições para os torneios semanais";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0e2a23",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <svg
          width="900"
          height="700"
          viewBox="0 0 24 28"
          style={{ position: "absolute", top: -120, right: -140, opacity: 0.12 }}
        >
          <path d="M6 0H14L8 28H0L6 0Z" fill="#d7f23d" />
          <path d="M16 0H24L18 28H10L16 0Z" fill="#d7f23d" />
        </svg>

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="64" height="76" viewBox="0 0 24 28" style={{ display: "flex" }}>
            <path d="M6 0H14L8 28H0L6 0Z" fill="#d7f23d" />
            <path d="M16 0H24L18 28H10L16 0Z" fill="#d7f23d" fillOpacity={0.5} />
          </svg>
          <div style={{ display: "flex", fontSize: 88, fontWeight: 800, letterSpacing: -2 }}>
            <span style={{ color: "#f4f7f0" }}>QUORA</span>
            <span style={{ color: "#d7f23d" }}>CUP</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 34,
            color: "#9db6ac",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Inscrições para os torneios semanais de padel
        </div>
      </div>
    ),
    { ...size }
  );
}
