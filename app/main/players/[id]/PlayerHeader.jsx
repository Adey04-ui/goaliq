'use client';

import Image from 'next/image';
import { MapPin, Calendar, Ruler, Weight } from 'lucide-react';

export default function PlayerHeader({ player, currentStats, csv }) {
  const csvRow = csv?.primary;
  const currentTeam = currentStats?.team;
  
  // If CSV exists and squad differs from current team, show both
  const hasDifferentTeam = csvRow && csvRow.squad !== currentTeam?.name;

  return (
    <div className="player-hero">
      <div className="player-hero__bg" />
      
      <div className="player-hero__content">
        <div className="player-hero__photo-wrap">
          <Image
            src={player.photo || '/assets/default-avatar.png'}
            alt={player.name}
            width={140}
            height={140}
            className="player-hero__photo"
          />
          {currentStats?.games?.rating && (
            <span className="player-hero__rating">
              {Number(currentStats.games.rating).toFixed(2)}
            </span>
          )}
        </div>

        <div className="player-hero__info">
          <h1 className="player-hero__name">{player.name}</h1>
          
          <div className="player-hero__meta">
            <span className="meta-pill">
              <Image
                src={`https://flagcdn.com/24x18/${player.nationality?.toLowerCase()}.png`}
                alt={player.nationality}
                width={18}
                height={14}
                className="meta-flag"
              />
              {player.nationality}
            </span>
            <span className="meta-pill"><Calendar size={13} /> {player.age} yrs</span>
            <span className="meta-pill"><Ruler size={13} /> {player.height || '—'}</span>
            <span className="meta-pill"><Weight size={13} /> {player.weight || '—'}</span>
            <span className="meta-pill">#{currentStats?.games?.number || '—'}</span>
            <span className="meta-pill">{currentStats?.games?.position || player.position || '—'}</span>
          </div>

          <div className="player-hero__teams">
            {currentTeam && (
              <div className="team-chip team-chip--current">
                <Image src={currentTeam.logo} alt="" width={22} height={22} />
                <span>Current: <strong>{currentTeam.name}</strong></span>
              </div>
            )}
            
            {csvRow && (
              <div className={`team-chip ${hasDifferentTeam ? 'team-chip--csv' : 'team-chip--same'}`}>
                <span>2025-26: <strong>{csvRow.squad}</strong> · {csvRow.comp}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}