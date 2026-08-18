// app/main/players/[id]/OverviewTab.jsx
function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-card__value">{value ?? '—'}</div>
      <div className="stat-card__label">{label}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}

export default function OverviewTab({ csv }) {
  if (!csv) {
    return <div className="tab-empty">No 2025-26 stats available for this player.</div>;
  }

  return (
    <div className="tab-grid">
      <div className="tab-section">
        <h3 className="tab-section__title">2025-26 Season · {csv.squad}</h3>
        <div className="stat-grid">
          <StatCard label="Matches" value={csv.mp} />
          <StatCard label="Starts" value={csv.starts} />
          <StatCard label="Minutes" value={csv.minutes?.toLocaleString()} />
          <StatCard label="90s Played" value={csv.n90s} />
          <StatCard label="Goals" value={csv.goals} />
          <StatCard label="Assists" value={csv.assists} />
          <StatCard label="G+A" value={csv.gA} />
          <StatCard label="Non-PK Goals" value={csv.gPk} />
          <StatCard label="Penalties" value={`${csv.pk || 0}/${csv.pkatt || 0}`} sub="Scored/Taken" />
          <StatCard label="Yellow / Red" value={`${csv.crdY || 0} / ${csv.crdR || 0}`} />
        </div>
      </div>
    </div>
  );
}