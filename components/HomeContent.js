'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import styles from './SearchBar.module.css';

function getStatusClass(status) {
    if (status === 'Simulation Available') return styles.statusSimulation;
    if (status === 'Hardware-Oriented') return styles.statusHardware;
    if (status === 'Software-Oriented') return styles.statusSoftware;
    return '';
}

export default function HomeContent({ labs, allExperiments }) {
    const [query, setQuery] = useState('');

    const isSearchActive = query.trim().length > 0;

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return allExperiments.filter(exp =>
            exp.name.toLowerCase().includes(q)
        );
    }, [query, allExperiments]);

    return (
        <>
            <section className="hero">
                <div className="hero-pill">
                    <span className="hero-pill-icon">🎓</span> IIT Bhilai
                </div>
                <h1>Bhilai EE Labs</h1>
                <p>A comprehensive guide to practical experiments and virtual simulations for Electrical Engineering.</p>
            </section>

            <section className="labs-section">
                <div className="labs-heading-row">
                    <h2>Explore Course Labs ({labs.length})</h2>
                    <SearchBar query={query} onQueryChange={setQuery} />
                </div>

                {isSearchActive ? (
                    /* Search results replace the labs grid */
                    <div className={styles.resultsSection}>
                        {results.length > 0 ? (
                            <>
                                <p className={styles.resultsHeading}>
                                    {results.length} experiment{results.length !== 1 ? 's' : ''} found
                                </p>
                                <div className={styles.resultsGrid}>
                                    {results.map(exp => (
                                        <Link
                                            key={`${exp.labId}-${exp.id}`}
                                            href={`/lab/${exp.labId}/experiment/${exp.id}`}
                                            className={styles.resultCard}
                                        >
                                            <div className={styles.resultCardHeader}>
                                                <span className={styles.resultExpNumber}>
                                                    {String(exp.id).padStart(2, '0')}
                                                </span>
                                                <span className={`${styles.resultStatusTag} ${getStatusClass(exp.status)}`}>
                                                    {exp.status}
                                                </span>
                                            </div>
                                            <h3 className={styles.resultExpTitle}>{exp.name}</h3>
                                            <span className={styles.resultLabBadge}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                                    <polyline points="9 22 9 12 15 12 15 22" />
                                                </svg>
                                                {exp.labName} ({exp.labCode})
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className={styles.noResults}>
                                <p>No experiments found for &ldquo;{query}&rdquo;</p>
                                <p>Try a different search term</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Normal labs grid */
                    <div className="labs-grid">
                        {labs.map((lab) => (
                            <Link key={lab.id} href={`/lab/${lab.id}`} className="lab-card">
                                <h3>{lab.name}</h3>
                                <p className="lab-code">{lab.code}</p>
                                <p className="lab-description">{lab.description}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
