import { ImageResponse } from "next/og";

export const alt = "CareMap: tap where it hurts. A 3D symptom intake for telehealth.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SKIN = "#d6d3d1";
const BRAND = "#0f766e";
const ACCENT = "#14b8a6";

function Part({
  w,
  h,
  x,
  y,
  r = 999,
  color = SKIN,
}: {
  w: number;
  h: number;
  x: number;
  y: number;
  r?: number;
  color?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y,
        width: w,
        height: h,
        borderRadius: r,
        background: color,
      }}
    />
  );
}

function Pin({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x - 11,
        top: y - 11,
        width: 22,
        height: 22,
        borderRadius: 999,
        background: color,
        border: "4px solid white",
      }}
    />
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #f7f5f2 0%, #e7e5e4 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 80px", width: 720 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, color: "#44403c" }}>
            <div style={{ width: 22, height: 22, borderRadius: 999, background: BRAND }} />
            CareMap
          </div>
          <div style={{ fontSize: 76, fontWeight: 700, color: "#1c1917", lineHeight: 1.05, marginTop: 24, letterSpacing: -2 }}>
            Tap where it hurts.
          </div>
          <div style={{ fontSize: 32, color: "#57534e", marginTop: 24, lineHeight: 1.35 }}>
            Phone-first 3D symptom intake with transparent triage and a clean record for the clinician.
          </div>
          <div style={{ display: "flex", marginTop: 36, fontSize: 22, color: "#92400e", background: "#fef3c7", padding: "10px 18px", borderRadius: 999, alignSelf: "flex-start" }}>
            Demo · synthetic data only
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", width: 480, height: 630 }}>
          <Part w={78} h={92} x={240} y={60} />
          <Part w={34} h={30} x={240} y={145} r={10} />
          <Part w={170} h={140} x={240} y={168} r={70} color={ACCENT} />
          <Part w={150} h={86} x={240} y={300} r={44} />
          <Part w={156} h={70} x={240} y={378} r={36} />
          <Part w={40} h={140} x={128} y={180} />
          <Part w={34} h={120} x={120} y={316} />
          <Part w={40} h={140} x={352} y={180} />
          <Part w={34} h={120} x={360} y={316} />
          <Part w={52} h={130} x={208} y={430} />
          <Part w={52} h={130} x={272} y={430} />
          <Pin x={262} y={225} color="#dc2626" />
          <Pin x={360} y={380} color="#f97316" />
        </div>
      </div>
    ),
    size,
  );
}
