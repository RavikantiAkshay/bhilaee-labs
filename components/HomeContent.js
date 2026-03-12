'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import SearchBar from './SearchBar';
import ExperimentCard from './ExperimentCard';
import styles from './SearchBar.module.css';

export default function HomeContent({ labs, allExperiments }) {
    const { profile, user } = useAuth();
    const [query, setQuery] = useState('');
    const [pinnedIds, setPinnedIds] = useState([]);

    // 1. Sync pinned IDs from profile or local storage
    useEffect(() => {
        const syncPinned = () => {
            if (user && profile?.default_lab) {
                setPinnedIds(profile.default_lab.split(',').filter(Boolean));
            } else {
                try {
                    const savedApp = localStorage.getItem('appSettings');
                    if (savedApp) {
                        const parsed = JSON.parse(savedApp);
                        if (parsed.pinnedLabs) setPinnedIds(parsed.pinnedLabs);
                        else setPinnedIds([]);
                    } else {
                        setPinnedIds([]);
                    }
                } catch (e) {
                    setPinnedIds([]);
                }
            }
        };

        syncPinned();

        window.addEventListener('preferencesUpdated', syncPinned);
        return () => window.removeEventListener('preferencesUpdated', syncPinned);
    }, [user, profile]);

    // 2. Sort labs: Pinned first
    const sortedLabs = useMemo(() => {
        return [...labs].sort((a, b) => {
            const aPinned = pinnedIds.includes(a.id);
            const bPinned = pinnedIds.includes(b.id);
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            return 0;
        });
    }, [labs, pinnedIds]);

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
                <p>
                    Tired of struggling with lab reports and searching for experiment details?
                    <br /><br />
                    Bhilai EE Labs makes it effortless to find practical guides, visualize circuits, and master your electrical engineering practicals.
                </p>
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
                                        <ExperimentCard 
                                            key={`${exp.labId}-${exp.id}`} 
                                            exp={exp} 
                                        />
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
                    /* Normal labs grid (Sorted) */
                    <div className="labs-grid">
                        {sortedLabs.map((lab) => {
                            const isPinned = pinnedIds.includes(lab.id);
                            return (
                                <Link key={lab.id} href={`/lab/${lab.id}`} className={`lab-card ${isPinned ? 'lab-card-pinned' : ''}`}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3>{lab.name}</h3>
                                        {isPinned && <span title="Pinned Lab" style={{ fontSize: '1.2rem' }}>📌</span>}
                                    </div>
                                    <p className="lab-code">{lab.code}</p>
                                    <p className="lab-description">{lab.description}</p>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </>
    );
}
