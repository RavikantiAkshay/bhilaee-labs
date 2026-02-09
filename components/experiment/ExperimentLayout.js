import Link from 'next/link';
import { SECTION_ORDER, SECTION_TITLES } from '@/data/experiment_schema';
import styles from './Experiment.module.css';

/**
 * Main shell for the Experiment Page.
 * Handles the sticky sidebar navigation and responsive content area.
 */
export default function ExperimentLayout({ experiment, children }) {
    // Generate Table of Contents based on sections available in the experiment
    // Only include applicable sections
    const toc = SECTION_ORDER.filter(key =>
        experiment.sections[key] && experiment.sections[key].isApplicable
    ).map(key => ({
        id: key,
        title: experiment.sections[key].title || SECTION_TITLES[key]
    }));

    return (
        <div className={styles.layoutContainer}>
            {/* Mobile Navigation (Simple top bar for now, can be enhanced to drawer) */}
            <nav className={styles.mobileNav}>
                <span className={styles.mobileTitle}>{experiment.code}: {experiment.title}</span>
                {/* Future: Add hamburger menu here */}
            </nav>

            {/* Sidebar / Table of Contents */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarContent}>
                    <div className={styles.sidebarHeader}>
                        <h2 className={styles.sidebarTitle}>Contents</h2>
                    </div>
                    <nav className={styles.toc}>
                        {toc.map(item => (
                            <a key={item.id} href={`#${item.id}`} className={styles.tocLink}>
                                {item.title}
                            </a>
                        ))}
                    </nav>

                    <div className={styles.sidebarFooter}>
                        <Link href={`/lab/${experiment.labId || '#'}`} className={styles.backLink}>
                            ← Back to Lab
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={styles.mainContent}>
                <header className={styles.experimentHeader}>
                    <div className={styles.headerMeta}>
                        <span className={styles.experimentCode}>{experiment.code}</span>
                        <span className={`${styles.statusTag} ${styles[`status_${(experiment.status || 'Guide Only').replace(/ /g, '_')}`]}`}>
                            {experiment.status}
                        </span>
                    </div>
                    <h1 className={styles.experimentTitle}>{experiment.title}</h1>
                </header>

                <div className={styles.contentBody}>
                    {children}
                </div>
            </main>
        </div>
    );
}
