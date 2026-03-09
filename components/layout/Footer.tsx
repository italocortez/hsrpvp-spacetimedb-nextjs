import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <p>&copy; {new Date().getFullYear()} The Genius Society. All rights reserved.</p>
        </footer>
    );
}