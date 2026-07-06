// Lightens (positive percent) or darkens (negative percent) a hex color.
// Used to derive gradient stops from a single extracted/manual team color
// without needing a design-token pair per team.
export function shadeColor(hex, percent) {
  const clean = hex.replace("#", "")
  const num = parseInt(clean, 16)

  let r = (num >> 16) + Math.round(255 * (percent / 100))
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100))
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100))

  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}