function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-card__value">{value ?? '—'}</div>
      <div className="stat-card__label">{label}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}

export default function MiscTab({ csv, player }) {
  if (!csv) return <div className="tab-empty">No misc data available.</div>;

  const isKeeper = player.position === 'Goalkeeper' || csv.position === 'GK';

  return (
    <div className="tab-section">
      <h3 className="tab-section__title">
        {isKeeper ? 'Keeper Stats' : 'Defense & Discipline'} · 2025-26 · {csv.squad}
      </h3>

      {isKeeper ? (
        <div className="stat-grid stat-grid--4">
          <StatCard label="Goals Against" value={csv.ga} />
          <StatCard label="GA / 90" value={csv.ga90} />
          <StatCard label="Shots on Target Against" value={csv.sota} />
          <StatCard label="Saves" value={csv.saves} />
          <StatCard label="Save %" value={csv.savePct} sub="%" />
          <StatCard label="Clean Sheets" value={csv.cs} />
          <StatCard label="CS %" value={csv.csPct} sub="%" />
        </div>
      ) : (
        <div className="stat-grid stat-grid--4">
          <StatCard label="Tackles Won" value={csv.tklW} />
          <StatCard label="Interceptions" value={csv.int} />
          <StatCard label="Crosses" value={csv.crs} />
          <StatCard label="Fouls" value={csv.fls} />
          <StatCard label="Fouled" value={csv.fld} />
          <StatCard label="Offsides" value={csv.off} />
          <StatCard label="Own Goals" value={csv.og} />
          <StatCard label="Yellow / Red" value={`${csv.crdY} / ${csv.crdR}`} />
        </div>
      )}
    </div>
  );
}