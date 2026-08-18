'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSignIn } from '@/context/signInContext';
import { useUser } from '@/context/userContext';
import NotificationBell from './NotificationBell';
import ProfileDropdown from './ProfileDropdown';
import { Menu, X } from 'lucide-react';
import { useSidebar } from '@/context/sidebarContext';
import useSWR from 'swr';

export function HeaderSidebarToggle() {
  const { toggle, isMobile } = useSidebar();
  if (!isMobile) return null;

  return (
    <button className="header__sidebarToggle" onClick={toggle} aria-label="Open menu">
      <Menu size={20} strokeWidth={2} />
    </button>
  );
}

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function Topbar() {
  const { showSignIn, setShowSignIn } = useSignIn();
  const { session, status } = useUser();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef(null);

  const { data: results, isLoading } = useSWR(
  debouncedQuery.length >= 2 ? `/api/search?q=${encodeURIComponent(debouncedQuery)}` : null,
  (url) => fetch(url).then((r) => r.json()),
  { keepPreviousData: true }
);

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setOpen(false);
  }, []);

  const hasResults =
    results?.players?.length > 0 ||
    results?.teams?.length > 0 ||
    results?.leagues?.length > 0;

  const navigateTo = (href) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  return (
    <div className="header">
      <div className="header-left">
        <HeaderSidebarToggle />
      </div>

      <div className="header-middle" ref={wrapperRef}>
        <div className={`search-box ${open && query.length >= 2 ? 'search-box--active' : ''}`}>
          <svg className="search-icon" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" fill="none" />
            <line x1="16" y1="16" x2="21" y2="21" stroke="white" strokeWidth="2" />
          </svg>
          <input
            type="text"
            placeholder="Search teams, players, leagues..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button className="search-clear" onClick={() => { setQuery(''); setOpen(false); }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && query.length >= 2 && (
          <div className="search-dropdown">
            {isLoading && <div className="search-dropdown__empty">Searching...</div>}

            {!isLoading && !hasResults && (
              <div className="search-dropdown__empty">No results found</div>
            )}

            {/* Players */}
            {!isLoading && results?.players?.length > 0 && (
              <div className="search-group">
                <div className="search-group__label">Players</div>
                {results?.players?.map((p) => (
                  <button
                    key={p.id}
                    className="search-result"
                    onClick={() => navigateTo(`/main/players/${p.id}`)}
                  >
                    <Image
                      src={p.photo || '/assets/default-avatar.png'}
                      alt=""
                      width={28}
                      height={28}
                      className="search-result__img"
                    />
                    <div className="search-result__info">
                      <span className="search-result__name">{p.name}</span>
                      <span className="search-result__meta">
                        {p.position} · {p.teamName || 'Unknown team'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Teams */}
            {!loading && results?.teams?.length > 0 && (
              <div className="search-group">
                <div className="search-group__label">Teams</div>
                {results?.teams?.map((t) => (
                  <button
                    key={t.id}
                    className="search-result"
                    onClick={() => navigateTo(`/main/team/${t.id}`)}
                  >
                    <Image
                      src={t.logo || '/assets/default-team.png'}
                      alt=""
                      width={28}
                      height={28}
                      className="search-result__img"
                    />
                    <div className="search-result__info">
                      <span className="search-result__name">{t.name}</span>
                      <span className="search-result__meta">{t.country}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Leagues */}
            {!loading && results?.leagues?.length > 0 && (
              <div className="search-group">
                <div className="search-group__label">Leagues</div>
                {results?.leagues?.map((l) => (
                  <button
                    key={l.id}
                    className="search-result"
                    onClick={() => navigateTo(`/main/leagues/${l.id}`)}
                  >
                    <Image
                      src={l.logo || '/assets/default-league.png'}
                      alt=""
                      width={28}
                      height={28}
                      className="search-result__img"
                    />
                    <div className="search-result__info">
                      <span className="search-result__name">{l.name}</span>
                      <span className="search-result__meta">{l.country}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="header-right">
        {status === 'loading' && <div className="topbar__authPlaceholder" />}

        {status === 'authenticated' && (
          <>
            <div className="position-relative-container">
              <NotificationBell />
            </div>
            <div className="position-relative-container active">
              <ProfileDropdown
                user={{
                  name: session?.user?.name,
                  email: session?.user?.email,
                  image: session?.user?.image,
                  isPremium: false,
                }}
              />
            </div>
          </>
        )}

        {status === 'unauthenticated' && (
          <div style={{ padding: '0px 40px' }}>
            <button className="sign-in-btn" onClick={() => setShowSignIn(true)}>
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Topbar;