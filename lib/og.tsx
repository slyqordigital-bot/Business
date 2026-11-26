import { ImageResponse } from "next/og";

const size = { width: 1200, height: 630 };

export function ogCard(m: { title: string; kcal: number; p: number; c: number; f: number } | null) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#14120E", color: "#FBF6EC", padding: 64, fontFamily: "serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#E5482F", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: "#FBF6EC" }} />
          </div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>MacroSnap</div>
        </div>
        {m ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 44, color: "#C8FF3D", textTransform: "capitalize" }}>{m.title}</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
              <div style={{ fontSize: 180, fontWeight: 700, lineHeight: 1, letterSpacing: -6 }}>{m.kcal}</div>
              <div style={{ fontSize: 44, marginBottom: 24, opacity: 0.7 }}>cal</div>
            </div>
            <div style={{ display: "flex", gap: 24, fontSize: 40 }}>
              <div style={{ color: "#FF7A5C" }}>{m.p}g protein</div>
              <div style={{ color: "#D9A441" }}>{m.c}g carbs</div>
              <div style={{ color: "#A9BC6A" }}>{m.f}g fat</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", fontSize: 96, fontWeight: 700, lineHeight: 1.02, letterSpacing: -4 }}>
            <div>Snap your plate.</div><div style={{ color: "#C8FF3D" }}>Get your macros.</div>
          </div>
        )}
        <div style={{ fontSize: 28, opacity: 0.6 }}>From one photo. No typing.</div>
      </div>
    ),
    size,
  );
}
