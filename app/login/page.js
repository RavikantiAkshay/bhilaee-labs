'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Login.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) setError(error.message);
        else router.push('/');
        setLoading(false);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: email.split('@')[0], // Default name
                }
            }
        });

        if (error) setError(error.message);
        else setMessage('Check your email for the confirmation link!');
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <Link href="/" className={styles.backLink}>← Back to Home</Link>
                    <h1>Authentication</h1>
                    <p>Login or create an account to sync your lab data.</p>
                </div>

                <form className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="you@email.com"
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}
                    {message && <div className={styles.success}>{message}</div>}

                    <div className={styles.actions}>
                        <button 
                            type="submit" 
                            onClick={handleLogin} 
                            disabled={loading}
                            className={styles.loginBtn}
                        >
                            {loading ? 'Processing...' : 'Log In'}
                        </button>
                        <button 
                            type="button" 
                            onClick={handleSignUp} 
                            disabled={loading}
                            className={styles.signupBtn}
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
