import React from "react"

function SkeletonPulse({ width, height, radius = 6 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          "linear-gradient(90deg, #1a2a3a 25%, #243447 50%, #1a2a3a 75%)",
        backgroundSize: "200% 100%",
        animation: "standingsShimmer 1.4s ease-in-out infinite",
      }}
    />
  )
}

export default function StandingsSkeleton() {
  return (
    <div
      className="standingRow"
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid rgba(70, 82, 97, 0.1)",
        gap: 10,
      }}
    >
      <style>{`
        @keyframes standingsShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <SkeletonPulse width={3} height={28} radius={2} />

      <SkeletonPulse width={20} height={14} radius={4} />

      <div className="teamColumn" style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
        <SkeletonPulse width={22} height={22} radius={4} />
        <SkeletonPulse width="50%" height={14} radius={4} />
      </div>

      <SkeletonPulse width={24} height={12} radius={4} />
      <SkeletonPulse width={24} height={12} radius={4} />
      <SkeletonPulse width={24} height={12} radius={4} />
      <SkeletonPulse width={24} height={12} radius={4} />
      <SkeletonPulse width={32} height={12} radius={4} />
      <SkeletonPulse width={28} height={14} radius={4} />
    </div>
  )
}