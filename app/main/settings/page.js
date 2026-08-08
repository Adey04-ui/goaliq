import BuildYourXI from '@/app/components/BuildYourXI'
import NewsPreview from '@/app/components/NewsPreview'
import Settings from '@/app/components/Settings'
import React from 'react'

function settings() {
  return (
    <div className="parent-container" style={{ flexDirection: 'row', gap: '20px' }}>
      <div className="">
        <Settings />
      </div>
      <div className="leaguesRightSide">
        <BuildYourXI players={[]} />
        <NewsPreview />
      </div>
    </div>
  )
}

export default settings