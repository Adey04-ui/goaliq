import Header from "@/app/components/Header"
import LeaguesComponent from "@/app/components/LeaguesComponent"

function Leagues() {
  return (
    <div className="parent-container">
      <div className="leaguesLeftSide">
        <Header page={'leagues'} />
        <LeaguesComponent />
      </div>
      <div className="leaguesRightSide">

      </div>
    </div>
  )
}

export default Leagues