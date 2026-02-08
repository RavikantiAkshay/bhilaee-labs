import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>⚡</span>
                    <span className={styles.logoText}>Basic Labs Guide</span>
                </Link>
                <nav className={styles.nav}>
                    <span className={styles.badge}>Electrical Engineering</span>
                </nav>
            </div>
        </header>
    );
}
