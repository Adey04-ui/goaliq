import Image from "next/image"
import { ChevronRight } from "lucide-react"

function LeaguesList({ leagues, onSelectLeague }) {
  const handleFav = async (league) => {
    const req = await toggleFavourite({
      itemId: league.id,
      type: "LEAGUE",
      name: league.name,
      logo: league.logo,
    })

    if (req) {

    }
  }
  return (
    leagues.map((league) => (
      <div className="eachList" key={league.league.id} onClick={()=> onSelectLeague(league.league)}>
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
              className="favourite-svg">
              <polygon points="12 3 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
            </svg>
          </div>
          <div className="navigation-btn">
            <ChevronRight size={20} color="#5c5c5c" />
          </div>
        </div>
      </div>
    ))

  )
}

export default LeaguesList