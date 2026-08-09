import AIAssistant from "@/app/components/AIAssistant"
import BuildYourXI from "@/app/components/BuildYourXI"
import HomeBody from "@/app/components/HomeBody"
import NewsPreview from "@/app/components/NewsPreview"

function Home() {
  return (
    <div className="parent-container" style={{ flexDirection: 'row', gap: '20px' }}>
        <HomeBody />
    </div>
  )
}

export default Home