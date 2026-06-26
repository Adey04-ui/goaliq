import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { toggleFavourite } from "@/services/favourites"
import { toast } from "react-toastify"
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

function LeaguesList({ leagues, onSelectLeague, isLoading }) {
  const { favorites, setFavorites } = useFavorites()

  const handleFav = (league) => {
    const key = league.id

    const exists = favorites?.league?.some(
      (fav) => fav.itemId === key
    )

    // 1. optimistic UI update
    setFavorites((prev) => {
      const list = prev.league || []

      let updated

      if (exists) {
        updated = list.filter(f => f.itemId !== key)
      } else {
        updated = [
          ...list,
          {
            itemId: key,
            name: league.name,
            logo: league.logo,
            type: "LEAGUE",
          },
        ]
      }

      return {
        ...prev,
        league: updated,
      }
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
    favorites?.league?.map((fav) => fav.itemId) || []
  )
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: {
      x: -40,
      opacity: 0,
    },
    show: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 18,
      },
    },
  }
  console.log(leagues)
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence>
        {!isLoading ? leagues.map((league) => {
          const isFavourite = favouriteLeagueIds.has(league.league.id)
          return (
            <motion.div variants={itemVariants} className="eachList" key={league.league.id} onClick={() => onSelectLeague(league)}>
              <div className="left">
                <div className="leagueImage">
                  <Image width={40} height={40} alt="league_logo" src={league.league.logo} style={{ objectPosition: 'center', objectFit: 'contain' }} />
                </div>
                <div className="leagueDetails">
                  <div className="leagueName">
                    {league.league.name}
                  </div>
                  <div className="countryName">
                    {league.country.flag && (
                      <div className="countryImage">
                        <Image width={15} height={15} alt="country_flag" src={league.country.flag} style={{ borderRadius: '4px' }} />
                      </div>
                    )}
                    {league.country.name}
                  </div>
                </div>
              </div>
              <div className="right">
                <div className="favourite-btn" onClick={(e) => {
                  e.stopPropagation()
                  handleFav(league.league)
                }}>
                  <svg style={{ strokeWidth: 1, height: 22, width: 22, stroke: '#fff', }} viewBox="0 0 24 24"
                    className={`favourite-svg ${isFavourite ? 'filled' : ''}`}>
                    <polygon points="12 3 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
                  </svg>
                </div>
                <div className="navigation-btn">
                  <ChevronRight size={20} color="#5c5c5c" />
                </div>
              </div>
            </motion.div>
          )
        }) : (
          Array.from({ length: 7 }).map((_, i) => (
            <LeagueSkeleton key={i} />
          ))
        )}
      </AnimatePresence>
    </motion.div>

  )
}

export default LeaguesList