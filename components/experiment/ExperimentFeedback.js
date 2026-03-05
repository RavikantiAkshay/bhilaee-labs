'use client';

import { useState } from 'react';
import styles from './ExperimentFeedback.module.css';

const REACTIONS = [
    { emoji: '😞', label: 'Not helpful', value: 1 },
    { emoji: '😕', label: 'Could be better', value: 2 },
    { emoji: '😐', label: 'Okay', value: 3 },
    { emoji: '😊', label: 'Helpful', value: 4 },
    { emoji: '🤩', label: 'Very helpful', value: 5 },
];

export default function ExperimentFeedback() {
    const [selected, setSelected] = useState(null);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSelect = (value) => {
        setSelected(value);
    };

    const handleSubmit = () => {
        setSubmitted(true);
        // Future: send selected + comment to database here
    };

    return (
        <div className={styles.feedbackContainer}>
            {!submitted ? (
                <>
                    <p className={styles.feedbackTitle}>Was this experiment helpful?</p>
                    <p className={styles.feedbackSubtitle}>Your feedback helps us improve</p>
                    <div className={styles.emojiRow}>
                        {REACTIONS.map((r) => (
                            <button
                                key={r.value}
                                className={`${styles.emojiBtn} ${selected === r.value ? styles.emojiBtnActive : ''}`}
                                onClick={() => handleSelect(r.value)}
                                title={r.label}
                                aria-label={r.label}
                            >
                                <span className={styles.emoji}>{r.emoji}</span>
                                <span className={styles.emojiLabel}>{r.label}</span>
                            </button>
                        ))}
                    </div>

                    {selected && (
                        <div className={styles.commentSection}>
                            <textarea
                                className={styles.commentInput}
                                placeholder="Any additional thoughts? (optional)"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                            />
                            <button className={styles.submitBtn} onClick={handleSubmit}>
                                Submit Feedback
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className={styles.thankYou}>
                    <span className={styles.thankYouEmoji}>✅</span>
                    <p className={styles.thankYouText}>Thanks for your feedback!</p>
                </div>
            )}
        </div>
    );
}
