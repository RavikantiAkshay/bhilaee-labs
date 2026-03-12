'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/lib/db';
import styles from './Preferences.module.css';

export default function PreferencesClient() {
    const router = useRouter();
    const { user, profile: dbProfile, loading: authLoading } = useAuth();

    // -- State Definitions --
    const [profile, setProfile] = useState({ name: '', rollNumber: '' });
    const [appSettings, setAppSettings] = useState({ theme: 'system', defaultLab: '' });
    const [printPrefs, setPrintPrefs] = useState({
        theory: true,
        apparatus: true,
        procedures: true,
        observations: true,
        calculations: true
    });
    
    // Status tracking for UX
    const [saveStatus, setSaveStatus] = useState('');

    // -- Load specific keys on mount --
    useEffect(() => {
        if (user && dbProfile) {
            // Priority 1: Auth data from DB
            setProfile({ 
                name: dbProfile.full_name || '', 
                rollNumber: dbProfile.roll_number || '' 
            });
            setAppSettings({ 
                theme: dbProfile.theme || 'system', 
                defaultLab: dbProfile.default_lab || '' 
            });
            if (dbProfile.print_preferences) {
                setPrintPrefs(dbProfile.print_preferences);
            }
        } else {
            // Priority 2: Guest data from localStorage
            try {
                const savedProfile = localStorage.getItem('userProfile');
                if (savedProfile) setProfile(JSON.parse(savedProfile));

                const savedApp = localStorage.getItem('appSettings');
                if (savedApp) setAppSettings(JSON.parse(savedApp));

                const savedPrint = localStorage.getItem('printPreferences');
                if (savedPrint) setPrintPrefs(JSON.parse(savedPrint));
            } catch (e) {
                console.error("Failed to load local preferences", e);
            }
        }
    }, [user, dbProfile]);

    // -- Handlers --
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleAppChange = (e) => {
        const { name, value } = e.target;
        setAppSettings(prev => ({ ...prev, [name]: value }));
    };

    const handlePrintToggle = (key) => {
        setPrintPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSavePrimary = async () => {
        setSaveStatus('Saving...');
        try {
            if (user) {
                // Save to Supabase
                const { error } = await updateProfile(user.id, {
                    full_name: profile.name,
                    roll_number: profile.rollNumber,
                    theme: appSettings.theme,
                    default_lab: appSettings.default_lab,
                    print_preferences: printPrefs
                });
                if (error) throw error;
            } else {
                // Save to localStorage (Guest)
                localStorage.setItem('userProfile', JSON.stringify(profile));
                localStorage.setItem('appSettings', JSON.stringify(appSettings));
                localStorage.setItem('printPreferences', JSON.stringify(printPrefs));
            }
            
            // Trigger a custom event so Header/ExperimentLayout can re-read if needed
            window.dispatchEvent(new Event('preferencesUpdated'));

            setSaveStatus('Preferences saved successfully!');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (e) {
            console.error(e);
            setSaveStatus('Error saving preferences.');
        }
    };

    // -- Danger Zone Handlers --
    const clearTableData = () => {
        if (confirm("Are you sure? This will wipe ALL your manually entered observations and plot points across all experiments.")) {
            // Data is saved in ExperimentLayout per-experiment (e.g. `exp-[id]-draftData`)
            // We iterate and remove only data keys
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.includes('-draftData')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
            alert(`Cleared ${keysToRemove.length} saved observation tables.`);
        }
    };

    const clearStarred = () => {
        if (confirm("Remove all starred experiments from your bookmarks?")) {
            localStorage.removeItem('starredExperiments');
            window.dispatchEvent(new Event('bookmarksUpdated'));
            alert('Bookmarks cleared.');
        }
    };

    const factoryReset = () => {
        if (confirm("FACTORY RESET: This will delete ALL local data, including preferences, bookmarks, and observations. Proceed?")) {
            localStorage.clear();
            alert("All data wiped. Returning to homepage.");
            router.push('/');
        }
    };

    if (authLoading) {
        return <div className={styles.loading}>Connecting to cloud...</div>;
    }

    return (
        <div className={styles.prefGrid}>
            
            {/* Section A: User Profile */}
            <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <h2>👤 User Profile</h2>
                    <p>Details used for generating reports and personalizing your session.</p>
                </div>
                <div className={styles.sectionBody}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="name">Full Name</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            value={profile.name} 
                            onChange={handleProfileChange}
                            placeholder="e.g. Akshay Ravikanti"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="rollNumber">Roll Number / ID</label>
                        <input 
                            type="text" 
                            id="rollNumber" 
                            name="rollNumber" 
                            value={profile.rollNumber} 
                            onChange={handleProfileChange}
                            placeholder="e.g. 12040080"
                        />
                    </div>
                </div>
            </section>

            {/* Section B: App Settings */}
            <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <h2>📱 Application Settings</h2>
                    <p>Customize how the app looks and behaves.</p>
                </div>
                <div className={styles.sectionBody}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="theme">Application Theme</label>
                        <select id="theme" name="theme" value={appSettings.theme} onChange={handleAppChange}>
                            <option value="system">System Default</option>
                            <option value="light">Light Mode</option>
                            <option value="dark">Dark Mode</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="defaultLab">Pinned / Default Lab</label>
                        <select id="defaultLab" name="defaultLab" value={appSettings.defaultLab} onChange={handleAppChange}>
                            <option value="">None (Show All)</option>
                            <option value="Basic Electrical">Basic Electrical Engineering</option>
                            <option value="Digital Electronics">Digital Electronics</option>
                            <option value="Devices and Circuits">Devices and Circuits</option>
                        </select>
                        <small className={styles.helpText}>This lab will be prioritized on the homepage.</small>
                    </div>
                </div>
            </section>

            {/* Section C: Print Preferences */}
            <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <h2>🖨️ Print Preferences (Paper Saver)</h2>
                    <p>Select which sections to include when exporting an experiment to PDF.</p>
                </div>
                <div className={styles.sectionBody}>
                    <div className={styles.toggleList}>
                        {Object.entries({
                            theory: "Theory Background",
                            apparatus: "Apparatus & Components",
                            procedures: "Step-by-Step Procedures",
                            observations: "Observations & Tables",
                            calculations: "Calculations & Results"
                        }).map(([key, label]) => (
                            <label key={key} className={styles.toggleRow}>
                                <div className={styles.toggleInfo}>
                                    <strong>Include {label}</strong>
                                </div>
                                <div className={`${styles.switch} ${printPrefs[key] ? styles.switchActive : ''}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={printPrefs[key]}
                                        onChange={() => handlePrintToggle(key)}
                                        className={styles.hiddenCheckbox}
                                    />
                                    <span className={styles.slider}></span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </section>

            {/* Save Button Bar */}
            <div className={styles.saveBar}>
                {saveStatus && <span className={styles.statusMsg}>{saveStatus}</span>}
                <button className={styles.saveBtn} onClick={handleSavePrimary}>
                    Save Preferences
                </button>
            </div>

            {/* Section D: Danger Zone */}
            <section className={`${styles.sectionCard} ${styles.dangerZone}`}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.dangerTitle}>⚠️ Danger Zone</h2>
                    <p>Manage local storage data. These actions cannot be undone.</p>
                </div>
                <div className={styles.sectionBody}>
                    <div className={styles.dangerActions}>
                        <div className={styles.dangerRow}>
                            <div className={styles.dangerInfo}>
                                <strong>Clear Saved Table Data</strong>
                                <span>Wipes all manually entered observations and plots across all labs.</span>
                            </div>
                            <button onClick={clearTableData} className={styles.dangerBtn}>Clear Data</button>
                        </div>
                        <div className={styles.dangerRow}>
                            <div className={styles.dangerInfo}>
                                <strong>Clear Bookmarks</strong>
                                <span>Removes all starred experiments from your profile.</span>
                            </div>
                            <button onClick={clearStarred} className={styles.dangerBtn}>Clear Stars</button>
                        </div>
                        <div className={styles.dangerRow}>
                            <div className={styles.dangerInfo}>
                                <strong>Factory Reset</strong>
                                <span>Wipes everything: preferences, bookmarks, and all saved data.</span>
                            </div>
                            <button onClick={factoryReset} className={styles.factoryBtn}>Factory Reset</button>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
