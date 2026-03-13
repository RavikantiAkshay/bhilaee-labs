'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './Header.module.css';

export default function UserProfileMenu() {
    const { user, profile, signOut, loading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.addEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className={styles.profileContainer} ref={menuRef}>
            <button 
                className={`${styles.profileBtn} ${isOpen ? styles.profileBtnOpen : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User Profile Menu"
                aria-expanded={isOpen}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    {/* Header Block */}
                    <div className={styles.menuHeader}>
                        <div className={styles.menuName}>
                            {user ? (profile?.full_name || user.email.split('@')[0]) : 'Guest User'}
                        </div>
                        <div className={styles.menuRole}>
                            {user ? (profile?.roll_number || 'BTech Student') : 'Not Logged In'}
                        </div>
                    </div>

                    <div className={styles.divider}></div>

                    {/* Group 1: Lab Resources */}
                    <Link href="/starred" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <span className={styles.menuIcon}>⭐</span>
                        Starred Experiments
                    </Link>
                    <Link href="/history" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <span className={styles.menuIcon}>🕒</span>
                        Recently Viewed
                    </Link>
                    <Link href="/glossary" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <span className={styles.menuIcon}>🧠</span>
                        Viva & Glossary Prep
                    </Link>
                    <Link href="/observations" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <span className={styles.menuIcon}>📊</span>
                        Saved Observations
                    </Link>

                    <div className={styles.divider}></div>

                    {/* Group 2: App Settings & Support */}
                    <Link href="/preferences" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <span className={styles.menuIcon}>⚙️</span>
                        Preferences
                    </Link>
                    <Link href="/support" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <span className={styles.menuIcon}>💬</span>
                        Support Hub
                    </Link>

                    <div className={styles.divider}></div>

                    {/* Group 3: Auth */}
                    {user ? (
                        <button 
                            className={styles.dropdownItem} 
                            onClick={async () => {
                                await signOut();
                                setIsOpen(false);
                                window.location.href = '/';
                            }}
                        >
                            <span className={styles.menuIcon}>🚪</span>
                            Log Out
                        </button>
                    ) : (
                        <Link 
                            href="/login" 
                            className={styles.dropdownItem} 
                            onClick={() => setIsOpen(false)}
                        >
                            <span className={styles.menuIcon}>🔑</span>
                            Log In / Sign Up
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
