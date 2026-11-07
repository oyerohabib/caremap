import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
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
          background: "#0F172A",
          borderRadius: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 2,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              background: "#F7F5F2",
            }}
          />
          <div
            style={{
              width: 8,
              height: 5,
              borderRadius: 2,
              background: "#F7F5F2",
              marginTop: 2,
            }}
          />
          <div
            style={{
              position: "relative",
              width: 34,
              height: 28,
              borderRadius: "14px 14px 10px 10px",
              background: "#F7F5F2",
              marginTop: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: 999,
                background: "#38BDF8",
                marginLeft: 6,
                marginTop: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 4,
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
