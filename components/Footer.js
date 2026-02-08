import styles from './Footer.module.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <p className={styles.copyright}>
                    © {currentYear} Basic Labs Guide
                </p>

                <p className={styles.creator}>
                    Designed & Developed by Akshay Ravikanti
                </p>
            </div>
        </footer>
    );
}
