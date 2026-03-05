'use client';

import { useState, useEffect } from 'react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check for saved preference only — light mode is the default
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'dark') {
            setIsDark(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');

        if (newTheme) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    };

    // Prevent hydration mismatch by returning empty initial render
    if (!mounted) return <div className={styles.togglePlaceholder} aria-hidden="true" />;

    return (
        <button
            className={`${styles.themeToggle} ${isDark ? styles.dark : ''}`}
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <div className={styles.toggleTrack}>
                <div className={styles.toggleThumb}>
                    {isDark ? (
                        <span className={styles.icon}>🌙</span>
                    ) : (
                        <span className={styles.icon}>☀️</span>
                    )}
                </div>
            </div>
        </button>
    );
}
