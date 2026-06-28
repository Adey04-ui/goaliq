"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import useSWR from "swr"
import { Search, X, ChevronDown, Check, Loader } from "lucide-react"
import { PitchSVG } from "@/app/components/BuildYourXI"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

// All formations
const FORMATIONS = {
  "4-3-3": [
    // Attack — moved down from y:12 and y:8
    { label: "LW", x: 18, y: 28 },
    { label: "ST", x: 50, y: 24 },
    { label: "RW", x: 82, y: 28 },
    // Midfield
    { label: "CM", x: 22, y: 48 },
    { label: "CM", x: 50, y: 44 },
    { label: "CM", x: 78, y: 48 },
    // Defense
    { label: "LB", x: 10, y: 64 },
    { label: "CB", x: 34, y: 67 },
    { label: "CB", x: 66, y: 67 },
    { label: "RB", x: 90, y: 64 },
    // GK — moved up from y:88
    { label: "GK", x: 50, y: 82 },
  ],
  "4-4-2": [
    { label: "ST",  x: 35, y: 24 },
    { label: "ST",  x: 65, y: 24 },
    { label: "LM",  x: 10, y: 46 },
    { label: "CM",  x: 35, y: 44 },
    { label: "CM",  x: 65, y: 44 },
    { label: "RM",  x: 90, y: 46 },
    { label: "LB",  x: 10, y: 64 },
    { label: "CB",  x: 34, y: 67 },
    { label: "CB",  x: 66, y: 67 },
    { label: "RB",  x: 90, y: 64 },
    { label: "GK",  x: 50, y: 82 },
  ],
  "4-2-3-1": [
    { label: "ST",  x: 50, y: 24 },
    { label: "LAM", x: 18, y: 40 },
    { label: "CAM", x: 50, y: 37 },
    { label: "RAM", x: 82, y: 40 },
    { label: "CDM", x: 35, y: 54 },
    { label: "CDM", x: 65, y: 54 },
    { label: "LB",  x: 10, y: 67 },
    { label: "CB",  x: 34, y: 69 },
    { label: "CB",  x: 66, y: 69 },
    { label: "RB",  x: 90, y: 67 },
    { label: "GK",  x: 50, y: 82 },
  ],
  "3-5-2": [
    { label: "ST",  x: 35, y: 25 },
    { label: "ST",  x: 65, y: 25 },
    { label: "LWB", x: 14,  y: 49 },
    { label: "CM",  x: 30, y: 43 },
    { label: "CM",  x: 50, y: 40 },
    { label: "CM",  x: 70, y: 43 },
    { label: "RWB", x: 86, y: 49 },
    { label: "CB",  x: 25, y: 66 },
    { label: "CB",  x: 50, y: 69 },
    { label: "CB",  x: 75, y: 66 },
    { label: "GK",  x: 50, y: 82 },
  ],
}

