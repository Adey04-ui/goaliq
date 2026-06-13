"use client"

import Image from 'next/image'
import React from 'react'
import { useSignIn } from '@/context/signInContext'
import { useUser } from '@/context/userContext'

function Topbar() {
  const { showSignIn, setShowSignIn } = useSignIn()
  const { session, status } = useUser()
  console.log(showSignIn)

  console.log("Session data in Topbar:", session)
  console.log("Session status in Topbar:", status)

  return (
    <div className="header">
      <div className="header-left"></div>
      <div className="header-middle">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" fill="none" />
            <line x1="16" y1="16" x2="21" y2="21" stroke="white" strokeWidth="2" />
          </svg>
          <input type="text" placeholder="Search teams, player, news..." />
        </div>
      </div>
      <div className="header-right">
        {status == "authenticated" ? (
          <>
            <div className="position-relative-container">
              <svg className="notifications-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="22"
                viewBox="0 0 20 22" fill="none">
                <path d="M10 2C10 2 5 4 5 10V15L3 17H17L15 15V10C15 4 10 2 10 2Z" stroke="white" strokeWidth="1.5"
                  strokeLinejoin="round" fill="none" />
                <path d="M8 17C8 18.1 8.9 19 10 19C11.1 19 12 18.1 12 17" stroke="white" strokeWidth="1.5" fill="none" />
                <line x1="10" y1="1" x2="10" y2="3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div className="position-absolute-container">3</div>
            </div>
            <div className="position-relative-container active">
              <Image className="profile-picture" src={session?.user?.image} alt="profile" width={30} height={30} />
              <div className="position-absolute-profile"></div>
            </div>
          </>
        ) : (
          <div style={{padding: '0px 40px'}}>
            <button className="sign-in-btn" onClick={() => setShowSignIn(true)}>
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Topbar