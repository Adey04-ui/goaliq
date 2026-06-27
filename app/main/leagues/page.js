import Header from "@/app/components/Header"
import LeaguesComponent from "@/app/components/LeaguesComponent"
import NewsPreview from "@/app/components/NewsPreview"

function Leagues() {
  return (
    <div className="parent-container" style={{flexDirection: 'row', gap: '20px'}}>
      <div className="leaguesLeftSide">
        <Header page={'leagues'} />
        <LeaguesComponent />
      </div>
      <div className="leaguesRightSide">
      <NewsPreview />
      </div>
    </div>
  )
}

export default Leagues