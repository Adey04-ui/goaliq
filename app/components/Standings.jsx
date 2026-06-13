import useSWR from "swr"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()

  if (!res.ok) {
    throw new Error(result.message)
  }

  return result
}

export default function Standings({ league, onBack, season }) {
   const {
    data,
    isLoading,
  } = useSWR(
    league
      ? `/api/standings?league=${league.id}&season=${season}`
      : null,
    fetcher,
    {
      dedupingInterval: 60000,
      revalidateOnFocus: false,
    }
  )

  console.log(data)
  console.log("selected from standings", season)

  if (!league) return null
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