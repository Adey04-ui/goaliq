export function GoalIcon({ size = 50 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <radialGradient id="goalBallShade" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#e8e8e8" />
          <stop offset="100%" stopColor="#c2c2c2" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#goalBallShade)" stroke="#0c1117" strokeWidth="0.8" />
      <path d="M12 3 C 8 6, 8 18, 12 21" fill="none" stroke="#0c1117" strokeWidth="0.6" opacity="0.5" />
      <path d="M12 3 C 16 6, 16 18, 12 21" fill="none" stroke="#0c1117" strokeWidth="0.6" opacity="0.5" />
      <path d="M3 12 C 6 8, 18 8, 21 12" fill="none" stroke="#0c1117" strokeWidth="0.6" opacity="0.5" />
    </svg>
  )
}

export function OwnGoalIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <radialGradient id="ownGoalBallShade" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ec4a52" />
          <stop offset="70%" stopColor="#d41b27" />
          <stop offset="100%" stopColor="#8f1017" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#ownGoalBallShade)" stroke="#5c0a0e" strokeWidth="0.8" />
      <path d="M12 3 C 8 6, 8 18, 12 21" fill="none" stroke="#5c0a0e" strokeWidth="0.6" opacity="0.5" />
      <path d="M12 3 C 16 6, 16 18, 12 21" fill="none" stroke="#5c0a0e" strokeWidth="0.6" opacity="0.5" />
      <path d="M3 12 C 6 8, 18 8, 21 12" fill="none" stroke="#5c0a0e" strokeWidth="0.6" opacity="0.5" />
    </svg>
  )
}

export function MissedPenaltyIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M2 20 L2 4 L15 4 L15 20" fill="none" stroke="#a0aec0" strokeWidth="1.3" />
      <line x1="2" y1="8" x2="15" y2="8" stroke="#a0aec0" strokeWidth="0.5" opacity="0.45" />
      <line x1="2" y1="12" x2="15" y2="12" stroke="#a0aec0" strokeWidth="0.5" opacity="0.45" />
      <line x1="2" y1="16" x2="15" y2="16" stroke="#a0aec0" strokeWidth="0.5" opacity="0.45" />
      <line x1="6" y1="4" x2="6" y2="20" stroke="#a0aec0" strokeWidth="0.5" opacity="0.35" />
      <line x1="10" y1="4" x2="10" y2="20" stroke="#a0aec0" strokeWidth="0.5" opacity="0.35" />
      <path d="M9 15 Q15 11 20 8.5" fill="none" stroke="#d41b27" strokeWidth="1" strokeDasharray="1.4 1.4" />
      <circle cx="20.2" cy="8" r="2.6" fill="#d41b27" stroke="#7a1010" strokeWidth="0.6" />
    </svg>
  )
}

export function SubstitutionIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M4 16 Q4 6 14 6" fill="none" stroke="#d41b27" strokeWidth="2.2" strokeLinecap="round" />
      <polygon points="14,3.2 17,6 14,8.8" fill="#d41b27" />
      <path d="M20 8 Q20 18 10 18" fill="none" stroke="#1a7a3c" strokeWidth="2.2" strokeLinecap="round" />
      <polygon points="10,20.8 7,18 10,15.2" fill="#1a7a3c" />
    </svg>
  )
}

export function YellowCardIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="6" y="3" width="12" height="18" rx="2" fill="#f5c518" stroke="#8a6d00" strokeWidth="0.8" transform="rotate(-8 12 12)" />
    </svg>
  )
}

export function RedCardIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="6" y="3" width="12" height="18" rx="2" fill="#d41b27" stroke="#7a1010" strokeWidth="0.8" transform="rotate(-8 12 12)" />
    </svg>
  )
}