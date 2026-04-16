'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './NavBar.module.css';
import { Logo } from './Logo';
import { GearIcon } from './GearIcon';
import { useAuthContext } from '@/components/features/auth/components/AuthProvider';
import LoginForm from '@/components/features/auth/components/LoginForm';
import { getSessionCookieClient } from '@/lib/session-cookie';

interface NavBarProps {
  className?: string;
}

const NAV_ITEMS = [
  { label: 'LOBBIES', href: '/lobby' },
  { label: 'TEAM BUILDER', href: '/teambuilder' },
  { label: 'COST TABLES', href: '/costs' },
  { label: 'TOURNAMENTS', href: null },   // placeholder per D-11
  { label: 'EVENTS', href: null },         // placeholder per D-11
] as const;

export const NavBar = ({ className }: NavBarProps) => {
  const pathname = usePathname();
  const { isAuthenticated, isLoadingData, isConnecting, user, loginGuest, loginDiscord, guestLoginPending } = useAuthContext();
  const [showLogin, setShowLogin] = useState(false);
  // Start null to match SSR, hydrate from cookie after mount
  const [cachedDisplayName, setCachedDisplayName] = useState<string | null>(null);
  useEffect(() => {
    setCachedDisplayName(getSessionCookieClient());
  }, []);
  const isAdmin = user?.role?.tag === 'Admin';

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll);
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);

    // Convert vertical mouse wheel to horizontal scroll
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('scroll', checkScroll);
      el.removeEventListener('wheel', onWheel);
      observer.disconnect();
    };
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'right' ? 150 : -150, behavior: 'smooth' });
  };

  return (
    <nav className={`${styles.navbar}${className ? ' ' + className : ''}`}>
      {/* Left: Logo */}
      <div className={styles.leftSection}>
        <Link href="/">
          <Logo className={styles.logo} />
        </Link>
      </div>

      {/* Left chevron */}
      <button
        className={`${styles.chevron} ${styles.chevronLeft} ${canScrollLeft ? styles.chevronVisible : ''}`}
        onClick={() => scroll('left')}
        type="button"
        aria-label="Scroll tabs left"
        tabIndex={canScrollLeft ? 0 : -1}
        disabled={!canScrollLeft}
      >
        &#x2039;
      </button>

      {/* Center: Scrollable nav items */}
      <div className={styles.centerNav} ref={scrollRef}>
        {NAV_ITEMS.map((item) => {
          const isSelected = item.href ? pathname.startsWith(item.href) : false;
          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.navItem}${isSelected ? ` ${styles.selected}` : ''}`}
              >
                <span className={styles.navItemBorder} />
                {item.label}
              </Link>
            );
          }
          return (
            <button
              key={item.label}
              type="button"
              className={styles.navItem}
              disabled
            >
              <span className={styles.navItemBorder} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Right chevron */}
      <button
        className={`${styles.chevron} ${styles.chevronRight} ${canScrollRight ? styles.chevronVisible : ''}`}
        onClick={() => scroll('right')}
        type="button"
        aria-label="Scroll tabs right"
        tabIndex={canScrollRight ? 0 : -1}
        disabled={!canScrollRight}
      >
        &#x203A;
      </button>

      {/* Right: Icons + CTA */}
      <div className={styles.rightSection}>
        {/* Profile link for authenticated users */}
        {isAuthenticated && (
          <Link href="/profile" className={styles.iconButton} title="View Profile">
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        )}

        {/* Admin link */}
        {isAdmin && (
          <Link href="/admin-view" className={styles.iconButton} title="Admin Panel">
            <GearIcon size={20} color="currentColor" />
          </Link>
        )}

        {/* Admin panel link */}
        <Link href="/admin-view" className={`${styles.iconButton} ${styles.gearButton}`} aria-label="Admin Panel">
          <GearIcon size={20} color="currentColor" />
        </Link>

        {/* Auth: user display, loading, or login CTA */}
        {isAuthenticated ? (
          <Link href="/profile" className={styles.userInfo}>
            {user?.displayName}
          </Link>
        ) : (isLoadingData || isConnecting) ? (
          cachedDisplayName ? (
            <span className={styles.userInfo}>{cachedDisplayName}</span>
          ) : null
        ) : (
          <button className={styles.loginCta} onClick={() => setShowLogin(true)} type="button">
            LOG IN
          </button>
        )}
      </div>

      {showLogin && (
        <div className={styles.loginOverlay} onClick={() => setShowLogin(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <LoginForm
              loginGuest={() => { loginGuest(); }}
              loginDiscord={() => { loginDiscord(); setShowLogin(false); }}
              guestLoginPending={guestLoginPending}
            />
          </div>
        </div>
      )}
    </nav>
  );
};
