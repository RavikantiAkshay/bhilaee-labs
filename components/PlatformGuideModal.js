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
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [highlightStyle, setHighlightStyle] = useState({});

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setActiveCategory(null);
                setActiveStep(0);
            }, 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle element highlighting
    useEffect(() => {
        if (activeCategory) {
            const step = activeCategory.steps[activeStep];
            if (step.selector) {
                const element = document.querySelector(step.selector);
                if (element) {
                    // 1. Initial scroll to target - try to center the whole grid
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    const updateHighlight = () => {
                        const rect = element.getBoundingClientRect();
                        // Capture the FULL dimensions of the grid element with safe padding
                        setHighlightStyle({
                            top: rect.top - 20,
                            left: rect.left - 20,
                            width: rect.width + 40,
                            height: rect.height + 40,
                            borderRadius: '16px'
                        });
                    };

                    // Wait for scroll to settle before showing highlight
                    const timer = setTimeout(updateHighlight, 800);
                    
                    const handleScroll = () => {
                        updateHighlight();
                    };

                    window.addEventListener('scroll', handleScroll, true);
                    window.addEventListener('resize', updateHighlight);
                    
                    return () => {
                        clearTimeout(timer);
                        window.removeEventListener('scroll', handleScroll, true);
                        window.removeEventListener('resize', updateHighlight);
                    };
                }
            }
        } else {
            setHighlightStyle({ width: 0, height: 0 });
        }
    }, [activeCategory, activeStep]);

    if (!isOpen && !isVisible) return null;

    const handleStartCategory = (cat) => {
        const interactiveSteps = {
            'getting-around': [
                {
                    title: 'Master Lab Index',
                    selector: '.labs-grid',
                    text: 'This is the heart of Bhilai EE Labs. All course labs are organized here. Pro tip: Pinned labs always stay at the top for quick access!'
                },
                {
                    title: 'Cross-lab search',
                    selector: 'input[placeholder*="Search experiments"]',
                    text: 'Need to find a specific experiment fast? This global search looks across all labs and experiments instantly.'
                }
            ]
        };

        const steps = interactiveSteps[cat.id] || [];
        if (steps.length > 0) {
            setActiveCategory({ ...cat, steps });
            setActiveStep(0);
        }
    };

    const handleNext = () => {
        if (activeStep < activeCategory.steps.length - 1) {
            setActiveStep(activeStep + 1);
        } else {
            setActiveCategory(null);
            onClose();
        }
    };

    return (
        <div className={`${styles.overlay} ${isOpen ? styles.active : ''} ${activeCategory ? styles.interactiveMode : ''}`} onClick={onClose}>
            {activeCategory ? (
                /* INTERACTIVE STEP OVERLAY */
                <div className={styles.interactiveOverlay} onClick={(e) => e.stopPropagation()}>
                    {highlightStyle.width > 0 && highlightStyle.height > 0 && (
                        <>
                            <div className={styles.highlight} style={highlightStyle}></div>
                            <div className={styles.instructionCard} style={{ 
                                top: highlightStyle.top > 250 ? highlightStyle.top - 200 : 40,
                                left: Math.max(40, Math.min(highlightStyle.left - 10, window.innerWidth - 380))
                            }}>
                                <div className={styles.stepHeader}>
                                    <span className={styles.stepTitle}>{activeCategory.steps[activeStep].title}</span>
                                    <span className={styles.stepProgress}>{activeStep + 1} / {activeCategory.steps.length}</span>
                                </div>
                                <p className={styles.stepText}>{activeCategory.steps[activeStep].text}</p>
                                <div className={styles.stepActions}>
                                    <button className={styles.skipBtn} onClick={() => setActiveCategory(null)}>Finish</button>
                                    <button className={styles.nextBtn} onClick={handleNext}>
                                        {activeStep === activeCategory.steps.length - 1 ? 'Got it!' : 'Next Step'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                /* CATEGORY SELECTION HUB */
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

                                <button className={styles.startBtn} onClick={() => handleStartCategory(cat)}>
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
            )}
        </div>
    );
}
