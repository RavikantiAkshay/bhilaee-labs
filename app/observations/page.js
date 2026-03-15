'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAllSavedObservations } from '@/lib/db';
import { getAllExperiments } from '@/data/labs';
import ExperimentCard from '@/components/ExperimentCard';
import Link from 'next/link';
import styles from '@/app/preferences/Preferences.module.css';
import homeStyles from '@/components/SearchBar.module.css';

export default function ObservationsPage() {
    const { user, loading: authLoading } = useAuth();
    const [observationList, setObservationList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            fetchObservations();
        } else if (!authLoading && !user) {
            setLoading(false);
        }

        // Listen for instant updates
        const handleUpdate = () => fetchObservations();
        window.addEventListener('workspace-updated', handleUpdate);
        return () => window.removeEventListener('workspace-updated', handleUpdate);
    }, [user, authLoading]);

    const fetchObservations = async () => {
        // Safety timeout to prevent infinite "Loading..."
        const timeout = setTimeout(() => {
            setLoading(false);
            console.warn('Observations fetch timed out');
        }, 10000);

        try {
            const { data, error } = await getAllSavedObservations(user.id);
            if (!error && data) {
                const allExps = getAllExperiments();
                
                // Group by experiment_id to avoid showing the same card multiple times
                const uniqueExpIds = [...new Set(data.map(item => item.experiment_id))];
                
                const enriched = uniqueExpIds.map(expId => {
                    let labId, eId;
                    if (String(expId).includes('/')) {
                        [labId, eId] = String(expId).split('/');
                    } else {
                        eId = expId;
                    }

                    const found = allExps.find(e => 
                        String(e.id) === String(eId) && 
                        (!labId || String(e.labId) === String(labId))
                    );
                    
                    const lastUpdated = data.find(d => d.experiment_id === expId)?.updated_at;
                    return found ? { ...found, viewed_at: lastUpdated } : null;
                }).filter(Boolean);

                setObservationList(enriched);
            }
        } finally {
            clearTimeout(timeout);
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>Loading your saved data...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.container} data-tour="observations-page">
                <div className={styles.authPrompt}>
                    <h2>Please Log In</h2>
                    <p>Log in to view your saved laboratory observations and cloud-synced data.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container} data-tour="observations-page">
            <nav className={styles.breadcrumb}>
                <Link href="/">← Back to Home</Link>
                <span> / Saved Observations</span>
            </nav>
            <header className={styles.header} data-tour="observations-page">
                <h1 className={styles.title}>Saved Observations</h1>
                <p className={styles.subtitle}>Experiments where you've recorded and saved data</p>
            </header>

            {observationList.length > 0 ? (
                <div className={homeStyles.resultsGrid}>
                    {observationList.map((exp) => (
                        <ExperimentCard 
                            key={`${exp.labId}-${exp.id}`} 
                            exp={exp} 
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📊</span>
                    <h3>No observations saved</h3>
                    <p>When you edit and save tables within an experiment, they will appear here.</p>
                </div>
            )}
        </div>
    );
}
