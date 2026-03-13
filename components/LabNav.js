'use client';

import Link from 'next/link';
import styles from './experiment/Experiment.module.css';

/**
 * Renders floating Previous and Next lab navigation buttons.
 */
export default function LabNav({ prevLab, nextLab }) {
    if (!prevLab && !nextLab) return null;

    return (
        <nav 
            className={`${styles.labNav} noPrint`} 
            aria-label="Lab Navigation"
        >
            <div className={styles.navColumn}>
                {prevLab && (
                    <Link href={`/lab/${prevLab.id}`} className={`${styles.navLink} ${styles.navLinkPrev}`} title={prevLab.name}>
                        <span className={styles.navIcon}>←</span>
                        <span className={styles.navTitleText}>
                            <span className={styles.navDirection}>Previous Lab</span>
                            <span className={styles.navExpName}>{prevLab.name}</span>
                        </span>
                    </Link>
                )}
            </div>
            
            <div className={`${styles.navColumn} ${styles.navColumnRight}`}>
                {nextLab && (
                    <Link href={`/lab/${nextLab.id}`} className={`${styles.navLink} ${styles.navLinkNext}`} title={nextLab.name}>
                        <span className={styles.navTitleText}>
                            <span className={styles.navDirection}>Next Lab</span>
                            <span className={styles.navExpName}>{nextLab.name}</span>
                        </span>
                        <span className={styles.navIcon}>→</span>
                    </Link>
                )}
            </div>
        </nav>
    );
}
