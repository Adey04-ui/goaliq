import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { toggleFavourite } from "@/services/favourites"
import { useFavorites } from "@/context/favoriteContext"
import { motion, AnimatePresence } from "framer-motion"
import LeagueSkeleton from "./LeagueSkeleton"

let flushTimer = null
const favQueue = new Map()

const scheduleFlush = () => {
  if (flushTimer) return
  flushTimer = setTimeout(async () => {
    const items = [...favQueue.values()]
    favQueue.clear()
    flushTimer = null
    for (const item of items) {
      try {
        await toggleFavourite({
          itemId: item.itemId,
          type: item.type,
          name: item.name,
          logo: item.logo,
        })
      } catch (err) {
        console.log("failed toggle", item)
      }
    }
  }, 800)
}

// Normalize both shapes into one consistent shape
function normalizeLeague(league) {
  // Search index shape — flat
  if (league.id !== undefined) {
    return {
      id: league.id,
      name: league.name,
      logo: league.logo,
      type: league.type,
      countryName: league.country,
      countryFlag: league.flag,
      // raw for passing to Standings which expects nested shape
      raw: null,
    }
  }

  // Normal API shape — nested
  return {
    id: league.league.id,
    name: league.league.name,
    logo: league.league.logo,
    type: league.league.type,
    countryName: league.country.name,
    countryFlag: league.country.flag,
    // raw for passing to Standings
    raw: league,
  }
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { x: -40, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
}

function LeaguesList({ leagues, onSelectLeague, isLoading, isSearchResult }) {
  const { favorites, setFavorites } = useFavorites()

  const handleFav = (league) => {
    const key = league.id
    const exists = favorites?.league?.some(fav => fav.itemId === key)

    setFavorites((prev) => {
      const list = prev.league || []
      const updated = exists
        ? list.filter(f => f.itemId !== key)
        : [...list, { itemId: key, name: league.name, logo: league.logo, type: "LEAGUE" }]
      return { ...prev, league: updated }
    })

    favQueue.set(key, {
      itemId: key,
      type: "LEAGUE",
      name: league.name,
      logo: league.logo,
      action: exists ? "REMOVE" : "ADD",
    })

    scheduleFlush()
  }

  const favouriteLeagueIds = new Set(
    favorites?.league?.map(fav => fav.itemId) || []
  )

  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 7 }).map((_, i) => (
          <LeagueSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!leagues.length) {
    return (
      <div style={{ padding: '20px 14px', color: '#555', fontSize: '13px' }}>
        No leagues found
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <AnimatePresence>
        {leagues.map((rawLeague) => {
          const league = normalizeLeague(rawLeague)
          const isFavourite = favouriteLeagueIds.has(league.id)

          return (
            <motion.div
              variants={itemVariants}
              className="eachList"
              key={league.id}
              onClick={() => {
                if (league.raw) {
                  onSelectLeague(league.raw)
                } else {
                  onSelectLeague({
                    league: { id: league.id, name: league.name, logo: league.logo, type: league.type },
                    country: { name: league.countryName, flag: league.countryFlag },
                  })
                }
              }}
            >
              <div className="left">
                <div className="leagueImage">
                  <Image
                    width={40}
                    height={40}
                    alt="league_logo"
                    src={league.logo}
                    style={{ objectPosition: 'center', objectFit: 'contain' }}
                  />
                </div>
                <div className="leagueDetails">
                  <div className="leagueName">{league.name}</div>
                  <div className="countryName">
                    {league.countryFlag && (
                      <div className="countryImage">
                        <Image
                          width={15}
                          height={15}
                          alt="country_flag"
                          src={league.countryFlag}
                          style={{ borderRadius: '4px' }}
                        />
                      </div>
                    )}
                    {league.countryName}
                  </div>
                </div>
              </div>

              <div className="right">
                <div
                  className="favourite-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleFav(league)
                  }}
                >
                  <svg
                    style={{ strokeWidth: 1, height: 22, width: 22, stroke: '#fff' }}
                    viewBox="0 0 24 24"
                    className={`favourite-svg ${isFavourite ? 'filled' : ''}`}
                  >
                    <polygon points="12 3 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
                  </svg>
                </div>
                <div className="navigation-btn">
                  <ChevronRight size={20} color="#5c5c5c" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}

export default LeaguesList