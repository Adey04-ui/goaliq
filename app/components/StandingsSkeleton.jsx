import React from "react"

function SkeletonPulse({ width, height, radius = 6 }) {
  return (
    <div
      className="skeleton-pulse"
      style={{ width, height, borderRadius: radius }}
    />
  )
}

export default function StandingsSkeleton() {
  return (
    <div className="standings-skeleton">
      <SkeletonPulse width={3} height={28} radius={2} />
      <SkeletonPulse width={20} height={14} radius={4} />
      <div className="standings-skeleton__team">
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