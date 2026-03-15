"use client";

import React, { useState } from 'react';
import LoginForm from '@/components/features/auth/components/LoginForm';
import FeatureCards from '@/components/features/landing/components/FeatureCards';
import { useAuthContext } from '@/components/features/auth/components/AuthProvider';
import styles from './page.module.css';

export default function LandingPage() {
    const [copied, setCopied] = useState(false);
    const { isAuthenticated, isConnecting, isLoadingData, connectionError, user, loginGuest, loginDiscord } = useAuthContext();

    const handleCopyUsername = async () => {
        try {
            await navigator.clipboard.writeText("nathyron");
            setCopied(true);
            setTimeout(() => { setCopied(false); }, 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = "nathyron";
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => { setCopied(false); }, 2000);
        }
    };

    return (
        <div className={styles.landing_page}>
            <section className={styles.welcome_section}>
                <div className={styles.welcome_content}>
                    <h1 className={styles.welcome_title}>IPC Battlegrounds</h1>
                    <p className={styles.welcome_subtitle}>
                        Drafting interface for Honkai Star Rail PvP matches
                    </p>

                    <div className={styles.auth_wrapper}>
                        {connectionError ? (
                            <div className={styles.loading_state}>
                                <p>IPC Link failed: {connectionError.message}</p>
                            </div>
                        ) : isConnecting ? (
                            <div className={styles.loading_state}>
                                <p>Establishing IPC Link...</p>
                            </div>
                        ) : isLoadingData ? (
                            <div className={styles.loading_state}>
                                <p>Syncing data...</p>
                            </div>
                        ) : isAuthenticated ? (
                            <div className={styles.logged_in_welcome}>
                                <h2>Welcome back, {user?.displayName}</h2>
                                <p>Select a destination from the navigation bar above.</p>
                            </div>
                        ) : (
                            <LoginForm loginGuest={loginGuest} loginDiscord={loginDiscord} />
                        )}
                    </div>

                    {/* Feature Cards Component */}
                    <div className={styles.features_wrapper}>
                        <FeatureCards />
                    </div>
                </div>
            </section>

            <section id="contact_section" className={styles.contact_section}>
                <div className={styles.contact_content}>
                    <h2>Contact Us</h2>
                    <p className={styles.contact_intro}>
                        Developed by Nathyron for 'The Genius Society' community.
                    </p>

                    <div className={styles.contact_methods}>
                        <a
                            href="https://discord.com/invite/HbXErzYVQ5"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.contact_btn} ${styles.discord_btn}`}
                        >
                            <svg className={styles.icon_svg} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                            Join Discord
                        </a>

                        <div className={styles.contact_row}>
                            <code className={styles.username_code}>nathyron</code>
                            {/* ✅ The usage of handleCopyUsername */}
                            <button onClick={handleCopyUsername} className={styles.copy_btn}>
                                {copied ? <span>Copied!</span> : <span>Copy</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}