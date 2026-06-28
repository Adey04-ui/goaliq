import Header from "@/app/components/Header"
import LeaguesComponent from "@/app/components/LeaguesComponent"
import NewsPreview from "@/app/components/NewsPreview"
import BuildYourXI from "@/app/components/BuildYourXI"

function Leagues() {
  return (
    <div className="parent-container" style={{ flexDirection: 'row', gap: '20px' }}>
      <div className="leaguesLeftSide">
        <Header page={'leagues'} />
        <LeaguesComponent />
      </div>
      <div className="leaguesRightSide">
        <BuildYourXI players={[]} />
        <NewsPreview />
      </div>
    </div>
  )
}

export default Leagues