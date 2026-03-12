'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ThemeHandler() {
    const { profile, loading } = useAuth();

    useEffect(() => {
        // 1. Determine theme (Auth Profile > LocalStorage > Default: Dark)
        let theme = 'dark';

        if (profile?.theme) {
            theme = profile.theme;
        } else {
            try {
                const savedApp = localStorage.getItem('appSettings');
                if (savedApp) {
                    const parsed = JSON.parse(savedApp);
                    if (parsed.theme) theme = parsed.theme;
                }
            } catch (e) {
                console.warn("ThemeHandler: Failed to read local theme", e);
            }
        }

        // 2. Apply theme
        const applyTheme = (targetTheme) => {
            const root = document.documentElement;
            if (targetTheme === 'dark') {
                root.setAttribute('data-theme', 'dark');
            } else if (targetTheme === 'light') {
                root.setAttribute('data-theme', 'light');
            } else {
                // System default
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                root.setAttribute('data-theme', isDark ? 'dark' : 'light');
            }
        };

        applyTheme(theme);

        // 3. Listen for changes (LocalStorage or System)
        const handleStorage = (e) => {
            if (e.key === 'appSettings') {
                try {
                    const parsed = JSON.parse(e.newValue);
                    if (parsed.theme) applyTheme(parsed.theme);
                } catch {}
            }
        };

        const handlePreferencesUpdated = () => {
             // PreferencesClient dispatches this on save
             // We re-read theme
             const savedApp = localStorage.getItem('appSettings');
             if (savedApp) {
                 try {
                     const parsed = JSON.parse(savedApp);
                     if (parsed.theme) applyTheme(parsed.theme);
                 } catch {}
             }
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('preferencesUpdated', handlePreferencesUpdated);
        
        // System preference change listener
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => {
            if (theme === 'system') applyTheme('system');
        };
        mediaQuery.addEventListener('change', handleSystemChange);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('preferencesUpdated', handlePreferencesUpdated);
            mediaQuery.removeEventListener('change', handleSystemChange);
        };
    }, [profile]);

    return null; // Side-effect only component
}
