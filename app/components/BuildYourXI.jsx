"use client"

import Image from "next/image"
import { Sparkles } from "lucide-react"
import {useRouter} from "next/navigation"

export function PitchSVG2() {
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

export default function BuildYourXI({
  onCreate,
  className = "",
  badgeText = "New",
  title = "Create Your XI",
  description = "Build your ultimate starting lineup with AI.",
  buttonText = "Create Your XI",
  pitchImage = null, 
}) 
{
  const router = useRouter()
  return (
    <div
      className={`createYourXI ${className}`}
      style={{
        background: "#0c1117",
        borderRadius: 16,
        padding: 20,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Badge */}
      <span
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "#3b82f6",
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
          padding: "4px 10px",
          borderRadius: 20,
          zIndex: 9,
        }}
      >
        {badgeText}
      </span>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {/* Text side */}
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              margin: "0 0 16px 0",
              fontSize: 14,
              color: "#888",
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
          <button
            onClick={() => router.push("/main/xi")}
            style={{
              background: "#22c55e",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Sparkles size={16} />
            {buttonText}
          </button>
        </div>

        {/* Pitch diagram */}
        <div
          style={{
            width: 120,
            height: 140,
            flexShrink: 0,
            position: "relative",
          }}
        >
          {pitchImage ? (
            <Image
              src={pitchImage}
              alt="Formation"
              fill
              style={{ objectFit: "contain" }}
            />
          ) : (
            <PitchSVG />
          )}
        </div>
      </div>
    </div>
  )
}

// Inline fallback if no image is provided
function PitchSVG() {
  return (
    <svg viewBox="0 0 100 120" fill="none" style={{ width: "100%", height: "100%" }}>
      <rect x="5" y="5" width="90" height="110" rx="4" stroke="#333" strokeWidth="1.5" />
      <line x1="5" y1="60" x2="95" y2="60" stroke="#333" strokeWidth="1" />
      <circle cx="50" cy="60" r="12" stroke="#333" strokeWidth="1" />
      <rect x="25" y="5" width="50" height="20" rx="2" stroke="#333" strokeWidth="1" />
      <rect x="25" y="95" width="50" height="20" rx="2" stroke="#333" strokeWidth="1" />
      {/* Players */}
      <circle cx="50" cy="18" r="4" fill="#fbbf24" />
      <circle cx="30" cy="40" r="3.5" fill="#3b82f6" />
      <circle cx="50" cy="40" r="3.5" fill="#3b82f6" />
      <circle cx="70" cy="40" r="3.5" fill="#3b82f6" />
      <circle cx="25" cy="60" r="3.5" fill="#3b82f6" />
      <circle cx="75" cy="60" r="3.5" fill="#3b82f6" />
      <circle cx="35" cy="80" r="3.5" fill="#3b82f6" />
      <circle cx="50" cy="80" r="3.5" fill="#3b82f6" />
      <circle cx="65" cy="80" r="3.5" fill="#3b82f6" />
      <circle cx="50" cy="100" r="4" fill="#ef4444" />
    </svg>
  )
}