// Player picker modal
function PlayerPicker({ position, onSelect, onClose }) {
  const [tab, setTab] = useState("search") // "search" | "team"
  const [searchQuery, setSearchQuery] = useState("")
  const [teamQuery, setTeamQuery] = useState("")
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [selectedTeamName, setSelectedTeamName] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [debouncedTeam, setDebouncedTeam] = useState("")

  const season = "2022"

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 500)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedTeam(teamQuery), 500)
    return () => clearTimeout(t)
  }, [teamQuery])

  // Search players by name
  const { data: searchResults, isLoading: searchLoading } = useSWR(
    tab === "search" && debouncedSearch.length >= 2
      ? `/api/players/search?q=${encodeURIComponent(debouncedSearch)}&season=${season}`
      : null,
    fetcher
  )

  // Search teams
  const { data: teamResults, isLoading: teamLoading } = useSWR(
    tab === "team" && !selectedTeamId && debouncedTeam.length >= 2
      ? `/api/teams/search?q=${encodeURIComponent(debouncedTeam)}&season=${season}`
      : null,
    fetcher
  )

  // Browse players by team
  const { data: teamPlayers, isLoading: teamPlayersLoading } = useSWR(
    tab === "team" && selectedTeamId
      ? `/api/players/search?team=${selectedTeamId}&season=${season}`
      : null,
    fetcher
  )

  const players = tab === "search"
    ? searchResults?.data ?? []
    : teamPlayers?.data ?? []

  const isLoading = tab === "search" ? searchLoading : teamPlayersLoading

  return (
    <div className="xiPage__pickerBackdrop" onClick={onClose}>
      <div
        className="xiPage__picker"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="xiPage__picker__header">
          <span className="xiPage__picker__title">
            Pick {position.label}
          </span>
          <button className="xiPage__picker__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="xiPage__picker__tabs">
          <button
            className={`xiPage__picker__tab ${tab === "search" ? "active" : ""}`}
            onClick={() => setTab("search")}
          >
            Search Player
          </button>
          <button
            className={`xiPage__picker__tab ${tab === "team" ? "active" : ""}`}
            onClick={() => { setTab("team"); setSelectedTeamId(null) }}
          >
            Browse by Team
          </button>
        </div>

        {/* Search tab */}
        {tab === "search" && (
          <div className="xiPage__picker__body">
            <div className="xiPage__picker__searchBar">
              <Search size={15} color="#5c5c5c" />
              <input
                autoFocus
                type="text"
                placeholder="Search player name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <PlayerList
              players={players}
              isLoading={isLoading}
              showPrompt={debouncedSearch.length < 2}
              prompt="Type at least 2 characters to search"
              onSelect={onSelect}
            />
          </div>
        )}

        {/* Team tab */}
        {tab === "team" && (
          <div className="xiPage__picker__body">
            {!selectedTeamId ? (
              <>
                <div className="xiPage__picker__searchBar">
                  <Search size={15} color="#5c5c5c" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search team name..."
                    value={teamQuery}
                    onChange={e => setTeamQuery(e.target.value)}
                  />
                </div>
                {teamLoading && (
                  <div className="xiPage__picker__loading">
                    <Loader size={16} className="xiPage__spinner" />
                  </div>
                )}
                {teamResults?.data?.map(team => (
                  <div
                    key={team.id}
                    className="xiPage__picker__teamRow"
                    onClick={() => {
                      setSelectedTeamId(team.id)
                      setSelectedTeamName(team.name)
                    }}
                  >
                    <Image src={team.logo} alt={team.name} width={28} height={28} />
                    <span>{team.name}</span>
                  </div>
                ))}
              </>
            ) : (
              <>
                <button
                  className="xiPage__picker__backToTeams"
                  onClick={() => setSelectedTeamId(null)}
                >
                  ← {selectedTeamName}
                </button>
                <PlayerList
                  players={players}
                  isLoading={teamPlayersLoading}
                  showPrompt={false}
                  onSelect={onSelect}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function PlayerList({ players, isLoading, showPrompt, prompt, onSelect }) {
  if (showPrompt) {
    return (
      <div className="xiPage__picker__prompt">{prompt}</div>
    )
  }

  if (isLoading) {
    return (
      <div className="xiPage__picker__loading">
        <Loader size={16} className="xiPage__spinner" />
      </div>
    )
  }

  if (!players.length) {
    return <div className="xiPage__picker__prompt">No players found</div>
  }

  return (
    <div className="xiPage__picker__playerList">
      {players.map(player => (
        <div
          key={player.id}
          className="xiPage__picker__playerRow"
          onClick={() => onSelect(player)}
        >
          <div className="xiPage__picker__playerPhoto">
            <Image
              src={player.photo}
              alt={player.name}
              width={36}
              height={36}
            />
          </div>
          <div className="xiPage__picker__playerInfo">
            <span className="xiPage__picker__playerName">{player.name}</span>
            <span className="xiPage__picker__playerMeta">
              {player.position} · {player.team}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// Slot on the pitch
function EditableSlot({ position, player, isSelected, onClick }) {
  const size = 52

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        cursor: "pointer",
        zIndex: 10,
      }}
      onClick={onClick}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          border: isSelected
            ? "2px solid #0222d8"
            : player
              ? "2px solid rgba(255,255,255,0.4)"
              : "2px dashed rgba(255,255,255,0.2)",
          background: player ? "transparent" : "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border 0.2s, transform 0.2s",
          transform: isSelected ? "scale(1.1)" : "scale(1)",
        }}
      >
        {player?.photo ? (
          <Image
            src={player.photo}
            alt={player.name}
            width={size}
            height={size}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <svg width={22} height={22} viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        )}
      </div>

      <div style={{
        background: isSelected ? "#0222d8" : "rgba(0,0,0,0.7)",
        borderRadius: 4,
        padding: "1px 6px",
        transition: "background 0.2s",
      }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>
          {player ? player.name.split(" ").pop() : position.label}
        </span>
      </div>
    </div>
  )
}

export default function XIPage() {
  const [formation, setFormation] = useState("4-3-3")
  const [players, setPlayers] = useState(Array(11).fill(null))
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showFormationPicker, setShowFormationPicker] = useState(false)

  // Load saved XI on mount
  const { data: xiData } = useSWR("/api/xi", fetcher)

  useEffect(() => {
    if (xiData?.data) {
      setFormation(xiData.data.formation)
      setPlayers(xiData.data.players ?? Array(11).fill(null))
    }
  }, [xiData])

  const positions = FORMATIONS[formation]

  const handleSlotClick = (index) => {
    setSelectedSlot(index === selectedSlot ? null : index)
  }

  const handlePlayerSelect = (player) => {
    setPlayers(prev => {
      const updated = [...prev]
      updated[selectedSlot] = player
      return updated
    })
    setSelectedSlot(null)
    setSaved(false)
  }

  const handleRemovePlayer = (index, e) => {
    e.stopPropagation()
    setPlayers(prev => {
      const updated = [...prev]
      updated[index] = null
      return updated
    })
    setSaved(false)
  }

  const handleFormationChange = (newFormation) => {
    setFormation(newFormation)
    setPlayers(Array(11).fill(null)) // reset players on formation change
    setShowFormationPicker(false)
    setSaved(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/xi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formation, players }),
      })
      const result = await res.json()
      if (result.success) setSaved(true)
    } catch (err) {
      console.error("Save failed", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="parent-container">
      <div className="xiPage">
        {/* Page header */}
        <div className="xiPage__header">
          <h1 className="xiPage__heading">Build Your XI</h1>

          <div className="xiPage__actions">
            {/* Formation picker */}
            <div className="xiPage__formationPicker">
              <button
                className="xiPage__formationBtn"
                onClick={() => setShowFormationPicker(p => !p)}
              >
                {formation}
                <ChevronDown size={14} />
              </button>

              {showFormationPicker && (
                <div className="xiPage__formationDropdown">
                  {Object.keys(FORMATIONS).map(f => (
                    <button
                      key={f}
                      className={`xiPage__formationOption ${formation === f ? "active" : ""}`}
                      onClick={() => handleFormationChange(f)}
                    >
                      {f}
                      {formation === f && <Check size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Save button */}
            <button
              className={`xiPage__saveBtn ${saved ? "saved" : ""}`}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : saved ? "Saved ✓" : "Save XI"}
            </button>
          </div>
        </div>

        <div className="xiPage__body">
          {/* Pitch */}
          <div className="xiPage__pitchWrap">
            <div className="xiPage__pitch">
              <PitchSVG />
              {positions.map((position, index) => (
                <div key={`${formation}-${index}`}>
                  <EditableSlot
                    position={position}
                    player={players[index]}
                    isSelected={selectedSlot === index}
                    onClick={() => handleSlotClick(index)}
                  />
                  {/* Remove button if player exists */}
                  {players[index] && (
                    <button
                      className="xiPage__removeBtn"
                      style={{
                        position: "absolute",
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                        transform: "translate(8px, -28px)",
                        zIndex: 20,
                      }}
                      onClick={(e) => handleRemovePlayer(index, e)}
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Side panel — selected player info or instructions */}
          <div className="xiPage__sidePanel">
            {selectedSlot !== null ? (
              <div className="xiPage__sidePanelHint">
                <div className="xiPage__sidePanelLabel">
                  Picking for
                </div>
                <div className="xiPage__sidePanelPosition">
                  {positions[selectedSlot]?.label}
                </div>
                <div className="xiPage__sidePanelSub">
                  Use the search below or browse by team
                </div>
              </div>
            ) : (
              <div className="xiPage__sidePanelHint">
                <div className="xiPage__sidePanelSub">
                  Tap a position on the pitch to pick a player
                </div>
              </div>
            )}

            {/* Current lineup list */}
            <div className="xiPage__lineup">
              {positions.map((pos, index) => (
                <div
                  key={index}
                  className={`xiPage__lineupRow ${selectedSlot === index ? "active" : ""}`}
                  onClick={() => handleSlotClick(index)}
                >
                  <span className="xiPage__lineupPos">{pos.label}</span>
                  {players[index] ? (
                    <div className="xiPage__lineupPlayer">
                      <Image
                        src={players[index].photo}
                        alt={players[index].name}
                        width={28}
                        height={28}
                        style={{ borderRadius: "50%" }}
                      />
                      <span className="xiPage__lineupName">
                        {players[index].name}
                      </span>
                    </div>
                  ) : (
                    <span className="xiPage__lineupEmpty">Empty</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Player picker modal */}
        {selectedSlot !== null && (
          <PlayerPicker
            position={positions[selectedSlot]}
            onSelect={handlePlayerSelect}
            onClose={() => setSelectedSlot(null)}
          />
        )}
      </div>
    </div>
  )
}