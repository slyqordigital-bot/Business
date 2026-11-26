import { ImageResponse } from "next/og";

const size = { width: 1200, height: 630 };

function Mark() {
  return (
    <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#8B5CF6,#22E1FF)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 30, height: 20, borderRadius: 8, background: "#07060D", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, background: "#C8FF3D" }} />
      </div>
    </div>
  );
}

/** Branded share image: a quest run (the RESULT) or the default card. */
export function ogCard(r: { title: string; tag: string; game: string; snack: string; cleared: number; total: number; points: number } | null) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "radial-gradient(120% 90% at 50% 0%, #3b1f7a 0%, #140f24 45%, #07060d 100%)", color: "#F4F2FF", padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Mark />
          <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: 1, display: "flex" }}>SNACK<span style={{ color: "#C8FF3D" }}>QUEST</span></div>
        </div>
        {r ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, color: "#22E1FF", letterSpacing: 4, textTransform: "uppercase" }}>{`@${r.tag} · ${r.game} × ${r.snack}`}</div>
            <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1, textTransform: "uppercase", marginTop: 12, maxWidth: 1050 }}>{r.title}</div>
            <div style={{ display: "flex", gap: 20, marginTop: 34 }}>
              <div style={{ display: "flex", padding: "14px 26px", borderRadius: 999, background: "#C8FF3D", color: "#07060D", fontSize: 38, fontWeight: 800 }}>{`${r.points.toLocaleString("en-US")} pts`}</div>
              <div style={{ display: "flex", padding: "14px 26px", borderRadius: 999, border: "2px solid rgba(255,255,255,.2)", fontSize: 38, fontWeight: 700 }}>{`${r.cleared}/${r.total} quests cleared`}</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", fontSize: 110, fontWeight: 800, lineHeight: 0.98, textTransform: "uppercase" }}>
            <div>Snack. Play.</div><div style={{ color: "#C8FF3D" }}>Unlock real gear.</div>
          </div>
        )}
        <div style={{ fontSize: 28, color: "#A9A2C4" }}>Snack quests + playtime = points for gift cards and gear.</div>
      </div>
    ),
    size,
  );
}
