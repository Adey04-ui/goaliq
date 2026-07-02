// app/main/team/[teamId]/TeamSquad.jsx
import useSWR from "swr"
import Image from "next/image"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

const POSITION_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Attacker"]

export default function TeamSquad({ teamId, active }) {
  // Only fires when this tab is actually active — zero wasted requests
  const { data, isLoading } = useSWR(
    active === "Squad" ? `/api/teams/${teamId}/squad` : null,
    fetcher,
    { dedupingInterval: 60000, revalidateOnFocus: false }
  )

  if (isLoading) {
    return (
      <div className="teamSquad">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="teamSquad__skeleton" />
        ))}
      </div>
    )
  }

  const grouped = data?.data ?? {}

  return (
    <div className="teamSquad">
      {POSITION_ORDER.map(position => {
        const players = grouped[position] ?? []
        if (!players.length) return null

        return (
          <div key={position} className="teamSquad__group">
            <div className="teamSquad__groupLabel">{position}s</div>
            {players.map(player => (
              <div key={player.id} className="teamSquad__row">
                <Image
                  src={player.photo}
                  alt={player.name}
                  width={36}
                  height={36}
                  style={{ borderRadius: "50%" }}
                />
                <div className="teamSquad__rowInfo">
                  <span className="teamSquad__rowName">{player.name}</span>
                  <span className="teamSquad__rowMeta">
                    #{player.number ?? "-"} · Age {player.age}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}