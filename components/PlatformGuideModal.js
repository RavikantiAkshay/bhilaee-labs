'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
            'Save observations',
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
    const router = useRouter();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [highlights, setHighlights] = useState([]); // Support multiple spotlights
    const [cardStyle, setCardStyle] = useState({ opacity: 0 });
    const [triggeredStep, setTriggeredStep] = useState(null); // Track one-time clicks
    const [retryTick, setRetryTick] = useState(0); // For polling elements

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
            setTriggeredStep(null); // Reset when guide starts
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

    // Handle element highlighting and adaptive scrolling
    useEffect(() => {
        if (activeCategory) {
            const step = activeCategory.steps[activeStep];
            const selectors = step.selectors || (step.selector ? [step.selector] : []);
            
            if (selectors.length > 0) {
                // Try to find elements. We re-run this entire effect on retryTick to poll.
                const elements = selectors.map(s => document.querySelector(s)).filter(Boolean);
                
                if (elements.length > 0) {
                    if (step.title.includes('Navigation')) {
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                    } else {
                        elements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                        
                    const updateHighlight = () => {
                        const newHighlights = elements.map(el => {
                            const rect = el.getBoundingClientRect();
                            return {
                                top: rect.top - 15,
                                left: rect.left - 15,
                                width: rect.width + 30,
                                height: rect.height + 30,
                                borderRadius: '12px'
                            };
                        });
                        setHighlights(newHighlights);

                        const compositeRect = elements.reduce((acc, el) => {
                            const r = el.getBoundingClientRect();
                            return {
                                left: Math.min(acc.left, r.left),
                                right: Math.max(acc.right, r.right),
                                top: Math.min(acc.top, r.top),
                                bottom: Math.max(acc.bottom, r.bottom)
                            };
                        }, { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });

                        compositeRect.width = compositeRect.right - compositeRect.left;
                        compositeRect.height = compositeRect.bottom - compositeRect.top;

                        let cardTop, cardLeft;
                        const cardWidth = 320;
                        const cardHeight = 220;

                        if (compositeRect.height > window.innerHeight * 0.6) {
                            cardTop = 40;
                            cardLeft = (window.innerWidth / 2) - (cardWidth / 2);
                        } else if (compositeRect.left < 100 && compositeRect.width < 400) {
                            cardTop = Math.max(40, compositeRect.top + (compositeRect.height / 2) - (cardHeight / 2));
                            cardLeft = compositeRect.right + 40;
                        } else if (elements.length > 1 && compositeRect.width > 500) {
                            cardTop = Math.max(40, (compositeRect.top + (compositeRect.height / 2) - (cardHeight / 2)) - 100);
                            cardLeft = compositeRect.left + (compositeRect.width / 2) - (cardWidth / 2);
                        } else {
                            cardTop = compositeRect.top + compositeRect.height + 40 > window.innerHeight - cardHeight
                                ? Math.max(40, compositeRect.top - cardHeight - 40)
                                : compositeRect.top + compositeRect.height + 40;
                            cardLeft = Math.max(20, Math.min(window.innerWidth - cardWidth - 20, compositeRect.left + (compositeRect.width / 2) - (cardWidth / 2)));
                        }

                        if (!isNaN(cardTop) && !isNaN(cardLeft)) {
                            setCardStyle({
                                top: cardTop,
                                left: cardLeft,
                                opacity: 1,
                                transform: 'none'
                            });
                        }
                    };

                    let timer = setTimeout(updateHighlight, 150);
                    const handleScroll = () => requestAnimationFrame(updateHighlight);
                    window.addEventListener('scroll', handleScroll, true);
                    window.addEventListener('resize', updateHighlight);
                    
                    return () => {
                        clearTimeout(timer);
                        window.removeEventListener('scroll', handleScroll, true);
                        window.removeEventListener('resize', updateHighlight);
                    };
                } else {
                    // TARGET MISSING: Start retry cycle
                    const retryTimer = setTimeout(() => setRetryTick(prev => prev + 1), 400);
                    
                    // FALLBACK: Show card in center while waiting
                    setHighlights([]); 
                    setCardStyle({
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        opacity: 1,
                        width: 320
                    });

                    // Trigger fallback action if available
                    if (step.triggerSelector && triggeredStep !== `${activeCategory.id}-${activeStep}`) {
                        const trigger = document.querySelector(step.triggerSelector);
                        if (trigger) {
                            setTriggeredStep(`${activeCategory.id}-${activeStep}`);
                            trigger.click();
                        }
                    }

                    return () => clearTimeout(retryTimer);
                }
            } else if (step.url && pathname !== step.url) {
                setHighlights([]); 
                router.push(step.url);
            }
        } else {
            setHighlights([]);
            setCardStyle({ opacity: 0 });
        }
    }, [activeCategory, activeStep, pathname, router, triggeredStep, retryTick]);

    if (!isOpen && !isVisible) return null;

    const handleStartCategory = (cat) => {
        const interactiveSteps = {
            'getting-around': [
                {
                    title: 'Master Lab Index',
                    selector: '[data-tour="labs-grid"]',
                    url: '/',
                    text: 'This is your central hub. All labs are organized into cards. Click any lab to explore its experiments.'
                },
                {
                    title: 'Cross-lab search',
                    selector: '[data-tour="search-section"]',
                    url: '/',
                    text: 'Need something specific? Use the global search to find experiments across all labs instantly.'
                },
                {
                    title: 'Sticky Sidebar',
                    selector: '[data-tour="experiment-sidebar"]',
                    url: '/lab/digital-electronics/experiment/2',
                    text: 'Inside experiments, use this sticky sidebar to jump between sections like Theory, Procedure, or Observations instantly!'
                },
                {
                    title: 'Experiment Navigation',
                    selectors: ['[data-tour="nav-prev"]', '[data-tour="nav-next"]'],
                    url: '/lab/digital-electronics/experiment/2',
                    text: 'Finished your work? Use these shortcuts at the bottom to move forward through the experiment sequence.'
                },
                {
                    title: 'Lab Navigation',
                    selectors: ['[data-tour="lab-nav-prev"]', '[data-tour="lab-nav-next"]'],
                    url: '/lab/digital-electronics',
                    text: 'Switching courses? These buttons at the bottom of lab pages let you move between different course labs seamlessly.'
                }
            ],
            'running-experiments': [
                {
                    title: 'Launch Simulator',
                    selector: '[data-tour="launch-simulator"]',
                    url: '/lab/basic-electrical-engineering/experiment/1',
                    text: 'Click this button to launch the interactive circuit simulator in a new tab. It pre-loads the correct experiment for you!'
                },
                {
                    title: 'Fill observation tables',
                    selector: '[class*="editToggleBtn"]',
                    url: '/lab/basic-electrical-engineering/experiment/1',
                    text: 'Found some results? Click "Edit Data" to open the table for manual entry. You can type in your own measurements directly.'
                },
                {
                    title: 'Save observations',
                    selector: '[class*="saveBtn"]',
                    triggerSelector: '[class*="editToggleBtn"]',
                    url: '/lab/basic-electrical-engineering/experiment/1',
                    text: 'When you\'re happy with your data, click "Save Changes". This manually persists your observations to the cloud and updates your project history.'
                },
                {
                    title: 'Generate charts',
                    selector: '[class*="plotToggleBtn"]',
                    url: '/lab/basic-electrical-engineering/experiment/1',
                    text: 'Visualize your data instantly! Clicking "Plot Data" generates interactive HSL-tailored charts to help you analyze trends and results.'
                },
                {
                    title: 'Apply measurement variation',
                    selector: '[class*="tweakToggleBtn"]',
                    url: '/lab/basic-electrical-engineering/experiment/1',
                    text: 'Want to make your data more realistic? Use "Apply Tolerance" to introduce natural measurement variations and error margins.'
                }
            ],
            'study-tools': [
                {
                    title: 'Glossary tooltips',
                    selector: '[class*="glossaryTerm"]',
                    url: '/lab/basic-electrical-engineering/experiment/1',
                    text: 'Look out for blue underlined words. Hover over them to see instant technical definitions from our encyclopedia!'
                },
                {
                    title: 'Glossary search page',
                    selector: '[class*="searchInput"]',
                    url: '/glossary',
                    text: 'Need to look up a specific term? Use our centralized glossary to search across all labs and modules.'
                },
                {
                    title: 'Flashcard mode',
                    selector: '[class*="flashcardToggle"]',
                    url: '/glossary',
                    text: 'Preparing for a Viva? Toggle Flashcard Mode to hide definitions and test your knowledge. Click any card to reveal the answer!'
                },
                {
                    title: 'Circuit diagram gallery',
                    selector: '[class*="galleryHeader"]',
                    url: '/gallery',
                    text: 'Browse our visual library of circuit diagrams. You can find reference connections for every experiment on the platform here.'
                },
                {
                    title: 'Zoomable diagrams',
                    selector: '[class*="zoomable"]',
                    url: '/lab/basic-electrical-engineering/experiment/1',
                    text: 'Don\'t squint! Click any diagram to enlarge it. You can see high-resolution details of every connection and component.'
                }
            ],
            'personal-workspace': [
                {
                    title: 'Star experiments',
                    selector: '[data-tour="bookmark-btn"]',
                    url: '/lab/basic-electrical-engineering/experiment/1',
                    text: 'Found a core experiment? Click the Star to bookmark it. It will be saved to your personal list for instant access later.'
                },
                {
                    title: 'Recently viewed',
                    selector: '[data-tour="history-page"]',
                    url: '/history',
                    text: 'Lost your way? Check your navigation history to see the last 10 experiments you visited, automatically synced to your account.'
                },
                {
                    title: 'Saved observations',
                    selector: '[data-tour="observations-page"]',
                    url: '/observations',
                    text: 'Access all your recorded data in one place. Every table you\'ve ever saved is organized and ready for your lab reports.'
                },
                {
                    title: 'Pinned labs',
                    selector: '[data-tour="labs-grid"]',
                    url: '/',
                    text: 'Keep your current semester labs at the top! You can pin frequently used course labs for a faster, personalized home grid.'
                },
                {
                    title: 'Dashboard overview',
                    selector: '[data-tour="profile-menu"]',
                    url: '/',
                    text: 'This is your central hub. The profile menu gives you quick access to your history, bookmarks, observations, and account settings.'
                }
            ]
        };

        const steps = interactiveSteps[cat.id] || [];
        if (steps.length > 0) {
            setActiveCategory({ ...cat, steps });
            setActiveStep(0);
            setTriggeredStep(null);
            
            // Auto-navigate to first step's URL if needed
            if (steps[0].url && pathname !== steps[0].url) {
                router.push(steps[0].url);
            }
        }
    };

    const handleNext = () => {
        if (activeStep < activeCategory.steps.length - 1) {
            const nextStep = activeCategory.steps[activeStep + 1];
            setActiveStep(activeStep + 1);
            
            // Navigate if next step is on a different page
            if (nextStep.url && pathname !== nextStep.url) {
                router.push(nextStep.url);
            }
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
                    <svg className={styles.svgOverlay}>
                        <defs>
                            <mask id="guide-mask">
                                <rect width="100%" height="100%" fill="white" />
                                {highlights.map((style, idx) => (
                                    <rect 
                                        key={`mask-${idx}`}
                                        x={style.left} 
                                        y={style.top} 
                                        width={style.width} 
                                        height={style.height} 
                                        rx="25"
                                        ry="25"
                                        fill="black"
                                        style={{ transition: 'all 1.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                    />
                                ))}
                            </mask>
                        </defs>
                        <rect width="100%" height="100%" className={styles.maskBackground} mask="url(#guide-mask)" />
                        {highlights.map((style, idx) => (
                            <rect 
                                key={`border-${idx}`}
                                x={style.left} 
                                y={style.top} 
                                width={style.width} 
                                height={style.height} 
                                rx="25"
                                ry="25"
                                className={styles.highlightBorder}
                            />
                        ))}
                    </svg>
                    
                    {isVisible && activeCategory && (
                        <div className={styles.instructionCard} style={cardStyle}>
                            <div className={styles.stepHeader}>
                                <span className={styles.stepTitle}>{activeCategory.steps[activeStep].title}</span>
                                <span className={styles.stepProgress}>{activeStep + 1} / {activeCategory.steps.length}</span>
                            </div>
                            <p className={styles.stepText}>{activeCategory.steps[activeStep].text}</p>
                            <div className={styles.stepActions}>
                                <button className={styles.skipBtn} onClick={() => setActiveCategory(null)}>Exit Guide</button>
                                <button className={styles.nextBtn} onClick={handleNext}>
                                    {activeStep === activeCategory.steps.length - 1 ? 'Finish' : 'Next Step'}
                                </button>
                            </div>
                        </div>
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
