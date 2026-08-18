function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-card__value">{value ?? '—'}</div>
      <div className="stat-card__label">{label}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}

export default function ShootingTab({ csv }) {
  if (!csv) return <div className="tab-empty">No shooting data available.</div>;

  return (
    <div className="tab-section">
      <h3 className="tab-section__title">Shooting · 2025-26 · {csv.squad}</h3>
      <div className="stat-grid stat-grid--4">
        <StatCard label="Shots" value={csv.shots} />
        <StatCard label="Shots on Target" value={csv.shotsOnTarget} />
        <StatCard label="SoT %" value={csv.sotPct} sub="%" />
        <StatCard label="Goals per Shot" value={csv.gSh} />
        <StatCard label="Goals per SoT" value={csv.gSot} />
        <StatCard label="Shots / 90" value={csv.sh90} />
        <StatCard label="SoT / 90" value={csv.sot90} />
        <StatCard label="PK Attempts" value={csv.pkatt} />
      </div>
    </div>
  );
}