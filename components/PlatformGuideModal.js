'use client';

import { useState, useEffect } from 'react';
import styles from './PlatformGuideModal.module.css';

const CATEGORIES = [
    {
        id: 'getting-around',
        num: '1',
        title: 'Getting Around',
        description: 'Learn how to find labs, search for experiments, and navigate the platform.',
        icon: '🧭',
        steps: [
            'Master Lab Index',
            'Cross-lab search',
            'Sticky sidebar navigation',
            'Experiment Prev / Next',
            'Lab Prev / Next'
        ],
        purpose: 'Find labs and move through experiments.'
    },
    {
        id: 'running-experiments',
        num: '2',
        title: 'Running Experiments',
        description: 'Master the core experimental workflow from simulation to data analysis.',
        icon: '🔬',
        steps: [
            'Launch circuit simulator',
            'Fill observation tables',
            'Auto-save observations',
            'Generate charts',
            'Apply measurement variation'
        ],
        purpose: 'Actually complete the experiment.'
    },
    {
        id: 'study-tools',
        num: '3',
        title: 'Study Tools',
        description: 'Explore the theoretical resources and visualization tools available.',
        icon: '📚',
        steps: [
            'Glossary tooltips',
            'Glossary search page',
            'Flashcard mode',
            'Circuit diagram gallery',
            'Zoomable diagrams'
        ],
        purpose: 'Understand and revise concepts.'
    },
    {
        id: 'personal-workspace',
        num: '4',
        title: 'Personal Workspace',
        description: 'Organize your progress, history, and favorite experiments.',
        icon: '👤',
        steps: [
            'Star experiments',
            'Recently viewed',
            'Saved observations',
            'Pinned labs',
            'Dashboard overview'
        ],
        purpose: 'Manage personal activity.'
    },
    {
        id: 'export-utilities',
        num: '5',
        title: 'Export & Utilities',
        description: 'Output your results and provide feedback to help us improve.',
        icon: '📤',
        steps: [
            'Print to PDF',
            'Print section selection',
            'Feedback system',
            'Emoji reactions'
        ],
        purpose: 'Output and communication.'
    }
];

export default function PlatformGuideModal({ isOpen, onClose }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !isVisible) return null;

    return (
        <div className={`${styles.overlay} ${isOpen ? styles.active : ''}`} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                
                <header className={styles.header}>
                    <h1 className={styles.title}>Welcome to Bhilai EE Labs</h1>
                    <p className={styles.subtitle}>
                        Explore different parts of the platform.
                    </p>
                </header>

                <div className={styles.categoryGrid}>
                    {CATEGORIES.map((cat) => (
                        <div key={cat.id} className={styles.categoryCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.catNum}>{cat.num}</span>
                                <span className={styles.catIcon}>{cat.icon}</span>
                            </div>
                            <h2 className={styles.catTitle}>{cat.title}</h2>
                            <p className={styles.catDescription}>{cat.description}</p>
                            
                            <div className={styles.catMeta}>
                                <span className={styles.purposeLabel}>Goal:</span>
                                <span className={styles.purposeText}>{cat.purpose}</span>
                            </div>

                            <button className={styles.startBtn}>
                                Explore Steps
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>

                <footer className={styles.footer}>
                    <p>Pro Tip: Following the guide in numerical order provides the best learning experience.</p>
                </footer>
            </div>
        </div>
    );
}
