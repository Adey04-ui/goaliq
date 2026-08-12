import React from "react"

function SkeletonPulse({ width, height, radius = 8 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          "linear-gradient(90deg, #1a2a3a 25%, #243447 50%, #1a2a3a 75%)",
        backgroundSize: "200% 100%",
        animation: "leagueShimmer 1.4s ease-in-out infinite",
      }}
    />
  )
}

export default function LeagueSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 18px",
        background: "rgba(12, 17, 23, 0.5)",
        border: "1px solid rgba(70, 82, 97, 0.12)",
        borderRadius: 16,
      }}
    >
      <style>{`
        @keyframes leagueShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
        <SkeletonPulse width={40} height={40} radius={10} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <SkeletonPulse width="40%" height={14} radius={6} />
          <SkeletonPulse width="25%" height={12} radius={6} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <SkeletonPulse width={34} height={34} radius={10} />
        <SkeletonPulse width={16} height={16} radius={4} />
      </div>
    </div>
  )
}