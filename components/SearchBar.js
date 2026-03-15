'use client';

import styles from './SearchBar.module.css';

export default function SearchBar({ query, onQueryChange }) {
    const isActive = query.trim().length > 0;

    return (
        <div className={styles.searchWrapper} data-tour="search-section">
            {/* Search icon */}
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
                type="text"
                className={styles.searchInput}
                placeholder="Search experiments…"
                value={query}
                onChange={e => onQueryChange(e.target.value)}
                id="experiment-search"
            />
            {isActive && (
                <button
                    className={styles.clearBtn}
                    onClick={() => onQueryChange('')}
                    aria-label="Clear search"
                >
                    ×
                </button>
            )}
        </div>
    );
}
