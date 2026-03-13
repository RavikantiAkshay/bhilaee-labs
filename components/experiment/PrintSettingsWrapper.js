'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * A client component wrapper that reads the `printPreferences` from Supabase (if logged in)
 * or LocalStorage (for guests) and dynamically applies the `.noPrint` CSS class 
 * to the section if the user has toggled that section off in their settings.
 */
export default function PrintSettingsWrapper({ sectionKey, className, children }) {
    const { profile } = useAuth();
    const [printPrefs, setPrintPrefs] = useState({
        theory: true,
        observation: true,
        calculation: true
    });

    useEffect(() => {
        const loadPrefs = () => {
            // 1. Check Profile (Supabase) if logged in
            if (profile?.print_preferences) {
                const prefs = profile.print_preferences;
                setPrintPrefs({
                    theory: prefs.theory ?? true,
                    apparatus: prefs.apparatus ?? true,
                    procedure: prefs.procedure ?? prefs.procedures ?? true,
                    observation: prefs.observation ?? prefs.observations ?? true,
                    calculation: prefs.calculation ?? prefs.calculations ?? true
                });
                return;
            }

            // 2. Fallback to LocalStorage (Guest or older sessions)
            try {
                const saved = localStorage.getItem('printPreferences');
                if (saved) {
                    setPrintPrefs(JSON.parse(saved));
                }
            } catch (e) {
                console.warn("PrintSettingsWrapper: Failed to read local theme", e);
            }
        };
        
        loadPrefs();

        // Listen for updates from the Preferences page (manual save)
        window.addEventListener('preferencesUpdated', loadPrefs);
        return () => window.removeEventListener('preferencesUpdated', loadPrefs);
    }, [profile]);

    // Determine if this specific section should be hidden during print
    // postLab is forced-hidden by default as per user request
    const shouldHidePrint = sectionKey === 'postLab' || printPrefs[sectionKey] === false;
    
    return (
        <section 
            id={sectionKey} 
            className={`${className} ${shouldHidePrint ? 'noPrint' : ''}`}
        >
            {children}
        </section>
    );
}
