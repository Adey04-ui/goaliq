"use client"

import Image from "next/image"
import { Sparkles } from "lucide-react"
import {useRouter} from "next/navigation"

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