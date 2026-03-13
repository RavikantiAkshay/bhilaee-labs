'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { submitSupportTicket } from '@/lib/db';
import styles from './Support.module.css';

export default function SupportPage() {
    const { user } = useAuth();
    const [category, setCategory] = useState('simulation');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        const formData = new FormData(e.target);
        const ticketData = {
            userId: user?.id || null,
            category: category,
            severity: formData.get('severity'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            contextUrl: formData.get('contextUrl')
        };

        const { error } = await submitSupportTicket(ticketData);

        if (error) {
            setStatus({ type: 'error', message: 'Failed to submit ticket. Please try again later.' });
        } else {
            setStatus({ type: 'success', message: 'Your ticket has been submitted successfully! We will look into it.' });
            e.target.reset();
            setCategory('simulation');
        }
        setIsSubmitting(false);
    };

    return (
        <main className={styles.container}>
            <nav className={styles.breadcrumb}>
                <Link href="/">← Back to Home</Link>
                <span> / Support Hub</span>
            </nav>

            <header className={styles.hero}>
                <div className={styles.heroText}>
                    <h1 className={styles.heroTitle}>How can we help?</h1>
                    <p className={styles.heroSubtitle}>Report bugs, suggest features, or let us know if a simulation isn't working as expected.</p>
                </div>
                <div className={styles.heroDecoration}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                </div>
            </header>

            <div className={styles.grid}>
                
                <div className={styles.ticketWrapper}>
                    {status.message && (
                        <div className={`${styles.statusBanner} ${status.type === 'success' ? styles.success : styles.error}`}>
                            {status.type === 'success' ? '✅' : '❌'} {status.message}
                        </div>
                    )}

                    <form className={styles.premiumForm} onSubmit={handleSubmit}>
                        
                        <div className={styles.formSectionBlock}>
                            <label className={styles.sectionLabel}>What kind of issue is this?</label>
                            <div className={styles.categoryGrid}>
                                
                                <label className={styles.categoryCard}>
                                    <input 
                                        type="radio" 
                                        name="category" 
                                        value="simulation" 
                                        checked={category === 'simulation'}
                                        onChange={() => setCategory('simulation')}
                                    />
                                    <div className={styles.cardContent}>
                                        <span className={styles.catIcon}>⚙️</span>
                                        <span className={styles.catText}>Simulation</span>
                                    </div>
                                </label>

                                <label className={styles.categoryCard}>
                                    <input 
                                        type="radio" 
                                        name="category" 
                                        value="content_error"
                                        checked={category === 'content_error'}
                                        onChange={() => setCategory('content_error')}
                                    />
                                    <div className={styles.cardContent}>
                                        <span className={styles.catIcon}>📝</span>
                                        <span className={styles.catText}>Content/Typo</span>
                                    </div>
                                </label>

                                <label className={styles.categoryCard}>
                                    <input 
                                        type="radio" 
                                        name="category" 
                                        value="ui_issue"
                                        checked={category === 'ui_issue'}
                                        onChange={() => setCategory('ui_issue')}
                                    />
                                    <div className={styles.cardContent}>
                                        <span className={styles.catIcon}>🐛</span>
                                        <span className={styles.catText}>Bug/UI</span>
                                    </div>
                                </label>

                                <label className={styles.categoryCard}>
                                    <input 
                                        type="radio" 
                                        name="category" 
                                        value="feature_request"
                                        checked={category === 'feature_request'}
                                        onChange={() => setCategory('feature_request')}
                                    />
                                    <div className={styles.cardContent}>
                                        <span className={styles.catIcon}>💡</span>
                                        <span className={styles.catText}>Idea</span>
                                    </div>
                                </label>

                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="subject">Subject</label>
                                <input type="text" id="subject" name="subject" placeholder="E.g., Graph not plotting in Exp 4" required suppressHydrationWarning />
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="severity">Severity</label>
                                <div className={styles.selectWrapper}>
                                    <select id="severity" name="severity" required defaultValue="medium" suppressHydrationWarning>
                                        <option value="low">Low (Minor typo)</option>
                                        <option value="medium">Medium (UI glitch)</option>
                                        <option value="high">High (Sim broken)</option>
                                        <option value="critical">Critical (Site down/Data loss)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="context-url">Context URL <span className={styles.optionalTag}>Optional</span></label>
                            <div className={styles.urlInputWrapper}>
                                <span className={styles.urlPrefix}>bhilaeelabs.in/</span>
                                <input type="text" id="context-url" name="contextUrl" placeholder="lab/devices-and-circuits/experiment/4" suppressHydrationWarning />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="message">Detailed Description</label>
                            <textarea id="message" name="message" rows="6" placeholder="What steps led to this issue? What did you expect to happen?" required></textarea>
                        </div>

                        <div className={styles.formFooter}>
                            <button type="submit" className={styles.submitBtn} disabled={isSubmitting} suppressHydrationWarning>
                                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                                {!isSubmitting && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                )}
                            </button>
                        </div>

                    </form>
                </div>

                <aside className={styles.hubSidebar}>
                    
                    <div className={styles.utilityCard}>
                        <h3 className={styles.utilityTitle}>Before you submit</h3>
                        <ul className={styles.checklist}>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Check if the simulator type is correctly set.
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Hard refresh (Ctrl+F5) the page.
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Include the experiment URL if applicable.
                            </li>
                        </ul>
                    </div>

                    <div className={`${styles.utilityCard} ${styles.contactCard}`}>
                        <div className={styles.contactAvatar}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        </div>
                        <div>
                            <h3 className={styles.utilityTitle} style={{ marginBottom: '0.2rem' }}>Direct Email</h3>
                            <a href="mailto:support@bhilaeelabs.in" className={styles.emailLink}>support@bhilaeelabs.in</a>
                        </div>
                    </div>

                    <div className={`${styles.utilityCard} ${styles.githubCard}`}>
                        <h3 className={styles.utilityTitle}>We are Open Source</h3>
                        <p className={styles.utilityDesc}>Want to fix it yourself? Open a pull request or view the source code.</p>
                        <a href="https://github.com/RavikantiAkshay/basic-lab-guide" target="_blank" rel="noopener noreferrer" className={styles.githubBtn}>
                            View Repository ↗
                        </a>
                    </div>

                </aside>

            </div>
        </main>
    );
}
