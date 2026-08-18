import dotenv from 'dotenv'
import { prisma } from '../lib/prisma.js';

const LEAGUES = [
  { id: 39, name: 'Premier League' },
  { id: 140, name: 'La Liga' },
  { id: 61, name: 'Ligue 1' },
  { id: 135, name: 'Serie A' },
  { id: 78, name: 'Bundesliga' },
];

const SEASON = 2024;

dotenv.config();

async function fetchApiFootball(endpoint) {
  const res = await fetch(`https://v3.football.api-sports.io${endpoint}`, {
    headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY },
  });
  if (!res.ok) {
    console.error(`HTTP ${res.status} for ${endpoint}`);
    return [];
  }
  const json = await res.json();
  return json.response || [];
}

async function main() {
  let total = 0;

  for (const league of LEAGUES) {
    console.log(`Fetching top scorers for ${league.name}...`);

    const topscorers = await fetchApiFootball(
      `/players/topscorers?league=${league.id}&season=${SEASON}`
    );

    for (const item of topscorers) {
      const p = item.player;
      const stats = item.statistics?.[0];

      await prisma.playerIndex.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          photo: p.photo,
          nationality: p.nationality,
          position: p.position,
          teamId: stats?.team?.id || null,
          teamName: stats?.team?.name || null,
          teamLogo: stats?.team?.logo || null,
          leagueId: league.id,
          season: SEASON,
          updatedAt: new Date(),
        },
        create: {
          id: p.id,
          name: p.name,
          photo: p.photo,
          nationality: p.nationality,
          position: p.position,
          teamId: stats?.team?.id || null,
          teamName: stats?.team?.name || null,
          teamLogo: stats?.team?.logo || null,
          leagueId: league.id,
          season: SEASON,
        },
      });

      total++;
    }

    console.log(`  → ${topscorers.length} players`);
  }

  console.log(`\nDone. Indexed ${total} players into PlayerIndex.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});