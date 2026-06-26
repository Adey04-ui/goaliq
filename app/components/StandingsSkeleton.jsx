import React from 'react'
import Skeleton from './Skeleton'

function StandingsSkeleton() {
  return (
    <div
      className="standingRow"
    >

      <div
        className={`qualificationMarker`}
      />

      <span className="teamRank">
        <Skeleton
          height="15px"
          borderRadius="10px"
          width='15px'
        />
      </span>

      <div className="teamColumn">
        <Skeleton
          height="20px"
          borderRadius="10px"
          width='20px'
        />

        <span>
          <Skeleton
            height="20px"
            borderRadius="10px"
            width='200px'
          />
        </span>
      </div>

      <span>
        <Skeleton
          height="20px"
          borderRadius="10px"
          width='20px'
        />
      </span>
      <span>
        <Skeleton
          height="20px"
          borderRadius="10px"
          width='20px'
        />
      </span>
      <span>
        <Skeleton
          height="20px"
          borderRadius="10px"
          width='20px'
        />
      </span>
      <span>
        <Skeleton
          height="20px"
          borderRadius="10px"
          width='20px'
        />
      </span>
      <span>
        <Skeleton
          height="20px"
          borderRadius="10px"
          width='20px'
        />
      </span>
      <span className="points">
        <Skeleton
          height="20px"
          borderRadius="10px"
          width='20px'
        />
      </span>
    </div>
  )
}

export default StandingsSkeleton