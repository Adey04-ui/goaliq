import React from "react"

function SkeletonPulse({ width, height, radius = 6 }) {
  return (
    <div
      className="skeleton-pulse"
      style={{ width, height, borderRadius: radius }}
    />
  )
}

export default function LeagueSkeleton() {
  return (
    <div className="league-skeleton">
      <div className="league-skeleton__main">
        <SkeletonPulse width={40} height={40} radius={10} />
        <div className="league-skeleton__text">
          <SkeletonPulse width="40%" height={14} radius={6} />
          <SkeletonPulse width="25%" height={12} radius={6} />
        </div>
      </div>
      <div className="league-skeleton__actions">
        <SkeletonPulse width={34} height={34} radius={10} />
        <SkeletonPulse width={16} height={16} radius={4} />
      </div>
    </div>
  )
}