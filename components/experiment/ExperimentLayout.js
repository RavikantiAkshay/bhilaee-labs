'use client';

import Link from 'next/link';
import { SECTION_ORDER, SECTION_TITLES } from '@/data/experiment_schema';
import BookmarkButton from './BookmarkButton';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { recordVisit } from '@/lib/db';
import ExperimentNav from './ExperimentNav';
import styles from './Experiment.module.css';

/**
 * Main shell for the Experiment Page.
 * Handles the sticky sidebar navigation and responsive content area.
 */
export default function ExperimentLayout({ children, experiment }) {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Record visit to history
    useEffect(() => {
        if (user && experiment?.id) {
            recordVisit(user.id, experiment.id);
        }
    }, [user, experiment?.id]);
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

                        {/* Print Button */}
                        <button
                            className={styles.printButton}
                            onClick={() => window.print()}
                            title="Print or Save as PDF"
                            aria-label="Download as PDF"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                            Download as PDF
                        </button>

                        {/* Bookmark Button */}
                        <BookmarkButton experimentId={experiment.id} />
                    </div>
                    <h1 className={styles.experimentTitle}>{experiment.title}</h1>

                    {(() => {
                        const simSection = experiment.sections.simulation;
                        const route = simSection?.route;
                        const isSimStatus = experiment.status === 'Simulation Available';

                        let simulatorUrl = null;
                        const defaultSimUrl = process.env.NEXT_PUBLIC_SIMULATOR_URL || 'https://bhilaee-simulator.vercel.app';
                        if (route && route !== 'default') {
                            simulatorUrl = route;
                        } else if (route === 'default' || isSimStatus) {
                            simulatorUrl = defaultSimUrl;
                        }

                        if (!simulatorUrl) return null;

                        return (
                            experiment.status === 'Simulation Available' && (
                                <div className={styles.noPrint} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <a
                                        href={`${simulatorUrl}?expId=${experiment.meta?.simulationId || experiment.id}&newSession=true`}
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
                                    {(() => {
                                        const simType = experiment.meta?.simulationType ||
                                            (experiment.title.toLowerCase().includes('transient') ? 'Transient' : null);

                                        if (!simType) return null;

                                        return (
                                            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                                                Running this experiment? Please set the simulation type to <strong>{simType}</strong>.
                                            </p>
                                        );
                                    })()}
                                </div>
                            )
                        );
                    })()}
                </header>

                <div className={styles.contentBody}>
                    {children}
                </div>

                {/* Bottom Navigation */}
                <ExperimentNav 
                    labId={experiment.labId} 
                    prevExperiment={experiment.prevExperiment} 
                    nextExperiment={experiment.nextExperiment} 
                />
            </main>
        </div>
    );
}
