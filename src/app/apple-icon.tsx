import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0e2a23",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="110" height="130" viewBox="0 0 24 28" fill="none">
          <path d="M6 0H14L8 28H0L6 0Z" fill="#d7f23d" />
          <path d="M16 0H24L18 28H10L16 0Z" fill="#d7f23d" fillOpacity={0.5} />
        </svg>
      </div>
    ),
    { ...size }
  );
}
