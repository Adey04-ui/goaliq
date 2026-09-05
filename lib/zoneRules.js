// Qualification/relegation zone rules per competition.
//
// Different leagues and cups mark up completely different numbers of teams
// for different reasons (continental qualification, relegation, playoffs,
// knockout-phase cutoffs), so this can't be a single "top 4 / bottom 3"
// rule. Each entry is keyed by the competition's API-Football league id and
// lists zones in priority order - a row is styled by the FIRST zone whose
// `test(rank, totalTeams)` returns true.
//
// totalTeams is passed in per-render (StandingsTable's own row count), so
// rules can be written relative to table size ("last 3") instead of a
// magic absolute number that breaks the moment a competition's team count
// changes season to season.

export const ZONE_RULES = {
  // Premier League
  39: [
    { id: "ucl", test: (rank) => rank <= 4 },
    { id: "uel", test: (rank) => rank === 5 },
    { id: "relegation", test: (rank, total) => rank > total - 3 },
  ],

  // La Liga
  140: [
    { id: "ucl", test: (rank) => rank <= 4 },
    { id: "uel", test: (rank) => rank === 5 },
    { id: "uecl", test: (rank) => rank === 6 },
    { id: "relegation", test: (rank, total) => rank > total - 3 },
  ],

  // Serie A
  135: [
    { id: "ucl", test: (rank) => rank <= 4 },
    { id: "uel", test: (rank) => rank === 5 },
    { id: "uecl", test: (rank) => rank === 6 },
    { id: "relegation", test: (rank, total) => rank > total - 3 },
  ],

  // Bundesliga - 18 teams, bottom 2 relegate directly, 16th goes to a
  // relegation playoff instead of relegating outright.
  78: [
    { id: "ucl", test: (rank) => rank <= 4 },
    { id: "uel", test: (rank) => rank === 5 },
    { id: "uecl", test: (rank) => rank === 6 },
    { id: "relegation-playoff", test: (rank, total) => rank === total - 2 },
    { id: "relegation", test: (rank, total) => rank > total - 2 },
  ],

  // Ligue 1 - 3rd goes straight to UCL, 4th to a UCL playoff round.
  61: [
    { id: "ucl", test: (rank) => rank <= 3 },
    { id: "ucl-playoff", test: (rank) => rank === 4 },
    { id: "uel", test: (rank) => rank === 5 },
    { id: "relegation-playoff", test: (rank, total) => rank === total - 2 },
    { id: "relegation", test: (rank, total) => rank > total - 2 },
  ],

  // UEFA Champions League - current 36-team league phase: top 8 go
  // straight through, 9th-24th go to a knockout playoff round, the rest
  // are out.
  2: [
    { id: "ucl-through", test: (rank) => rank <= 8 },
    { id: "ucl-playoff", test: (rank) => rank >= 9 && rank <= 24 },
    { id: "eliminated", test: (rank) => rank >= 25 },
  ],

  // UEFA Europa League - same league-phase format as the Champions League.
  3: [
    { id: "uel-through", test: (rank) => rank <= 8 },
    { id: "uel-playoff", test: (rank) => rank >= 9 && rank <= 24 },
    { id: "eliminated", test: (rank) => rank >= 25 },
  ],
}

// Fallback for any competition not explicitly listed above - a
// conservative "top 4 continental, bottom 3 relegation" guess so unmapped
// leagues still get some color coding instead of none. Add the league's
// real id to ZONE_RULES above once you know its actual rules; this default
// intentionally skips the relegation zone entirely for small tables (cups,
// group stages) where "bottom 3" wouldn't mean anything.
const DEFAULT_RULES = [
  { id: "ucl", test: (rank) => rank <= 4 },
  { id: "relegation", test: (rank, total) => total >= 10 && rank > total - 3 },
]

export function getZone(leagueId, rank, totalTeams) {
  const rules = ZONE_RULES[leagueId] || DEFAULT_RULES
  const match = rules.find((rule) => rule.test(rank, totalTeams))
  return match?.id ?? null
}