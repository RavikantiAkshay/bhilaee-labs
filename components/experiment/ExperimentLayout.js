'use client';

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

                    {(() => {
                        const simSection = experiment.sections.simulation;
                        const route = simSection?.route;
                        const isSimStatus = experiment.status === 'Simulation Available';

                        let simulatorUrl = null;
                        if (route && route !== 'default') {
                            simulatorUrl = route;
                        } else if (route === 'default' || isSimStatus) {
                            simulatorUrl = process.env.NEXT_PUBLIC_SIMULATOR_URL;
                        }

                        if (!simulatorUrl) return null;

                        return (
                            experiment.status === 'Simulation Available' && (
                                <a
                                    href={`${process.env.NEXT_PUBLIC_SIMULATOR_URL}?expId=${experiment.meta?.simulationId || experiment.id}&newSession=true`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        marginTop: '1.5rem',
                                        padding: '0.6rem 1.2rem',
                                        backgroundColor: '#228be6', // Blue-500
                                        color: 'white',
                                        borderRadius: '6px',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1c7ed6'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#228be6'}
                                >
                                    <svg style={{ width: '1.2rem', height: '1.2rem', marginRight: '0.6rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Launch Simulator
                                </a>
                            )
                        );
                    })()}
                </header>

                <div className={styles.contentBody}>
                    {children}
                </div>
            </main>
        </div>
    );
}
