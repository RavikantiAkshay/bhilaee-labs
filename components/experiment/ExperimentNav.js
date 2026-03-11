'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Experiment.module.css';

/**
 * Renders floating Previous and Next experiment navigation buttons.
 */
export default function ExperimentNav({ labId, prevExperiment, nextExperiment }) {
    const [isVisible, setIsVisible] = useState(true);

    // Optional: Hide buttons when at the very top of the page to keep the hero area clean
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY < 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
        };

        // Initial check and event listener
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!prevExperiment && !nextExperiment) return null;

    return (
        <nav 
            className={`${styles.experimentNav} ${isVisible ? styles.navVisible : styles.navHidden}`} 
            aria-label="Experiment Navigation"
        >
            <div className={styles.navColumn}>
                {prevExperiment && (
                    <Link href={`/lab/${labId}/experiment/${prevExperiment.id}`} className={`${styles.navLink} ${styles.navLinkPrev}`} title={prevExperiment.title}>
                        <span className={styles.navIcon}>←</span>
                        <span className={styles.navTitleText}>
                            <span className={styles.navDirection}>Previous</span>
                            <span className={styles.navExpName}>{prevExperiment.title}</span>
                        </span>
                    </Link>
                )}
            </div>
            
            <div className={`${styles.navColumn} ${styles.navColumnRight}`}>
                {nextExperiment && (
                    <Link href={`/lab/${labId}/experiment/${nextExperiment.id}`} className={`${styles.navLink} ${styles.navLinkNext}`} title={nextExperiment.title}>
                        <span className={styles.navTitleText}>
                            <span className={styles.navDirection}>Next</span>
                            <span className={styles.navExpName}>{nextExperiment.title}</span>
                        </span>
                        <span className={styles.navIcon}>→</span>
                    </Link>
                )}
            </div>
        </nav>
    );
}
