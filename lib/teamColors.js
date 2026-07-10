// Curated brand colors for major clubs. These IDs are commonly-cited API-Football
// team IDs (I've cross-checked 49=Chelsea and 34=Newcastle against your own
// pasted lineup response earlier, so those two are confirmed correct against
// your actual data) — but verify any others against your own /api/teams
// responses before fully trusting them, since a wrong ID silently mis-colors
// a completely different team with no error thrown anywhere.
export const MANUAL_TEAM_COLORS = {
  33: "#DA020E", // Manchester United
  34: "#241F20", // Newcastle United — confirmed against your data
  40: "#C8102E", // Liverpool
  42: "#EF0107", // Arsenal
  47: "#132257", // Tottenham Hotspur
  49: "#034694", // Chelsea — confirmed against your data
  50: "#6CABDD", // Manchester City
  66: "#7A263A", // Aston Villa
  529: "#A50044", // Barcelona
  541: "#ffffff", // Real Madrid
  530: "#CB3524", // Atletico Madrid
  157: "#DC052D", // Bayern Munich
  165: "#FDE100", // Borussia Dortmund
  85: "#004170", // Paris Saint-Germain
  496: "#000000", // Juventus
  489: "#000000", // AC Milan
  505: "#010E80", // Inter Milan
  497: "#8E1F2F", // AS Roma
}