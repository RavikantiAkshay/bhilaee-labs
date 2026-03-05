'use client';

import { useState, useEffect } from 'react';
import styles from './BookmarkButton.module.css';

export default function BookmarkButton({ experimentId }) {
    const [starred, setStarred] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check localStorage for existing bookmark
        const bookmarks = JSON.parse(localStorage.getItem('starredExperiments') || '[]');
        if (bookmarks.includes(experimentId)) {
            setStarred(true);
        }
    }, [experimentId]);

    const toggleStar = () => {
        const bookmarks = JSON.parse(localStorage.getItem('starredExperiments') || '[]');
        let updated;
        if (starred) {
            updated = bookmarks.filter(id => id !== experimentId);
        } else {
            updated = [...bookmarks, experimentId];
        }
        localStorage.setItem('starredExperiments', JSON.stringify(updated));
        setStarred(!starred);
        // Future: sync to database here
    };

    if (!mounted) return <div className={styles.placeholder} aria-hidden="true" />;

    return (
        <button
            className={`${styles.bookmarkBtn} ${starred ? styles.active : ''}`}
            onClick={toggleStar}
            title={starred ? 'Remove bookmark' : 'Bookmark this experiment'}
            aria-label={starred ? 'Remove bookmark' : 'Bookmark this experiment'}
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {starred ? 'Starred' : 'Star'}
        </button>
    );
}
