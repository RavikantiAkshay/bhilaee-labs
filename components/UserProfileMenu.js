'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

export default function UserProfileMenu() {
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
                        <div className={styles.menuName}>👤 Ravikanti Akshay</div>
                        <div className={styles.menuRole}>BTech Electrical Engineering</div>
                    </div>

                    <div className={styles.divider}></div>

                    {/* Group 1: Lab Resources */}
                    <Link href="#" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <span className={styles.menuIcon}>⭐</span>
                        Starred Experiments
                    </Link>
                    <Link href="#" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <span className={styles.menuIcon}>🕒</span>
                        Recently Viewed
                    </Link>
                    <Link href="#" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <span className={styles.menuIcon}>🧠</span>
                        Viva & Glossary Prep
                    </Link>
                    <Link href="#" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <span className={styles.menuIcon}>📊</span>
                        Saved Observations
                    </Link>

                    <div className={styles.divider}></div>

                    {/* Group 2: App Settings & Support */}
                    <Link href="#" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <span className={styles.menuIcon}>⚙️</span>
                        Preferences
                    </Link>
                    <Link href="#" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <span className={styles.menuIcon}>💬</span>
                        Help & Feedback
                    </Link>

                    <div className={styles.divider}></div>

                    {/* Group 3: Auth */}
                    <button className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        <span className={styles.menuIcon}>🚪</span>
                        Log Out
                    </button>
                </div>
            )}
        </div>
    );
}
