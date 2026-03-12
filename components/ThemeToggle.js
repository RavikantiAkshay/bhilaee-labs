'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/lib/db';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const { user, profile } = useAuth();
    const [isDark, setIsDark] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const root = document.documentElement;

        // 1. Initial Sync
        const currentTheme = root.getAttribute('data-theme') || 'dark';
        setIsDark(currentTheme === 'dark');

        // 2. Observer to watch for theme changes (Profile, Settings, or other Toggles)
        const observer = new MutationObserver(() => {
            const theme = root.getAttribute('data-theme') || 'dark';
            setIsDark(theme === 'dark');
        });

        observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    const toggleTheme = async () => {
        const nextTheme = isDark ? 'light' : 'dark';
        
        // Optimistically set attribute to trigger observer immediately
        document.documentElement.setAttribute('data-theme', nextTheme);

        if (user) {
            await updateProfile(user.id, { theme: nextTheme });
        } else {
            try {
                const savedApp = JSON.parse(localStorage.getItem('appSettings') || '{}');
                savedApp.theme = nextTheme;
                localStorage.setItem('appSettings', JSON.stringify(savedApp));
            } catch { }
        }

        // Notify other components (like Preferences page)
        window.dispatchEvent(new Event('preferencesUpdated'));
    };

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
