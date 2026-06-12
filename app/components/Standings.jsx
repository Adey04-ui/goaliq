function Standings({ league, onBack, selected }) {
  return (
    <div className="standingsContainer">
      <button onClick={onBack}>
        Back
      </button>

      <h2>{league.name}</h2>

      <p>Standings will go here...</p>
    </div>
  )
}