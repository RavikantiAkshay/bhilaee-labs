import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Column 1: Branding & Context */}
                    <div className={styles.column}>
                        <h2 className={styles.title}>
                            <span aria-hidden="true">⚡</span> Bhilai EE Labs
                        </h2>
                        <p className={styles.text}>
                            Department of Electrical Engineering,<br />
                            Indian Institute of Technology Bhilai
                        </p>
                        <p className={styles.mutedText}>
                            For educational and internal use.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className={styles.column}>
                        <h3 className={styles.title}>Resources</h3>
                        <ul className={styles.linkList}>
                            <li className={styles.linkItem}>
                                <a href="https://bhilaee-simulator.vercel.app/" target="_blank" rel="noopener noreferrer" className={styles.link}>
                                    Circuit Simulator ↗
                                </a>
                            </li>
                            <li className={styles.linkItem}>
                                <Link href="/gallery" className={styles.link}>
                                    Circuit Diagram Gallery
                                </Link>
                            </li>
                            <li className={styles.linkItem}>
                                <Link href="/" className={styles.link}>
                                    Master Lab Index
                                </Link>
                            </li>
                            <li className={styles.linkItem}>
                                <Link href="/support" className={styles.link}>
                                    Report an Issue
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Connect With Us */}
                    <div className={styles.column}>
                        <h3 className={styles.title}>Connect With Us</h3>
                        <div className={styles.socialGrid}>
                            <a href="https://github.com/RavikantiAkshay" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="GitHub">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                                </svg>
                            </a>
                            <a href="https://linkedin.com/in/ravikanti-akshay" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                    <rect x="2" y="9" width="4" height="12"></rect>
                                    <circle cx="4" cy="4" r="2"></circle>
                                </svg>
                            </a>
                            <a href="https://twitter.com/RavikantiAkshay" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="X (Twitter)">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                                    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
                                </svg>
                            </a>
                        </div>
                        <p className={styles.copyrightInline}>
                            © {currentYear} Ravikanti Akshay. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
