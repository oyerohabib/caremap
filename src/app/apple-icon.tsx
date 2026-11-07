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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F172A",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: "#F7F5F2",
            }}
          />
          <div
            style={{
              width: 22,
              height: 14,
              borderRadius: 6,
              background: "#F7F5F2",
              marginTop: 6,
            }}
          />
          <div
            style={{
              position: "relative",
              width: 96,
              height: 78,
              borderRadius: "40px 40px 28px 28px",
              background: "#F7F5F2",
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                background: "#38BDF8",
                marginLeft: 18,
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: "#F7F5F2",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}