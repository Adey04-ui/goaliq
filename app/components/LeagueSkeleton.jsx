import React from 'react'
import Image from 'next/image'
import Skeleton from './Skeleton'

function LeagueSkeleton() {
  return (
    <div className="eachList">
      <div className="left">
        <div className="leagueImage">
          <Skeleton
            height="40px"
            borderRadius="10px"
            width='40px'
          />
        </div>
        <div className="leagueDetails">
          <div className="leagueName">
            <Skeleton
              height="13px"
              borderRadius="10px"
              width='250px'
            />
          </div>
          <div className="countryName">
            <div className="countryImage">
              <Skeleton
                height="15px"
                borderRadius="10px"
                width='15px'
              />
            </div>
            <Skeleton
              height="13px"
              borderRadius="10px"
              width='200px'
            />
          </div>
        </div>
      </div>
      <div className="right">
        <div className="favourite-btn">
          <svg style={{ strokeWidth: 1, height: 22, width: 22, stroke: '#fff', }} viewBox="0 0 24 24"
            className={`favourite-svg`}>
            <polygon points="12 3 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
          </svg>
        </div>
        <div className="navigation-btn">
          <Skeleton
            height="13px"
            borderRadius="10px"
            width='15px'
          />
        </div>
      </div>
    </div>
  )
}

export default LeagueSkeleton