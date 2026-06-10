import React from 'react'
import Image from 'next/image'

function HomeBody() {
  return (
    < div className="main-container" >
      <div className="Matches-section">
        <div className="ads-Image-container">
          <Image height={20} width={20} className="ads-picture" src="/goalIQ22.png" alt="ads" />
        </div>
        <div className="father-today-the-rest">
          <div className="today-right-left-arrow">
            <button className="today-side-arrow-button">
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="white" fill="none" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <div className="date-picker">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="8" y1="3" x2="8" y2="7" />
                <line x1="16" y1="3" x2="16" y2="7" />
              </svg>
              Today
            </div>
            <button className="today-side-arrow-button">
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="white" fill="none" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          <div className="live-finished-trending-all-main-container">
            <button className="live-button">live</button>
            <button className="l-f-t-a-button">finished</button>
            <button className="l-f-t-a-button">trending</button>
            <button className="l-f-t-a-button">all</button>
          </div>
        </div>
        <div className="livematches-section">
          <div className="livematches-container">
            <div className="live-matches-header">
              <div style={{ fontWeight: 600, display: 'flex', gap: '10px', alignItems: 'center', }}>
                <span className="pulsing-dot"></span>
                live matches
              </div>
              <div style={{ fontSize: '13px', display: 'flex', gap: '10px', placeItems: 'center', cursor: 'pointer', }}
                className="see-all-btn">
                see all
                <div>
                  <svg className="seeall-svg" clxmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    viewBox="0 0 16 16" fill="none">
                    <path d="M6 3H3C2.45 3 2 3.45 2 4V13C2 13.55 2.45 14 3 14H12C12.55 14 13 13.55 13 13V10"
                      stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="8" y1="8" x2="14" y2="2" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                    <polyline points="10,2 14,2 14,6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"
                      strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="matches">
              <div className="each-match">
                <div className="time">
                  63&apos;
                </div>
                <div className="teams">
                  <div className="home-team">
                    <Image height={20} width={20} src="/mancity.png" alt="team_logo" className="team-logo" />
                    <span>
                      Man City
                    </span>
                  </div>
                  <div className="scores">
                    2 - 1
                  </div>
                  <div className="away-team">
                    <Image height={20} width={20} src="/tottenham.png" alt="team_logo" className="team-logo" />
                    <span>
                      Tottenham
                    </span>
                  </div>
                </div>
                <div className="favourite-btn">
                  <svg style={{ strokeWidth: 1, height: 22, width: 22, stroke: '#fff', }} viewBox="0 0 24 24"
                    className="favourite-svg">
                    <polygon points="12 3 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
                  </svg>
                </div>
              </div>
              <div className="each-match">
                <div className="time">
                  63&apos;
                </div>
                <div className="teams">
                  <div className="home-team">
                    <Image height={20} width={20} src="/leverkusen.PNG.png" alt="team_logo" className="team-logo" />
                    <span>
                      Leverkusen
                    </span>
                  </div>
                  <div className="scores">
                    2 - 1
                  </div>
                  <div className="away-team">
                    <Image height={20} width={20} src="/stuttgart.PNG.png" alt="team_logo" className="team-logo" />
                    <span>
                      Stuttgart
                    </span>
                  </div>
                </div>
                <div className="favourite-btn">
                  <svg style={{ strokeWidth: 1, height: 22, width: 22, stroke: '#fff', }} viewBox="0 0 24 24"
                    className="favourite-svg">
                    <polygon points="12 3 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
                  </svg>
                </div>
              </div>
              <div className="each-match">
                <div className="time">
                  63&apos;
                </div>
                <div className="teams">
                  <div className="home-team">
                    <Image height={20} width={20} src="/psg.png" alt="team_logo" className="team-logo" />
                    <span>
                      PSG
                    </span>
                  </div>
                  <div className="scores">
                    2 - 1
                  </div>
                  <div className="away-team">
                    <Image height={20} width={20} src="/lyon.PNG.png" alt="team_logo" className="team-logo" />
                    <span>
                      Lyon
                    </span>
                  </div>
                </div>
                <div className="favourite-btn">
                  <svg style={{ strokeWidth: 1, height: 22, width: 22, stroke: '#fff', }} viewBox="0 0 24 24"
                    className="favourite-svg">
                    <polygon points="12 3 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="livematches-section">
          <div className="livematches-container">
            <div className="live-matches-header">
              <div style={{ fontWeight: 600, display: 'flex', gap: '10px', alignItems: 'center', }}>
                today matches
              </div>
              <div style={{ fontSize: '13px', display: 'flex', gap: '10px', placeItems: 'center', cursor: 'pointer', }}
                className="see-all-btn">
                see all
                <div>
                  <svg className="seeall-svg" clxmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    viewBox="0 0 16 16" fill="none">
                    <path d="M6 3H3C2.45 3 2 3.45 2 4V13C2 13.55 2.45 14 3 14H12C12.55 14 13 13.55 13 13V10"
                      stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="8" y1="8" x2="14" y2="2" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                    <polyline points="10,2 14,2 14,6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"
                      strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="matches">
              <div className="each-match">
                <div className="time-2">
                  17:30
                </div>
                <div className="teams">
                  <div className="home-team">
                    <Image height={20} width={20} src="/mancity.png" alt="team_logo" className="team-logo" />
                    <span>
                      Man City
                    </span>
                  </div>
                  <div className="vs">
                    vs
                  </div>
                  <div className="away-team">
                    <Image height={20} width={20} src="/tottenham.png" alt="team_logo" className="team-logo" />
                    <span>
                      Tottenham
                    </span>
                  </div>
                </div>
                <div className="favourite-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22"
                    className="favourite-svg">
                    <path d="M10 2C10 2 5 4 5 10V15L3 17H17L15 15V10C15 4 10 2 10 2Z" stroke="white"
                      strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M8 17C8 18.1 8.9 19 10 19C11.1 19 12 18.1 12 17" stroke="white" strokeWidth="1.5" />
                    <line x1="10" y1="1" x2="10" y2="3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="each-match">
                <div className="time-2">
                  17:30
                </div>
                <div className="teams">
                  <div className="home-team">
                    <Image height={20} width={20} src="/leverkusen.PNG.png" alt="team_logo" className="team-logo" />
                    <span>
                      Leverkusen
                    </span>
                  </div>
                  <div className="vs">
                    vs
                  </div>
                  <div className="away-team">
                    <Image height={20} width={20} src="/stuttgart.PNG.png" alt="team_logo" className="team-logo" />
                    <span>
                      Stuttgart
                    </span>
                  </div>
                </div>
                <div className="favourite-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22"
                    className="favourite-svg">
                    <path d="M10 2C10 2 5 4 5 10V15L3 17H17L15 15V10C15 4 10 2 10 2Z" stroke="white"
                      strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M8 17C8 18.1 8.9 19 10 19C11.1 19 12 18.1 12 17" stroke="white" strokeWidth="1.5" />
                    <line x1="10" y1="1" x2="10" y2="3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="each-match">
                <div className="time-2">
                  17:30
                </div>
                <div className="teams">
                  <div className="home-team">
                    <Image height={20} width={20} src="/psg.png" alt="team_logo" className="team-logo" />
                    <span>
                      PSG
                    </span>
                  </div>
                  <div className="vs">
                    vs
                  </div>
                  <div className="away-team">
                    <Image height={20} width={20} src="/lyon.PNG.png" alt="team_logo" className="team-logo" />
                    <span>
                      Lyon
                    </span>
                  </div>
                </div>
                <div className="favourite-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22"
                    className="favourite-svg">
                    <path d="M10 2C10 2 5 4 5 10V15L3 17H17L15 15V10C15 4 10 2 10 2Z" stroke="white"
                      strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M8 17C8 18.1 8.9 19 10 19C11.1 19 12 18.1 12 17" stroke="white" strokeWidth="1.5" />
                    <line x1="10" y1="1" x2="10" y2="3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="right-side">
        <div className="ai-container">
          <div className="header2">
            <div className="left2">
              AI Assistant
            </div>
            <div className="right">

            </div>
          </div>
          <div className="main">
            <div className="temp-message">
              Ask anything about sports...
            </div>
            <div className="input-container">
              <input type="text" name="ai-message" id="ai-message" placeholder="Ask GOALIQ AI..." />
              <button>
                S
              </button>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}

export default HomeBody