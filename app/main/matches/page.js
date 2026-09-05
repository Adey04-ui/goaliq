import AIAssistant from "@/app/components/AIAssistant"
import BuildYourXI from "@/app/components/BuildYourXI"
import HomeBody from "@/app/components/HomeBody"
import NewsPreview from "@/app/components/NewsPreview"
import Footer from "@/app/components/Footer"

function Home() {
  return (
    <div className="parent-container" style={{ flexDirection: 'column', gap: '20px' }}>
        <HomeBody />
        <Footer />
    </div>
  )
}

export default Home