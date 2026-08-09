"use client"

import Image from 'next/image'
import React from 'react'
import { useSignIn } from '@/context/signInContext'
import { useUser } from '@/context/userContext'
import NotificationBell from './NotificationBell'

function Topbar() {
  const { showSignIn, setShowSignIn } = useSignIn()
  const { session, status } = useUser()

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
        {status === "loading" && (
          // Placeholder so layout doesn't jump while session loads
          <div className="topbar__authPlaceholder" />
        )}

        {status === "authenticated" && (
          <>
            <div className="position-relative-container">
              <NotificationBell />
            </div>
            <div className="position-relative-container active">
              <Image
                className="profile-picture"
                src={session?.user?.image}
                alt="profile"
                width={30}
                height={30}
              />
              <div className="position-absolute-profile"></div>
            </div>
          </>
        )}

        {status === "unauthenticated" && (
          <div style={{ padding: '0px 40px' }}>
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