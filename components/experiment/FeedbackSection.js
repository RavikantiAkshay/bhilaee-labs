'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { submitFeedback, getUserFeedback } from '@/lib/db';
import styles from './Feedback.module.css';

const REACTIONS = [
    { emoji: '😞', label: 'Not helpful', value: 1 },
    { emoji: '😕', label: 'Could be better', value: 2 },
    { emoji: '😐', label: 'Okay', value: 3 },
    { emoji: '😊', label: 'Helpful', value: 4 },
    { emoji: '🤩', label: 'Very helpful', value: 5 },
];

export default function FeedbackSection({ experimentId }) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState('');
    const [hasLoaded, setHasLoaded] = useState(false);

    // Load existing feedback
    useEffect(() => {
        const loadFeedback = async () => {
            if (user && experimentId) {
                const { data, error } = await getUserFeedback(user.id, experimentId);
                if (data) {
                    setRating(data.rating);
                    setComment(data.comment || '');
                }
                setHasLoaded(true);
            }
        };
        loadFeedback();
    }, [user, experimentId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.info('FeedbackSection: Attempting submit', { userId: user?.id, experimentId, rating, comment });

        if (!user) {
            setStatus('Please log in to submit feedback.');
            return;
        }
        if (rating === 0) {
            setStatus('Please select a reaction.');
            return;
        }

        setIsSubmitting(true);
        setStatus('Saving feedback...');

        const { data, error } = await submitFeedback({
            userId: user.id,
            experimentId,
            rating,
            comment
        });

        console.info('FeedbackSection: Submit result', { data, error });

        setIsSubmitting(false);
        if (error) {
            console.error('FeedbackSection: Error saving feedback', error);
            setStatus(`Error: ${error.message || 'Failed to save.'}`);
        } else {
            setStatus('Feedback saved! Thank you.');
            setTimeout(() => setStatus(''), 3000);
        }
    };

    // removed if (!user) return null checking to allow guests to see the prompt
    
    return (
        <section className={styles.feedbackSection}>
            <div className={styles.feedbackHeader}>
                <h3 className={styles.feedbackTitle}>Was this experiment helpful?</h3>
                <p className={styles.feedbackSubtitle}>Your feedback helps us improve</p>
                {!user && <p className={styles.loginHint}>Please <strong>Sign In</strong> to rate this experiment.</p>}
            </div>

            <form onSubmit={handleSubmit} className={styles.feedbackForm}>
                <div className={styles.emojiRow}>
                    {REACTIONS.map((r) => (
                        <button
                            key={r.value}
                            type="button"
                            className={`${styles.emojiBtn} ${(hover || rating) === r.value ? styles.emojiActive : ''}`}
                            onClick={() => setRating(r.value)}
                            onMouseEnter={() => setHover(r.value)}
                            onMouseLeave={() => setHover(0)}
                            title={r.label}
                        >
                            <span className={styles.emojiIcon}>{r.emoji}</span>
                            <span className={styles.emojiLabel}>{r.label}</span>
                        </button>
                    ))}
                </div>

                {rating > 0 && (
                    <div className={styles.commentSection}>
                        <textarea
                            className={styles.commentArea}
                            placeholder="Any additional thoughts? (optional)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="2"
                        />
                        <div className={styles.submitRow}>
                            <button 
                                type="submit" 
                                className={styles.submitBtn} 
                                disabled={isSubmitting || !hasLoaded}
                            >
                                {isSubmitting ? 'Saving...' : 'Submit Feedback'}
                            </button>
                            {status && <span className={styles.statusMsg}>{status}</span>}
                        </div>
                    </div>
                )}
            </form>
        </section>
    );
}
