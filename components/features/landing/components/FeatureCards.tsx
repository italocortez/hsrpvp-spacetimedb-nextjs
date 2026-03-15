import Link from 'next/link';
import Image from 'next/image';
import styles from './FeatureCards.module.css';

export default function FeatureCards() {
    return (
        <div className={styles.cards_container}>

            {/* Create Lobby Card */}
            <Link href="/lobby" className={styles.feature_card}>
                <div className={styles.card_image_wrapper}>
                    <Image
                        src="/landing/create_lobby.png"
                        alt="Create Lobby"
                        width={300}
                        height={180}
                        className={styles.card_image}
                    />
                </div>
                <div className={styles.card_content}>
                    <h3>Create Lobby</h3>
                    <p>Host matches and manage live draft sessions. To host a lobby, you must be logged in.</p>
                </div>
            </Link>

            {/* Team Builder Card */}
            <Link href="/teambuilder" className={styles.feature_card}>
                <div className={styles.card_image_wrapper}>
                    <Image
                        src="/landing/testing_sandbox.png"
                        alt="Team Builder"
                        width={300}
                        height={180}
                        className={styles.card_image}
                    />
                </div>
                <div className={styles.card_content}>
                    <h3>Team Builder</h3>
                    <p>Experiment with loadouts and test compositions, saving up to 3 teams at once per draft mode</p>
                </div>
            </Link>

            {/* Data Library Card */}
            <Link href="/costs" className={styles.feature_card}>
                <div className={styles.card_image_wrapper}>
                    <Image
                        src="/landing/cost_tables.png"
                        alt="Cost Tables"
                        width={300}
                        height={180}
                        className={styles.card_image}
                    />
                </div>
                <div className={styles.card_content}>
                    <h3>Cost Tables</h3>
                    <p>Check Characters and Lightcone Costs for each draft and game mode</p>
                </div>
            </Link>

        </div>
    );
}