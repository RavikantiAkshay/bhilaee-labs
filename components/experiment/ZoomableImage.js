'use client';

import { useState, useEffect } from 'react';
import styles from './ZoomableImage.module.css';

export default function ZoomableImage({ src, alt, className }) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent scrolling on body when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
            {/* The inline image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
                src={src} 
                alt={alt} 
                className={`${className || ''} ${styles.zoomable}`} 
                onClick={() => setIsOpen(true)}
                title="Click to enlarge"
            />
            
            {/* The modal overlay */}
            {isOpen && (
                <div 
                    className={styles.modalOverlay} 
                    onClick={() => setIsOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Enlarged image: ${alt}`}
                >
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalImageWrapper}>
                            <button 
                                className={styles.closeButton} 
                                onClick={() => setIsOpen(false)} 
                                aria-label="Close"
                                title="Close (Esc)"
                            >
                                &times;
                            </button>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={alt} className={styles.modalImage} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
