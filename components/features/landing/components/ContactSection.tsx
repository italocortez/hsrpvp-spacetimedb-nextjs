'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './ContactSection.module.css';

interface ServerInfo {
  name: string;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
}

const SERVERS: ServerInfo[] = [
  {
    name: 'Solar System',
    subtitle: 'Official Tournament Server',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    accentColor: '#34D399',
    bgColor: '#1A3D2E',
  },
  {
    name: 'Yujicord',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    accentColor: '#8B6CE8',
    bgColor: '#231E3D',
  },
  {
    name: 'Genius Society',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
      </svg>
    ),
    accentColor: '#F24E4E',
    bgColor: '#3D1E1E',
  },
];

export const ContactSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const go = useCallback((index: number) => {
    setActiveIndex(((index % SERVERS.length) + SERVERS.length) % SERVERS.length);
    setTimerKey((k) => k + 1);
  }, []);

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % SERVERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [timerKey]);

  // Mouse wheel navigation
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    let cooldown = false;
    const onWheel = (e: WheelEvent) => {
      if (cooldown) return;
      if (Math.abs(e.deltaY) < 10) return;
      e.preventDefault();
      cooldown = true;
      go(activeIndex + (e.deltaY > 0 ? 1 : -1));
      setTimeout(() => { cooldown = false; }, 500);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [activeIndex, go]);

  const handleCopyUsername = async () => {
    try {
      await navigator.clipboard.writeText('nathyron');
      setCopied(true);
      setTimeout(() => { setCopied(false); }, 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = 'nathyron';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => { setCopied(false); }, 2000);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.centeredContent}>
        <span className={styles.sectionLabel}>CONTACT</span>
        <h2 className={styles.sectionHeading}>
          Get in <span className={styles.textAccent}>Touch</span>
        </h2>
        <p className={styles.sectionBody}>
          Developed to provide entertainment and community events to different
          discord servers. Your arena starts the moment you connect.
        </p>

        <div className={styles.communityGrid}>
          {/* Creator Card */}
          <div className={styles.communityCard}>
            <div className={styles.communityIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3>CREATOR</h3>
            <p>
              Built by <span className={styles.textAccent}>Nathyron</span> — crafted
              with passion for the competitive Honkai Star Rail community.
            </p>
          </div>

          {/* Discord Card */}
          <div className={styles.communityCard}>
            <div className={styles.communityIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>DISCORD</h3>
            <p>Find me on Discord</p>
            <button className={styles.copyBtn} type="button" onClick={handleCopyUsername}>
              <svg
                className={styles.copyIcon}
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              <span className={styles.copyUsername}>nathyron</span>
              <span className={styles.copyHint}>{copied ? 'Copied!' : 'Click to copy'}</span>
            </button>
          </div>

          {/* Servers Card */}
          <div className={styles.communityCard}>
            <div className={styles.communityIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div>
            <h3>SERVERS</h3>
            <div className={styles.carousel} ref={carouselRef}>
              {SERVERS.map((server, i) => {
                const offset = (i - activeIndex + SERVERS.length) % SERVERS.length;
                return (
                  <div
                    key={server.name}
                    className={`${styles.serverItem} ${
                      offset === 0
                        ? styles.active
                        : offset === 1
                          ? styles.next
                          : styles.prev
                    }`}
                    style={
                      {
                        '--accent': server.accentColor,
                        '--server-bg': server.bgColor,
                      } as React.CSSProperties
                    }
                    onClick={() => go(i)}
                  >
                    <span className={styles.serverIcon}>{server.icon}</span>
                    <div className={styles.serverInfo}>
                      <span className={styles.serverName}>{server.name}</span>
                      {server.subtitle && (
                        <span className={styles.serverSubtitle}>{server.subtitle}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.dots}>
              {SERVERS.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
                  onClick={() => go(i)}
                  type="button"
                  aria-label={`Server ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
