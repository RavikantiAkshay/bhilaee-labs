'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addStarredExperiment, removeStarredExperiment, getStarredExperiments } from '@/lib/db';
import styles from './BookmarkButton.module.css';

export default function BookmarkButton({ experimentId }) {
    const { user } = useAuth();
    const [starred, setStarred] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkStatus = async () => {
            setStarred(false); // Reset while loading
            if (user) {
                const { data } = await getStarredExperiments(user.id);
                if (data.some(id => String(id) === String(experimentId))) {
                    setStarred(true);
                }
            } else {
                const bookmarks = JSON.parse(localStorage.getItem('starredExperiments') || '[]');
                if (bookmarks.some(id => String(id) === String(experimentId))) {
                    setStarred(true);
                }
            }
        };
        checkStatus();
    }, [experimentId, user]);

    const [saving, setSaving] = useState(false);

    const toggleStarHandler = async () => {
        setSaving(true);
        const { success } = await toggleStar(user?.id, experimentId);
        
        if (success) {
            setStarred(!starred);
            window.dispatchEvent(new Event('bookmarksUpdated'));
        } else {
            alert('Action failed. Please check your connection.');
        }
        setSaving(false);
    };

    if (!mounted) return <div className={styles.placeholder} aria-hidden="true" />;

    return (
        <button
            className={`${styles.bookmarkBtn} ${starred ? styles.active : ''}`}
            onClick={toggleStarHandler}
            title={starred ? 'Remove bookmark' : 'Bookmark this experiment'}
            aria-label={starred ? 'Remove bookmark' : 'Bookmark this experiment'}
        >
            <svg className={saving ? styles.spin : ''} width="18" height="18" viewBox="0 0 24 24" fill={Boolean(starred) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {saving ? 'Saving...' : (Boolean(starred) ? 'Starred' : 'Star')}
        </button>
    );
}
