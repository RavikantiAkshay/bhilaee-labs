'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('AuthContext: onAuthStateChange', event);
      
      if (!mounted) return;

      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        // If we have a user but no profile, or the user changed, fetch profile
        if (!profile || profile.id !== currentUser.id) {
          setLoading(true);
          await fetchProfile(currentUser.id, currentUser);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    // Handle initial session check
    const checkInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (!mounted) return;
      
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        await fetchProfile(initialSession.user.id, initialSession.user);
      }
      setLoading(false);
    };

    checkInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId, user) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // maybeSingle() avoids the single() error when 0 rows

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (!data) {
        console.info('Profile missing, creating on-demand for:', userId);
        // Profile was likely deleted manually but Auth user remains. 
        // Let's recreate it to heal the state.
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: userId, full_name: user?.email?.split('@')[0] || 'User' }])
          .select()
          .maybeSingle();
        
        if (createError) {
          console.error('Failed to auto-create profile:', createError);
        } else {
          setProfile(newProfile);
        }
      } else {
        setProfile(data);
      }
    } catch (e) {
      console.error('Unexpected profile fetch error:', e);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // 1. Tell Supabase to sign out (invalidates token on server)
      await supabase.auth.signOut();
      
      // 2. Aggressively clear local storage as a fallback for production 'sticky' sessions
      if (typeof window !== 'undefined') {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('supabase.auth.token'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      }
    } catch (error) {
      console.error('Error during signOut:', error);
    } finally {
      // 3. Reset local state regardless of success/fail
      setProfile(null);
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
