'use client';

import Link from 'next/link';
import styles from './HistoryItem.module.css';

export default function HistoryItem({ exp }) {
    if (!exp) return null;

    const displayId = String(exp.id).replace('exp-', '').padStart(2, '0');
    const labSlug = exp.labId || exp.labSlug;
    
    // Function to calculate relative time
    const getRelativeTime = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now - past;
        const diffInMins = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMins < 1) return 'just now';
        if (diffInMins < 60) return `${diffInMins} min${diffInMins > 1 ? 's' : ''} ago`;
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        return past.toLocaleDateString();
    };

    return (
        <Link 
            href={`/lab/${labSlug}/experiment/${exp.id}`} 
            className={styles.item}
        >
            <div className={styles.left}>
                <div className={styles.idBadge}>{displayId}</div>
                <div className={styles.info}>
                    <h3 className={styles.title}>{exp.name || exp.title}</h3>
                    <div className={styles.meta}>
                        <span className={styles.labName}>{exp.labName || 'Laboratory'}</span>
                        <span className={styles.dot}>•</span>
                        <span className={styles.status}>{exp.status || 'Guide Only'}</span>
                    </div>
                </div>
            </div>
            <div className={styles.right}>
                <span className={styles.time}>{getRelativeTime(exp.viewed_at)}</span>
                <svg className={styles.arrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </div>
        </Link>
    );
}
