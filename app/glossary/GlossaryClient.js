'use client';

import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getAllExperiments } from '@/data/labs';
import styles from './Glossary.module.css';

export default function GlossaryPage({ initialTerms }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [flashcardMode, setFlashcardMode] = useState(false);
    const [revealedTerms, setRevealedTerms] = useState(new Set());

    const filteredTerms = useMemo(() => {
        if (!searchQuery.trim()) return initialTerms;
        const lowerQuery = searchQuery.toLowerCase();
        return initialTerms.filter(item => 
            item.term.toLowerCase().includes(lowerQuery) || 
            item.definition.toLowerCase().includes(lowerQuery)
        );
    }, [searchQuery, initialTerms]);

    const groupedTerms = useMemo(() => {
        const groups = {};
        filteredTerms.forEach(item => {
            const firstLetter = item.term.charAt(0).toUpperCase();
            if (!groups[firstLetter]) groups[firstLetter] = [];
            groups[firstLetter].push(item);
        });
        return Object.keys(groups).sort().map(letter => ({
            letter,
            terms: groups[letter].sort((a, b) => a.term.localeCompare(b.term))
        }));
    }, [filteredTerms]);

    const toggleReveal = (termId) => {
        const newRevealed = new Set(revealedTerms);
        if (newRevealed.has(termId)) {
            newRevealed.delete(termId);
        } else {
            newRevealed.add(termId);
        }
        setRevealedTerms(newRevealed);
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Viva & Glossary Prep | Bhilai EE Labs</title>
            </Head>

            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <Link href="/" style={{ color: 'var(--secondary-color)', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            Back to Home
                        </Link>
                    </div>
                    <h1 className={styles.title}>🧠 Viva & Glossary Prep</h1>
                    <p className={styles.subtitle}>
                        Master your electrical engineering terminology. Search, review, and test your knowledge.
                    </p>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.controlsBar}>
                    <div className={styles.searchWrapper}>
                        <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input 
                            type="text" 
                            className={styles.searchInput}
                            placeholder="Search for a term or concept..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <label className={styles.flashcardToggle}>
                        <div className={styles.toggleText}>
                            <strong>Flashcard Mode</strong>
                            <span>Hide definitions to test yourself</span>
                        </div>
                        <div className={`${styles.switch} ${flashcardMode ? styles.switchActive : ''}`}>
                            <input 
                                type="checkbox" 
                                checked={flashcardMode}
                                onChange={(e) => {
                                    setFlashcardMode(e.target.checked);
                                    if (!e.target.checked) setRevealedTerms(new Set()); // Reset reveals when turning off
                                }}
                                className={styles.hiddenCheckbox}
                            />
                            <span className={styles.slider}></span>
                        </div>
                    </label>
                </div>

                <div className={styles.glossaryList}>
                    {groupedTerms.length === 0 ? (
                        <div className={styles.noResults}>
                            <p>No terms found for "{searchQuery}".</p>
                        </div>
                    ) : (
                        groupedTerms.map(group => (
                            <div key={group.letter} className={styles.letterGroup}>
                                <h2 className={styles.letterHeading}>{group.letter}</h2>
                                <div className={styles.termGrid}>
                                    {group.terms.map(item => {
                                        const termId = `${item.term}-${item.sourceExpId}`;
                                        const isRevealed = revealedTerms.has(termId);
                                        const hideDefinition = flashcardMode && !isRevealed;

                                        return (
                                            <div 
                                                key={termId} 
                                                className={`${styles.termCard} ${flashcardMode ? styles.interactiveCard : ''} ${hideDefinition ? styles.hiddenDef : ''}`}
                                                onClick={() => flashcardMode && toggleReveal(termId)}
                                            >
                                                <div className={styles.termHeader}>
                                                    <h3 className={styles.termName}>{item.term}</h3>
                                                    <span className={styles.sourceBadge} title={`From: ${item.sourceExpName}`}>
                                                        {item.sourceLabId}
                                                    </span>
                                                </div>
                                                <div className={styles.termBody}>
                                                    {hideDefinition ? (
                                                        <div className={styles.revealWrapper}>
                                                            <span className={styles.revealHint}>Click to reveal</span>
                                                            <p className={`${styles.termDefinition} ${styles.blurred}`}>
                                                                {item.definition}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className={styles.termDefinition}>{item.definition}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
