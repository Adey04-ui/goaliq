import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { toggleFavourite } from "@/services/favourites"
import { toast } from "react-toastify"
import { useFavorites } from "@/context/favoriteContext"

function LeaguesList({ leagues, onSelectLeague }) {
  const { favorites, setFavorites } = useFavorites()
  const handleFav = async (league) => {
    try {
      const req = await toggleFavourite({
        itemId: league.id,
        type: "LEAGUE",
        name: league.name,
        logo: league.logo,
      })
      if (req) {
        toast.info(req?.message || req?.error)
      }

      if (req?.data?.removed) {
        toast.info("Removed from favourites")
      } else {
        toast.success("Added to favourites")
      }

      setFavorites((prev) => {
        const exists = prev.league?.some(
          (fav) => fav.itemId === league.id
        )

        let updatedLeagues

        if (exists) {
          updatedLeagues = prev.league.filter(
            (fav) => fav.itemId !== league.id
          )
        } else {
          updatedLeagues = [
            ...(prev.league || []),
            {
              itemId: league.id,
              name: league.name,
              logo: league.logo,
              type: "LEAGUE",
            },
          ]
        }

        return {
          ...prev,
          league: updatedLeagues,
        }
      })
    } catch (error) {
      toast.error(error.message || "An error occurred while toggling favourite.")
    }

  }
  const favouriteLeagueIds = new Set(
    favorites?.league?.map((fav) => fav.itemId) || []
  )
  return (
    leagues.map((league) => {
      const isFavourite = favouriteLeagueIds.has(league.league.id)
      return (
        <div className="eachList" key={league.league.id} onClick={() => onSelectLeague(league)}>
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
        </div>
      )
    })

  )
}

export default LeaguesList