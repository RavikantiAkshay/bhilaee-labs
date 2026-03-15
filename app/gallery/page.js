'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './Gallery.module.css';
import circuitRegistry from '@/data/experiments/circuit_registry.json';

export default function CircuitGallery() {
    const [selectedLab, setSelectedLab] = useState('All');
    const [filteredDiagrams, setFilteredDiagrams] = useState([]);
    const router = useRouter();

    const labs = ['All', ...new Set(circuitRegistry.map(d => d.labName))];

    useEffect(() => {
        if (selectedLab === 'All') {
            setFilteredDiagrams(circuitRegistry);
        } else {
            setFilteredDiagrams(circuitRegistry.filter(d => d.labName === selectedLab));
        }
    }, [selectedLab]);

    const handleNavigate = (labId, expId) => {
        router.push(`/lab/${labId}/experiment/${expId}`);
    };

    return (
        <div className={styles.galleryContainer}>
            <header className={styles.galleryHeader}>
                <nav className={styles.breadcrumb}>
                    <Link href="/">← Back to Home</Link>
                    <span> / Circuit Diagram Gallery</span>
                </nav>
                <h1>Circuit Diagram Gallery</h1>
                <p>Browse through our extensive library of experimental setups and circuit connections.</p>
            </header>

            <section className={styles.filterSection}>
                {labs.map(lab => (
                    <button
                        key={lab}
                        className={`${styles.filterChip} ${selectedLab === lab ? styles.filterChipActive : ''}`}
                        onClick={() => setSelectedLab(lab)}
                    >
                        {lab}
                    </button>
                ))}
            </section>

            {filteredDiagrams.length > 0 ? (
                <div className={styles.masonryGrid}>
                    {filteredDiagrams.map((diagram, index) => (
                        <div 
                            key={`${diagram.experimentId}-${index}`} 
                            className={styles.galleryCard}
                            onClick={() => handleNavigate(diagram.labId, diagram.experimentId)}
                        >
                            <div className={styles.imageWrapper}>
                                <img 
                                    src={diagram.path} 
                                    alt={diagram.caption}
                                    className={styles.circuitImage}
                                    loading="lazy"
                                />
                            </div>
                            <div className={styles.cardContent}>
                                <span className={styles.labTag}>{diagram.labName}</span>
                                <h3 className={styles.cardTitle}>{diagram.experimentTitle}</h3>
                                <p className={styles.cardCaption}>{diagram.caption}</p>
                                <div className={styles.cardFooter}>
                                    <span className={styles.viewText}>
                                        View Experiment 
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14M12 5l7 7-7 7"/>
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.noResults}>
                    <p>No circuit diagrams found for this lab.</p>
                </div>
            )}
        </div>
    );
}
