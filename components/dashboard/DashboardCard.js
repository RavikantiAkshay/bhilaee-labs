'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toggleStar } from '@/lib/db';
import styles from './DashboardCard.module.css';

const getStatusColor = (status) => {
    if (status === 'Simulation Available') return '#1c7ed6'; // blue-6
    if (status === 'Hardware-Oriented') return '#fd7e14'; // orange-6
    if (status === 'Software-Oriented') return '#0ca678'; // teal-6
    return '#868e96'; // gray-6
};

export default function DashboardCard({ exp, userId, onUnstar }) {
    const [isRemoving, setIsRemoving] = useState(false);

    if (!exp) return null;

    const displayId = String(exp.id).replace('exp-', '').padStart(2, '0');
    const labSlug = exp.labId || exp.labSlug;
    const status = exp.status || 'Guide Only';
    const statusColor = getStatusColor(status);
    
    const formattedDate = exp.starred_at ? new Date(exp.starred_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) : null;

    const handleUnstar = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        setIsRemoving(true);
        const { success } = await toggleStar(userId, exp.id, true); // force unstar
        
        if (success && onUnstar) {
            setTimeout(() => {
                onUnstar(exp.id);
            }, 400); // long enough for the complex animation
        } else {
            setIsRemoving(false);
        }
    };

    return (
        <div 
            className={`${styles.cardWrapper} ${isRemoving ? styles.removing : ''}`}
            style={{ '--status-color': statusColor }}
        >
            <Link 
                href={`/lab/${labSlug}/experiment/${exp.id}`} 
                className={styles.card}
            >
                <div className={styles.idSection}>
                    <span className={styles.expNumber}>{displayId}</span>
                </div>

                <div className={styles.mainContent}>
                    <div className={styles.cardHeader}>
                        <div className={styles.titleGroup}>
                            <h3 className={styles.title}>{exp.name || exp.title}</h3>
                            <div className={styles.labBadge}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                                {exp.labName || 'Laboratory'}
                            </div>
                        </div>
                        <button 
                            className={styles.unstarBtn}
                            onClick={handleUnstar}
                            title="Remove from bookmarks"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                        </button>
                    </div>

                    <div className={styles.cardFooter}>
                        <span className={styles.statusText}>{status}</span>
                        {formattedDate && (
                            <span className={styles.date}>Added {formattedDate}</span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}
