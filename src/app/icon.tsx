import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0B1F3A 0%, #1C4468 100%)",
          borderRadius: 7,
          fontFamily: "Georgia, serif",
          fontSize: 17,
          fontWeight: 700,
          color: "#D4AF7A",
          letterSpacing: -1,
        }}
      >
        NP
      </div>
    ),
    { ...size }
  );
}
