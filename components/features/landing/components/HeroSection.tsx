'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HeroSection.module.css';

export interface HeroSectionProps {
  videoSrc: string;
  loaderBrand?: string;
  title?: string;
  subtitle?: string;
}

export const HeroSection = ({
  videoSrc,
  loaderBrand = 'IPC',
  title = 'IPC BATTLEGROUNDS',
  subtitle = 'DRAFT. BATTLE. DOMINATE.',
}: HeroSectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function onCanPlay() {
      setLoaded(true);
    }

    video.addEventListener('canplaythrough', onCanPlay);

    // If already ready (cached)
    if (video.readyState >= 4) {
      setLoaded(true);
    }

    return () => {
      video.removeEventListener('canplaythrough', onCanPlay);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Loader */}
      {!loaded && (
        <div className={styles.loader}>
          <div className={styles.loaderGlyph}>
            <svg viewBox="0 0 40 40" className={styles.loaderSpinner}>
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="var(--color-iris)"
                strokeWidth="1.5"
                strokeDasharray="80 120"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className={styles.loaderBrand}>{loaderBrand}</div>
          <div className={styles.loaderBarTrack}>
            <div
              className={styles.loaderBarFill}
              style={{ width: loaded ? '100%' : '30%' }}
            />
          </div>
          <div className={styles.loaderPercent}>LOADING ASSETS</div>
        </div>
      )}

      {/* Hero section */}
      <div className={styles.heroSection}>
        <div className={styles.videoContainer}>
          <video
            ref={videoRef}
            className={styles.video}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />

          {/* Gradient overlays */}
          <div className={styles.gradientBottom} />
          <div className={styles.gradientVignette} />

          {/* Hero overlay text */}
          <div className={styles.overlay}>
            <div className={styles.overlayLabel}>HONKAI STAR RAIL // PVP</div>
            <h1 className={styles.overlayTitle}>{title}</h1>
            <p className={styles.overlaySubtitle}>{subtitle}</p>
            <div className={styles.scrollIndicator}>
              <div className={styles.scrollLine} />
              <span>SCROLL TO EXPLORE</span>
            </div>
          </div>

          {/* Corner HUD elements */}
          <div className={styles.hudTopLeft}>
            <span>SYS://ONLINE</span>
          </div>
          <div className={styles.hudTopRight}>
            <span>24 FPS</span>
          </div>
          <div className={styles.hudBottomLeft}>
            <span>LAT: 12ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
