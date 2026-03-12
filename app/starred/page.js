'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getStarredExperimentsDetailed } from '@/lib/db';
import { getAllExperiments } from '@/data/labs';
import DashboardCard from '@/components/dashboard/DashboardCard';
import styles from '@/app/preferences/Preferences.module.css';
import Link from 'next/link';

export default function StarredPage() {
    const { user, loading: authLoading } = useAuth();
    const [starredItems, setStarredItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            fetchStarred();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const fetchStarred = async () => {
        const { data, error } = await getStarredExperimentsDetailed(user.id);
        if (!error && data) {
            const allExps = getAllExperiments();
            // Map DB IDs to full experiment objects
            const seenIds = new Set();
            const enriched = data.map(item => {
                let labId, expId;
                if (item.experiment_id.includes('/')) {
                    [labId, expId] = item.experiment_id.split('/');
                } else {
                    expId = item.experiment_id;
                }

                if (seenIds.has(item.experiment_id)) return null;
                seenIds.add(item.experiment_id);

                const found = allExps.find(e => 
                    String(e.id) === String(expId) && 
                    (!labId || String(e.labId) === String(labId))
                );
                
                return found ? { ...found, starred_at: item.created_at } : null;
            }).filter(Boolean);
            setStarredItems(enriched);
        }
        setLoading(false);
    };

    const handleUnstar = (expId) => {
        setStarredItems(prev => prev.filter(item => item.id !== expId));
    };

    if (authLoading || loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>Loading your bookmarks...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.container}>
                <div className={styles.authPrompt}>
                    <h2>Please Log In</h2>
                    <p>You need to be logged in to view your cloud-synced starred experiments.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backLink}>
                ← Back to Home
            </Link>
            <header className={styles.header}>
                <div className={styles.titleWrapper}>
                    <h1 className={styles.title}>Starred Experiments</h1>
                    <span className={styles.countBadge}>{starredItems.length}</span>
                </div>
                <p className={styles.subtitle}>Experiments you've bookmarked for quick access</p>
            </header>

            {starredItems.length > 0 ? (
                <div className={styles.dashboardGrid}>
                    {starredItems.map((exp) => (
                        <DashboardCard 
                            key={`${exp.labId}-${exp.id}`} 
                            exp={exp} 
                            userId={user.id}
                            onUnstar={handleUnstar}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIconWrapper}>
                        <span className={styles.emptyIcon}>⭐</span>
                    </div>
                    <h3>No bookmarks yet</h3>
                    <p>Click the star icon on any experiment to save it here for quick access.</p>
                </div>
            )}
        </div>
    );
}
