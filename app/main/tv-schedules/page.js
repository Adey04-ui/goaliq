export default function TvSchedulePage() {
  return (
    <div className="parent-container">
      <div className="tv-schedule-page">
        <div className="tv-left-container">
          <div className="tv-country-calendar-container">
            <div className="tv-watch-text">
              <span className="tv-text">TV Schedule</span>
              <span className="never-text">Never miss a match. Find out where and when to watch.</span>
            </div>
            <div className="country-calendar-container">
              <div className="country-arrow-container">
                <div className="country-change-container">
                  <img className="country-img" src="/nigeria flag.jpeg" alt="country" />
                  <span>Nigeria</span>
                </div>
                <svg width="20" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <button type="button" className="calendar-button" aria-label="Pick a date">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="16" rx="2" style={{ fill: 'var(--bg-primary)' }} />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="8" y1="3" x2="8" y2="7" />
                  <line x1="16" y1="3" x2="16" y2="7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="date-changer-container">
            <div className="date-changer-each-container">
              <div className="date-changer active">
                <span>Today</span>
              </div>
              <div className="date-changer active">
                <span>Wed, Aug 12</span>
              </div>
            </div>
            <div className="date-changer-each-container">
              <div className="date-changer">
                <span>Tomorrow</span>
              </div>
              <div className="date-changer">
                <span>Thu, Aug 13</span>
              </div>
            </div>
            <div className="date-changer"><span>Fri, Aug 14</span></div>
            <div className="date-changer"><span>Sat, Aug 15</span></div>
            <div className="date-changer"><span>Sun, Aug 16</span></div>
            <div className="date-changer"><span>Mon, Aug 17</span></div>
            <div className="date-changer"><span>Tue, Aug 18</span></div>
          </div>

          <div className="all-channel-container">
            <div className="channels active">
              <div className="channel-text"><span>All channel</span></div>
            </div>
            <div className="channels">
              <img src="/star time.png" alt="channel logo" />
              <div className="channel-text"><span>Startimes app</span></div>
            </div>
            <div className="channels">
              <img src="/dstv.png" alt="channel logo" />
            </div>
            <div className="channels">
              <img src="/gotv.png" alt="channel logo" />
            </div>
            <div className="channels">
              <img src="/supersport.png" alt="channel logo" />
              <div className="channel-text"><span>SuperSport</span></div>
            </div>
            <div className="channels">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M7 12H17M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="channel-text"><span>More filters</span></div>
            </div>
          </div>

          <div className="match-time-competition-channel-main-container">
            <div className="match-time-competition-channel-container">
              <div className="competition-svg-container">
                <div className="competition-text-name"><span>Club friendlies</span></div>
                <svg width="20" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="club-time-channel-conatiner">
                <div className="time-club">
                  <div className="time"><span>8:00 PM</span></div>
                  <div className="club-logo-name-container">
                    <div className="club-logo-name"><img src="/psg.png" alt="club logo" /><span>PSG</span></div>
                    <div className="club-logo-name"><img src="/mancity.png" alt="club logo" /><span>Man City</span></div>
                  </div>
                </div>
                <div className="channel-svg-conatiner">
                  <div className="channel-logo-name">
                    <img src="/supersport.png" alt="channel logo" />
                    <span>SuperSport maXimo 1</span>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3L14.78 8.63L21 9.54L16.5 13.93L17.56 20.12L12 17.2L6.44 20.12L7.5 13.93L3 9.54L9.22 8.63L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="match-time-competition-channel-container">
              <div className="competition-svg-container">
                <div className="competition-text-name"><span>Club friendlies</span></div>
                <svg width="20" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="club-time-channel-conatiner-two">
                <div className="time-club">
                  <div className="time"><span>5:00 PM</span></div>
                  <div className="club-logo-name-container">
                    <div className="club-logo-name"><img src="/real sociedad.png" alt="club logo" /><span>Real Sociedad</span></div>
                    <div className="club-logo-name"><img src="/stuttgart.PNG.png" alt="club logo" /><span>Stuttgart</span></div>
                  </div>
                </div>
                <div className="channel-svg-conatiner">
                  <div className="channel-logo-name">
                    <img src="/star time.png" alt="channel logo" />
                    <span>Startimes app</span>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3L14.78 8.63L21 9.54L16.5 13.93L17.56 20.12L12 17.2L6.44 20.12L7.5 13.93L3 9.54L9.22 8.63L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div className="club-time-channel-conatiner">
                <div className="time-club">
                  <div className="time"><span>7:30 PM</span></div>
                  <div className="club-logo-name-container">
                    <div className="club-logo-name"><img src="/newcastle.PNG.png" alt="club logo" /><span>Newcastle</span></div>
                    <div className="club-logo-name"><img src="/barcelona.png" alt="club logo" /><span>Barcelona</span></div>
                  </div>
                </div>
                <div className="channel-svg-conatiner">
                  <div className="channel-logo-name">
                    <img src="/dstv.png" alt="channel logo" />
                    <span>DStv Now</span>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3L14.78 8.63L21 9.54L16.5 13.93L17.56 20.12L12 17.2L6.44 20.12L7.5 13.93L3 9.54L9.22 8.63L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="match-time-competition-channel-container">
              <div className="competition-svg-container">
                <div className="competition-text-name"><span>Club friendlies</span></div>
                <svg width="20" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="club-time-channel-conatiner">
                <div className="time-club">
                  <div className="time"><span>9:00 PM</span></div>
                  <div className="club-logo-name-container">
                    <div className="club-logo-name"><img src="/realmadrid.PNG.png" alt="club logo" /><span>Real Madrid</span></div>
                    <div className="club-logo-name"><img src="/leverkusen.PNG.png" alt="club logo" /><span>Leverkusen</span></div>
                  </div>
                </div>
                <div className="channel-svg-conatiner">
                  <div className="channel-logo-name">
                    <img src="/gotv.png" alt="channel logo" />
                    <span>GOtv Now</span>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3L14.78 8.63L21 9.54L16.5 13.93L17.56 20.12L12 17.2L6.44 20.12L7.5 13.93L3 9.54L9.22 8.63L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="match-time-competition-channel-container">
              <div className="competition-svg-container">
                <div className="competition-text-name"><span>Club friendlies</span></div>
                <svg width="20" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="club-time-channel-show-all-container">
                <div className="club-time-channel-conatiner-three">
                  <div className="time-club">
                    <div className="time"><span>11:45 PM</span></div>
                    <div className="club-logo-name-container">
                      <div className="club-logo-name"><img src="/tottenham.png" alt="club logo" /><span>Tottenham</span></div>
                      <div className="club-logo-name"><img src="/valencia.PNG.png" alt="club logo" /><span>Valencia</span></div>
                    </div>
                  </div>
                  <div className="channel-svg-conatiner">
                    <div className="channel-logo-name">
                      <img src="/supersport.png" alt="channel logo" />
                      <span>SuperSport</span>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3L14.78 8.63L21 9.54L16.5 13.93L17.56 20.12L12 17.2L6.44 20.12L7.5 13.93L3 9.54L9.22 8.63L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <button type="button" className="load-matches-box">
                  <span className="load-matches-text">Load more matches</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="tv-right-side">
          <div className="about-tv-schedule-container">
            <div className="about-tv-schedule-svg-container">
              <button type="button" className="tv-button" aria-label="About TV schedule">
                <svg style={{ strokeWidth: 1, height: 22, width: 22, stroke: '#fff', fill: 'none' }} width="20" height="20" viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="12" rx="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </button>
              <div className="about-tv-text"><span>About TV Schedule</span></div>
            </div>
            <div>
              <div className="where-to-watch-text">
                <span>
                  Check live football matches and where
                  <br /> they&apos;re showing on TV in Nigeria.
                  <br /> Kick-off times, channels and streaming
                  <br /> option — all in one place.
                </span>
              </div>
            </div>
            <div className="learn-svg-container">
              <div className="learn-more-link-container"><a href="#">Learn more</a></div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M13 6L19 12L13 18" stroke="var(--accent-link)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="channels-favorite-container">
            <div className="channels-favorite">
              <div><span className="your-channel-text">Your channels</span></div>
              <div><span className="Edit-text">Edit</span></div>
            </div>
            <div className="channels-favorite">
              <div className="channel-logo-favorite">
                <img src="/star time.png" alt="channel logo" />
                <div><span className="channel-name-text">StarTime App</span></div>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path style={{ fill: 'var(--accent-blue)' }} d="M20.84 4.61C19.74 3.51 18.26 2.9 16.72 2.9C15.18 2.9 13.7 3.51 12.6 4.61L12 5.21L11.4 4.61C9.11 2.32 5.39 2.32 3.1 4.61C0.81 6.9 0.81 10.62 3.1 12.91L12 21.81L20.9 12.91C23.19 10.62 23.19 6.9 20.84 4.61Z" />
              </svg>
            </div>
            <div className="channels-favorite">
              <div className="channel-logo-favorite">
                <img src="/dstv.png" alt="channel logo" />
                <div><span className="channel-name-text">DStv</span></div>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path style={{ fill: 'var(--accent-blue)' }} d="M20.84 4.61C19.74 3.51 18.26 2.9 16.72 2.9C15.18 2.9 13.7 3.51 12.6 4.61L12 5.21L11.4 4.61C9.11 2.32 5.39 2.32 3.1 4.61C0.81 6.9 0.81 10.62 3.1 12.91L12 21.81L20.9 12.91C23.19 10.62 23.19 6.9 20.84 4.61Z" />
              </svg>
            </div>
            <div className="channels-favorite">
              <div className="channel-logo-favorite">
                <img src="/gotv.png" alt="channel logo" />
                <div><span className="channel-name-text">GOtv</span></div>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61C19.74 3.51 18.26 2.9 16.72 2.9C15.18 2.9 13.7 3.51 12.6 4.61L12 5.21L11.4 4.61C9.11 2.32 5.39 2.32 3.1 4.61C0.81 6.9 0.81 10.62 3.1 12.91L12 21.81L20.9 12.91C23.19 10.62 23.19 6.9 20.84 4.61Z" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </div>
            <div className="channels-favorite">
              <div className="channel-logo-favorite">
                <img src="/supersport.png" alt="channel logo" />
                <div><span className="channel-name-text">SuperSport</span></div>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61C19.74 3.51 18.26 2.9 16.72 2.9C15.18 2.9 13.7 3.51 12.6 4.61L12 5.21L11.4 4.61C9.11 2.32 5.39 2.32 3.1 4.61C0.81 6.9 0.81 10.62 3.1 12.91L12 21.81L20.9 12.91C23.19 10.62 23.19 6.9 20.84 4.61Z" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </div>
            <div className="channels-favorite">
              <div className="channel-logo-favorite">
                <img src="/supersport.png" alt="channel logo" />
                <div><span className="channel-name-text">SuperSport maXimo</span></div>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61C19.74 3.51 18.26 2.9 16.72 2.9C15.18 2.9 13.7 3.51 12.6 4.61L12 5.21L11.4 4.61C9.11 2.32 5.39 2.32 3.1 4.61C0.81 6.9 0.81 10.62 3.1 12.91L12 21.81L20.9 12.91C23.19 10.62 23.19 6.9 20.84 4.61Z" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </div>
          </div>

          <div className="premium-container">
            <div className="premium-img-name">
              <img src="/blue crown.png" alt="" />
              <div className="web-name-text"><span>GOALIQ PRO</span></div>
            </div>
            <div><span className="unlock-text">Unlock more with GOALIQ PRO</span></div>

            {['Ad-free experience', 'Advanced filters', 'Personalized alerts', 'Exclusive insights'].map((feature) => (
              <div className="about-pro" key={feature}>
                <svg style={{ height: '13px' }} viewBox="0 0 24 24" aria-hidden="true">
                  <circle style={{ fill: 'var(--accent-blue)' }} cx="12" cy="12" r="10" />
                  <path d="M7.5 12.5L10.5 15.5L16.5 8.5" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="all-pro-text-container"><span>{feature}</span></div>
              </div>
            ))}

            <button type="button" className="upgrade-button">Upgrade to PRO</button>
          </div>
        </div>
      </div>
    </div>
  );
}