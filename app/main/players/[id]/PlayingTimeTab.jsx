function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-card__value">{value ?? '—'}</div>
      <div className="stat-card__label">{label}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}

export default function PlayingTimeTab({ csv }) {
  if (!csv) return <div className="tab-empty">No playing time data available.</div>;

  return (
    <div className="tab-section">
      <h3 className="tab-section__title">Playing Time · 2025-26 · {csv.squad}</h3>
      <div className="stat-grid stat-grid--4">
        <StatCard label="Starts" value={csv.starts} />
        <StatCard label="Minutes" value={csv.minutes?.toLocaleString()} />
        <StatCard label="Min / Match" value={csv.mnMp} />
        <StatCard label="Min %" value={csv.minPct} sub="%" />
        <StatCard label="Full 90s" value={csv.compl} />
        <StatCard label="Substitutions" value={csv.subs} />
        <StatCard label="Min / Sub" value={csv.mnSub} />
        <StatCard label="Unused Sub" value={csv.unSub} />
      </div>
      
      <div className="tab-section__note">
        <span>On-pitch goal diff:</span>
        <strong> {csv.plusMinus > 0 ? '+' : ''}{csv.plusMinus}</strong>
        <span> ({csv.plusMinus90 > 0 ? '+' : ''}{csv.plusMinus90} / 90)</span>
      </div>
    </div>
  );
}