'use client';

import { useState } from 'react';
import OverviewTab from './OverviewTab';
import ShootingTab from './ShootingTab';
import PlayingTimeTab from './PlayingTimeTab';
import MiscTab from './MiscTab';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'shooting', label: 'Shooting' },
  { id: 'playingtime', label: 'Playing Time' },
  { id: 'misc', label: 'Defense & Misc' },
];

export default function StatsContainer({ player, currentStats, csv }) {
  const [active, setActive] = useState('overview');
  const csvRows = csv?.allSeasonRows || [];
  const [selectedCsv, setSelectedCsv] = useState(csv?.primary || null);

  // If player has multiple CSV rows (transferred mid-season), show selector
  const hasMultipleClubs = csvRows.length > 1;

  return (
    <div className="stats-container">
      {/* Club selector for 2025-26 (only if multi-club in CSV) */}
      {hasMultipleClubs && (
        <div className="csv-club-selector">
          <span className="csv-club-label">2025-26 club:</span>
          {csvRows.map((row) => (
            <button
              key={row.squad}
              className={`csv-club-btn ${selectedCsv?.squad === row.squad ? 'active' : ''}`}
              onClick={() => setSelectedCsv(row)}
            >
              {row.squad}
            </button>
          ))}
        </div>
      )}

      <div className="stats-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`stats-tab ${active === t.id ? 'active' : ''}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="stats-panel">
        {active === 'overview' && (
          <OverviewTab currentStats={currentStats} csv={selectedCsv} />
        )}
        {active === 'shooting' && <ShootingTab csv={selectedCsv} />}
        {active === 'playingtime' && <PlayingTimeTab csv={selectedCsv} />}
        {active === 'misc' && <MiscTab csv={selectedCsv} player={player} />}
      </div>

      {!csv && (
        <div className="stats-missing">
          No detailed 2025-26 stats available for this player.
        </div>
      )}
    </div>
  );
}