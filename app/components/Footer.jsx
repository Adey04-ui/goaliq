"use client"

import ball from "@/app/components/assets/ball.png"
import Image from "next/image"
import { Facebook, Instagram, X, Youtube } from "lucide-react"
import { BiLogoApple, BiLogoFacebook, BiLogoInstagram, BiLogoPlayStore, BiLogoTiktok, BiLogoYoutube } from "react-icons/bi"
import { BsTiktok } from "react-icons/bs"

export default function Footer() {
  return (
    <footer className="about-page">
      <div className="footer-first-container">
        <div className="header-2">
          <span>about</span>
          {/* Both logos rendered; CSS shows the one matching html[data-theme] */}
          <img className="web-name img-dark" src="/logo1.png" alt="web name" />
          <img className="web-name img-light" src="/logo2.png" alt="web name" />
        </div>
        <div>
          <span>Your all-in-one football companion.</span>
        </div>
        <div>
          <div className="about-goaliq">
            <div className="logo-img">
              <Image className="img-dark" src="/ball.png" height={125} width={125} alt="logo" />
              <Image className="img-light" src="/ball3.png" height={125} width={125} alt="logo" />
            </div>
            <div className="logo-img">
              <span className="built">Built for football fans, powered by technology.</span>
              <div>
                <span className="everything-about-goaliq-text">
                  GOALIQ provides real-time live scores, in-depth statistics, AI insights,
                  <br />
                  Breaking news and everything that you need to stay ahead of the game.
                  <br />
                  Whether you follow every match or just your favourite team,
                  <br />
                  GOALIQ keeps you conected to the world of football.
                </span>
              </div>
            </div>
            <div className="logo-img">
              <div className="users-realtime-league-matchscovered-liveupdate">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2F5BFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="8" r="3" />
                  <circle cx="17" cy="8" r="3" />
                  <path d="M3 19c0-3 3-5 6-5s6 2 6 5" />
                  <path d="M13 19c0-2.5 2-4 4-4s4 1.5 4 4" />
                </svg>
                <div>
                  <span className="amount">2M+</span>
                </div>
                <div>
                  <span className="content">Users</span>
                </div>
              </div>
            </div>
            <div className="logo-img">
              <div className="users-realtime-league-matchscovered-liveupdate">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2F5BFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12H21" />
                  <path d="M12 3C9 6 9 18 12 21" />
                  <path d="M12 3C15 6 15 18 12 21" />
                </svg>
                <div>
                  <span className="amount">500+</span>
                </div>
                <div>
                  <span className="content">Leagues</span>
                </div>
              </div>
            </div>
            <div className="logo-img">
              <div className="users-realtime-league-matchscovered-liveupdate">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2F5BFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M13 2L6 13H11L10 22L18 10H13L13 2" />
                </svg>
                <div>
                  <span className="amount">10M+</span>
                </div>
                <div>
                  <span className="content">matches covered</span>
                </div>
              </div>
            </div>
            <div className="logo-img">
              <div className="users-realtime-league-matchscovered-liveupdate">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2F5BFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Center dot */}
                  <circle cx="12" cy="12" r="1.8" />
                  {/* Left waves */}
                  <path d="M8.5 8.5C6.8 10.2 6.8 13.8 8.5 15.5" />
                  <path d="M5.5 5.5C2.5 8.5 2.5 15.5 5.5 18.5" />
                  {/* Right waves */}
                  <path d="M15.5 8.5C17.2 10.2 17.2 13.8 15.5 15.5" />
                  <path d="M18.5 5.5C21.5 8.5 21.5 15.5 18.5 18.5" />
                </svg>
                <div>
                  <span className="amount">Real-time</span>
                </div>
                <div>
                  <span className="content">Live updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="the-features-container">
          <div>
            <span className="features-text">what you get with GOALIQ</span>
          </div>
          <div className="features-cards">
            <div>
              <div className="all-features">
                <div className="svg-contaner">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2F5BFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13 2L6 13H11L10 22L18 10H13L13 2" />
                  </svg>
                </div>
                <div>
                  <span className="svg-names">live scores</span>
                </div>
                <div>
                  <span className="svg-meaning">
                    Real-time match <br /> updates from 500+ <br /> league worldwide.
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="all-features">
                <div className="svg-contaner">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2F5BFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="12" width="3" height="8" />
                    <rect x="10" y="8" width="3" height="12" />
                    <rect x="16" y="4" width="3" height="16" />
                  </svg>
                </div>
                <div>
                  <span className="svg-names">statistics</span>
                </div>
                <div>
                  <span className="svg-meaning">
                    in-depth stats, player <br />
                    ratings, head-to-head
                    <br />
                    and much more.
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="all-features">
                <div className="svg-contaner">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2F5BFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="5" y="7" width="14" height="10" rx="3" />
                    <circle cx="9" cy="12" r="1" />
                    <circle cx="15" cy="12" r="1" />
                    <path d="M10 16H14" />
                    <path d="M12 3V7" />
                    <path d="M8 7L6 5" />
                    <path d="M16 7L18 5" />
                  </svg>
                </div>
                <div>
                  <span className="svg-names">Ai insights </span>
                </div>
                <div>
                  <span className="svg-meaning">
                    Ask anything about
                    <br />
                    football and get smart,
                    <br />
                    instant answers.
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="all-features">
                <div className="svg-contaner">
                  <svg style={{ height: 30 }} viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="#2F5BFF" />
                    <rect x="6" y="7" width="6" height="4" stroke="#2F5BFF" />
                    <line x1="13" y1="8" x2="18" y2="8" stroke="#2F5BFF" />
                    <line x1="13" y1="11" x2="18" y2="11" stroke="#2F5BFF" />
                    <line x1="6" y1="13" x2="18" y2="13" stroke="#2F5BFF" />
                    <line x1="6" y1="16" x2="14" y2="16" stroke="#2F5BFF" />
                  </svg>
                </div>
                <div>
                  <span className="svg-names">Football news </span>
                </div>
                <div>
                  <span className="svg-meaning">
                    Breaking news, transfer
                    <br />
                    updates and stories
                    <br />
                    from around the world.
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="all-features">
                <div className="svg-contaner">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2F5BFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15 9 22 9 16.5 13.5 18.5 21 12 17 5.5 21 7.5 13.5 2 9 9 9" />
                  </svg>
                </div>
                <div>
                  <span className="svg-names">Favorites</span>
                </div>
                <div>
                  <span className="svg-meaning">
                    Follow your favorite
                    <br />
                    teams, players and
                    <br />
                    competitions.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="league-main-container">
          <div>
            <span className="top-league-text">top league covered</span>
          </div>
          <div className="all-top-league-cards">
            <div className="league-cards">
              <img className="league-img" src="/_next/image?url=https%3A%2F%2Fmedia.api-sports.io%2Ffootball%2Fleagues%2F39.png&w=96&q=75" alt="league logo" />
              <div>
                <span className="league-name">premier league</span>
              </div>
            </div>
            <div className="league-cards">
              <img className="league-img" src="/_next/image?url=https%3A%2F%2Fmedia.api-sports.io%2Ffootball%2Fleagues%2F140.png&w=96&q=75" alt="league logo" />
              <div>
                <span className="league-name">la liga</span>
              </div>
            </div>
            <div className="league-cards">
              <img className="league-img" src="/_next/image?url=https%3A%2F%2Fmedia.api-sports.io%2Ffootball%2Fleagues%2F135.png&w=96&q=75" alt="league logo" />
              <div>
                <span className="league-name">serie a</span>
              </div>
            </div>
            <div className="league-cards">
              <img className="league-img" src="/_next/image?url=https%3A%2F%2Fmedia.api-sports.io%2Ffootball%2Fleagues%2F78.png&w=96&q=75" alt="league logo" />
              <div>
                <span className="league-name">bundesliga</span>
              </div>
            </div>
            <div className="league-cards">
              <img className="league-img" src="/_next/image?url=https%3A%2F%2Fmedia.api-sports.io%2Ffootball%2Fleagues%2F61.png&w=96&q=75" alt="league logo" />
              <div>
                <span className="league-name">ligue 1</span>
              </div>
            </div>
            <div className="league-cards">
              <img className="league-img" src="/_next/image?url=https%3A%2F%2Fmedia.api-sports.io%2Ffootball%2Fleagues%2F2.png&w=96&q=75" alt="league logo" />
              <div>
                <span className="league-name">champions league</span>
              </div>
            </div>
            <div className="league-cards">
              <img className="league-img" src="/_next/image?url=https%3A%2F%2Fmedia.api-sports.io%2Ffootball%2Fleagues%2F3.png&w=96&q=75" alt="league logo" />
              <div>
                <span className="league-name">europa league</span>
              </div>
            </div>
            <div className="league-cards">
              <div>
                <span>+</span>
              </div>
              <div>
                <span className="league-name">more</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="download-background-banner">
            <div className="download-banner-glow"></div>
            <div className="download-app-text-container">
              <div>
                <span className="doaload-app-text">
                  Take <strong>GOALIQ </strong>with you everywhere.
                </span>
              </div>
              <div>
                <span className="doaload-app-text2">Doaload the app and never miss a moment.</span>
              </div>
            </div>
            <div className="download-app">
              {/* TODO: fill in real store links - left as "#" placeholders */}
              <a href="#" target="_blank" rel="noopener noreferrer">
                <BiLogoPlayStore size={40} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <BiLogoApple size={40} />
              </a>
            </div>
          </div>
        </div>

        <div className="social-main-container">
          <div className="all-social-content">
            <div className="social-left">
              <div className="logo-name">
                <img className="img-dark" style={{ height: 30 }} src="/ball.png" alt="logo" />
                <img className="img-light" style={{ height: 30 }} src="/ball2.png" alt="logo" />
                <div>
                  <span className="webname">GOALIQ</span>
                </div>
              </div>
              <div>
                <span className="social-left-text">&copy; 2026 GOALIQ. All right reserved.</span>
              </div>
            </div>
            <div className="social-center">
              <div>
                <span className="social-center-text">privacy policy</span>
              </div>
              <div>
                <span className="social-center-text">terms & condition</span>
              </div>
              <div>
                <span className="social-center-text">cookie policy</span>
              </div>
              <div>
                <span className="social-center-text">accessibility</span>
              </div>
              <div>
                <span className="social-center-text">contact us</span>
              </div>
            </div>
            <div className="social-right">
              <div className="social-media-links">
                <a href="#">
                  <BiLogoInstagram size={19} />
                </a>
                <a href="#">
                  <BiLogoYoutube size={19} />
                </a>
                <a href="#">
                  <BiLogoTiktok size={19} />
                </a>
                <a href="#">
                  <BiLogoFacebook size={19} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}