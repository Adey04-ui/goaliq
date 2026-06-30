"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useXI } from "@/context/xiContext"
import { FORMATIONS } from "@/app/main/xi/page"

function PlayerSlot({ position, player, small }) {
  const size = small ? 36 : 44

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      {/* Avatar circle */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          border: player ? "2px solid rgba(255,255,255,0.3)" : "2px dashed rgba(255,255,255,0.15)",
          background: player ? "transparent" : "rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {player?.photo ? (
          <Image
            src={player.photo}
            alt={player.name}
            width={size}
            height={size}
            style={{ objectFit: "cover" }}
          />
        ) : (
          // Empty silhouette
          <svg
            width={size * 0.5}
            height={size * 0.5}
            viewBox="0 0 24 24"
            fill="rgba(255,255,255,0.15)"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        )}
      </div>

      {/* Position label */}
      <span
        style={{
          fontSize: 9,
          fontWeight: 600,
          color: player ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
          letterSpacing: "0.5px",
          background: "rgba(0,0,0,0.5)",
          padding: "1px 5px",
          borderRadius: 4,
          whiteSpace: "nowrap",
        }}
      >
        {position.label}
      </span>
    </div>
  )
}

export function PitchSVG() {
  return (
    <svg
      viewBox="0 0 300 420"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    >
      {/* Pitch background */}
      <defs>
        <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d1f0f" />
          <stop offset="50%" stopColor="#0f2411" />
          <stop offset="100%" stopColor="#0d1f0f" />
        </linearGradient>
        {/* Stripe pattern */}
        <pattern id="stripes" x="0" y="0" width="300" height="60" patternUnits="userSpaceOnUse">
          <rect width="300" height="30" fill="#0d1f0f" />
          <rect y="30" width="300" height="30" fill="#0f2411" />
        </pattern>
      </defs>

      <rect width="300" height="420" fill="url(#stripes)" rx="8" />

      {/* Outer boundary */}
      <rect x="15" y="15" width="270" height="390" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" rx="2" />

      {/* Halfway line */}
      <line x1="15" y1="210" x2="285" y2="210" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

      {/* Center circle */}
      <circle cx="150" cy="210" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <circle cx="150" cy="210" r="2" fill="rgba(255,255,255,0.2)" />

      {/* Top penalty box */}
      <rect x="75" y="15" width="150" height="55" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {/* Top 6-yard box */}
      <rect x="112" y="15" width="76" height="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {/* Top penalty spot */}
      <circle cx="150" cy="52" r="1.5" fill="rgba(255,255,255,0.2)" />
      {/* Top penalty arc */}
      <path d="M 112 70 A 40 40 0 0 1 188 70" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

      {/* Bottom penalty box */}
      <rect x="75" y="350" width="150" height="55" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {/* Bottom 6-yard box */}
      <rect x="112" y="383" width="76" height="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {/* Bottom penalty spot */}
      <circle cx="150" cy="368" r="1.5" fill="rgba(255,255,255,0.2)" />
      {/* Bottom penalty arc */}
      <path d="M 112 350 A 40 40 0 0 0 188 350" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

      {/* Corner arcs */}
      <path d="M 15 25 A 10 10 0 0 1 25 15" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <path d="M 275 15 A 10 10 0 0 1 285 25" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <path d="M 15 395 A 10 10 0 0 0 25 405" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <path d="M 285 395 A 10 10 0 0 1 275 405" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    </svg>
  )
}

export default function BuildYourXI() {
  const router = useRouter()
  const { formation, players, isLoading } = useXI()
  const positions = FORMATIONS[formation] ?? FORMATIONS["4-3-3"]

  // players is an array of 11 items matching FORMATION_433 order
  // empty slots are null

  return (
    <div className="buildXI">
      {/* Header */}
      <div className="buildXI__header">
        <span className="buildXI__title">Build Your XI</span>
        <button
          className="buildXI__seeAll"
          onClick={() => router.push("/main/xi")}
        >
          See All
        </button>
      </div>

      {/* Pitch */}
      <div className="buildXI__pitch">
        <PitchSVG />

        {/* Player slots */}
        {isLoading ? (
          <div className="buildXI__loading">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="buildXI__slotSkeleton" />
            ))}
          </div>
        ) : (
          positions.map((position, index) => (
            <PlayerSlot
              key={`${position.label}-${index}`}
              position={position}
              player={players[index] ?? null}
              small
            />
          )))}
      </div>
    </div>
  )
}