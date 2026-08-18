import { getCsvEnrichment } from '@/lib/player-csv';
import PlayerHeader from './PlayerHeader';
import StatsContainer from './StatsContainer';

async function getApiPlayer(id) {
  const res = await fetch(
    `https://v3.football.api-sports.io/players?id=${id}&season=2024`, // <-- changed to 2024
    {
      headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) return null;

  const json = await res.json();
  return json.response?.[0] || null;
}

export default async function PlayerPage({ params }) {
  const { id } = await params;
  const data = await getApiPlayer(id);

  if (!data) {
    return (
      <div className="parent-container">
        <div style={{ padding: 40, color: '#f1f5f9' }}>
          <h1>Player {id}</h1>
          <p style={{ color: '#ef4444' }}>
            No data from API-Football for season 2024.
          </p>
          <p style={{ color: '#64748b' }}>
            Free tier may be rate-limited or this player has no 2024 record.
          </p>
        </div>
      </div>
    );
  }

  const { player, statistics } = data;
  const currentStats = statistics?.[0];

  const csvEnrichment = await getCsvEnrichment(player);

  return (
    <div className="parent-container">
      <div className="player-page">
        <PlayerHeader
          player={player}
          currentStats={currentStats}
          csv={csvEnrichment}
        />
        <StatsContainer
          player={player}
          currentStats={currentStats}
          csv={csvEnrichment}
          apiSeason="2024-25"  // pass this so labels are accurate
        />
      </div>
    </div>
  );
}