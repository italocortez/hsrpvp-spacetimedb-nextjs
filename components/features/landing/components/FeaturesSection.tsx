'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './FeaturesSection.module.css';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const ALL_FEATURES: FeatureItem[] = [
  {
    id: '1',
    title: 'Lobby System',
    description:
      'Create & join lobbies with custom settings, roles, and match parameters. Host tournaments or casual matches with full control over draft rules.',
    icon: '🎮',
  },
  {
    id: '2',
    title: 'Classic Draft Mode',
    description:
      'Draft characters in a strategic turn-based format against your opponent. Ban, pick, and counter-pick your way to victory.',
    icon: '⚔️',
  },
  {
    id: '3',
    title: 'Team Builder',
    description:
      'Build and theory-craft team compositions with full character details. Experiment with synergies and optimize your roster before going live.',
    icon: '🛠️',
  },
  { id: 'f1', title: 'Roster Points', description: 'Track character costs and manage your competitive roster', icon: '📊' },
  { id: 'f2', title: 'Tournament Mode', description: 'Bracket-based competitive play with seeding', icon: '🏆' },
  { id: 'f3', title: 'Match History', description: 'Review past drafts and analyze your performance', icon: '📋' },
  { id: 'f4', title: 'Live Spectating', description: 'Watch ongoing matches in real-time', icon: '👁️' },
  { id: 'f5', title: 'Custom Rulesets', description: 'Create and share custom draft rules', icon: '⚙️' },
];

export const FeaturesSection = () => {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [timerReset, setTimerReset] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const featured = ALL_FEATURES[featuredIndex];

  // The card that just left featured → entering bottom row at the right end
  const prevFeaturedIndex = (featuredIndex - 1 + ALL_FEATURES.length) % ALL_FEATURES.length;
  const enteringId = ALL_FEATURES[prevFeaturedIndex].id;

  // Bottom row: ordered rotation excluding featured.
  // Next-to-be-promoted is at left, most recently un-featured is at right.
  const bottomCards: FeatureItem[] = [];
  for (let i = 1; i < ALL_FEATURES.length; i++) {
    bottomCards.push(ALL_FEATURES[(featuredIndex + i) % ALL_FEATURES.length]);
  }

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
    el.scrollBy({ left: direction === 'right' ? 300 : -300, behavior: 'smooth' });
  };

  // Auto-rotate featured — resets when timerReset changes (user click)
  useEffect(() => {
    const timer = setInterval(() => {
      setFeaturedIndex((i) => (i + 1) % ALL_FEATURES.length);
    }, 15000);
    return () => clearInterval(timer);
  }, [timerReset]);

  return (
    <section className={styles.section}>
      {/* Featured Feature */}
      <div className={styles.featured}>
        <div className={styles.featuredAccent}>
          <div className={styles.featuredImageInner}>
            <div key={featured.id} className={styles.featuredPlaceholder}>
              <span className={styles.featuredIcon}>{featured.icon}</span>
              <span className={styles.featuredPlaceholderText}>{featured.title}</span>
            </div>
          </div>
        </div>

        <div className={styles.featuredContent}>
          <div className={styles.sectionLabel}>
            <span className={styles.sectionLabelText}>FEATURES</span>
            <div className={styles.sectionLabelLine} />
          </div>
          <div key={featured.id} className={styles.featuredTextAnim}>
            <h2 className={styles.featuredTitle}>{featured.title}</h2>
            <p className={styles.featuredDescription}>{featured.description}</p>
          </div>
        </div>
      </div>

      {/* More Features */}
      <div className={styles.latestHeader}>
        <div className={styles.latestLabelGroup}>
          <div className={styles.latestLabelDashes} />
          <span className={styles.latestLabel}>MORE FEATURES</span>
        </div>
        <div className={styles.latestLine} />
      </div>

      <div className={styles.latestCarousel}>
        <button
          className={`${styles.carouselArrow} ${styles.carouselArrowLeft} ${canScrollLeft ? styles.carouselArrowVisible : ''}`}
          onClick={() => scroll('left')}
          type="button"
          aria-label="Previous"
          disabled={!canScrollLeft}
        >
          &#x2039;
        </button>

        <div className={styles.latestCards} ref={scrollRef}>
          {bottomCards.map((item) => (
            <a
              key={item.id}
              className={`${styles.latestCard} ${item.id === enteringId ? styles.latestCardEntering : ''}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setFeaturedIndex(ALL_FEATURES.findIndex((f) => f.id === item.id));
                setTimerReset((r) => r + 1);
              }}
            >
              <div className={styles.latestCardImage}>
                <div className={styles.latestCardPlaceholder}>
                  <span className={styles.latestCardIcon}>{item.icon}</span>
                  <span className={styles.latestCardPlaceholderText}>{item.title}</span>
                </div>
                {/* Bottom-left L — diagonal + horizontal in one SVG, no seam */}
                <svg className={styles.latestCardLShape} width="100%" height="100%">
                  <defs>
                    <linearGradient id={`diagFade-${item.id}`} x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id={`horizFade-${item.id}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="600" y2="0">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                      <stop offset="70%" stopColor="currentColor" stopOpacity="1" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="12" y1="0" x2="0" y2="100%" stroke={`url(#diagFade-${item.id})`} strokeWidth="2.5" />
                  <line x1="0" y1="100%" x2="2000" y2="100%" stroke={`url(#horizFade-${item.id})`} strokeWidth="2.5" />
                </svg>
                {/* Top-right L — same SVG rotated 180° */}
                <svg className={`${styles.latestCardLShape} ${styles.latestCardLShapeFlipped}`} width="100%" height="100%">
                  <defs>
                    <linearGradient id={`diagFadeR-${item.id}`} x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id={`horizFadeR-${item.id}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="600" y2="0">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                      <stop offset="70%" stopColor="currentColor" stopOpacity="1" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="12" y1="0" x2="0" y2="100%" stroke={`url(#diagFadeR-${item.id})`} strokeWidth="2.5" />
                  <line x1="0" y1="100%" x2="2000" y2="100%" stroke={`url(#horizFadeR-${item.id})`} strokeWidth="2.5" />
                </svg>
              </div>
              <div className={styles.latestCardText}>
                <span className={styles.latestCardTitle}>{item.title}</span>
                <span className={styles.latestCardDesc}>{item.description}</span>
              </div>
            </a>
          ))}
        </div>

        <button
          className={`${styles.carouselArrow} ${styles.carouselArrowRight} ${canScrollRight ? styles.carouselArrowVisible : ''}`}
          onClick={() => scroll('right')}
          type="button"
          aria-label="Next"
          disabled={!canScrollRight}
        >
          &#x203A;
        </button>
      </div>
    </section>
  );
};
