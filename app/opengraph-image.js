import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "GOALIQ — Live Football Scores, Fixtures & News"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    <div style={{
      width:"100%",height:"100%",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",background:"#0c1117",
      color:"white",fontFamily:"Arial",position:"relative",overflow:"hidden"
    }}>
      <div style={{position:"absolute",width:520,height:520,borderRadius:"50%",
        border:"1px solid rgba(255,255,255,0.08)",top:-180,right:-120}} />
      <div style={{position:"absolute",width:420,height:420,borderRadius:"50%",
        border:"1px solid rgba(255,255,255,0.06)",bottom:-210,left:-120}} />
      <div style={{display:"flex",alignItems:"center",fontSize:86,fontWeight:800,letterSpacing:-4}}>
        <span>GOAL</span><span style={{fontWeight:950}}>IQ</span>
      </div>
      <div style={{marginTop:24,fontSize:30,color:"#aab4c0",letterSpacing:.5}}>
        Live football scores, fixtures, news & stats
      </div>
      <div style={{display:"flex",marginTop:44,gap:18,fontSize:22,color:"#d7dee7"}}>
        <span>LIVE SCORES</span><span>•</span><span>FIXTURES</span>
        <span>•</span><span>STANDINGS</span><span>•</span><span>NEWS</span>
      </div>
    </div>,
    size
  )
}