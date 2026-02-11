import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';

/* ------------------------------------------------------------------ */
/* Context shape                                                      */
/* ------------------------------------------------------------------ */

interface AuthContextValue {
  /** Current Supabase session (null when signed out) */
  session: Session | null;
  /** Convenience shortcut for session.user */
  user: User | null;
  /** The user's profiles-table row (null until fetched) */
  profile: Profile | null;
  /** True while the initial session is being restored */
  loading: boolean;
  /** True when the user's role_preference is 'admin' */
  isAdmin: boolean;
  /** False when the profile row exists but name is still null */
  profileComplete: boolean;
  /** Send a magic-link / OTP to the given email */
  signIn: (email: string) => Promise<void>;
  /** Verify the 6-digit OTP code */
  verifyOtp: (email: string, token: string) => Promise<void>;
  /** Sign out and clear local state */
  signOut: () => Promise<void>;
  /** Re-fetch the profile from Supabase (e.g. after editing) */
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // ------- fetch profile helper -------
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('[AuthProvider] Failed to fetch profile:', error.message);
      setProfile(null);
      return null;
    }

    setProfile(data);
    return data;
  }, []);

  // ------- bootstrap: restore session + listen for changes -------
  useEffect(() => {
    // 1. Restore persisted session
    supabase.auth.getSession().then(({ data: { session: restored } }) => {
      setSession(restored);
      if (restored?.user) {
        fetchProfile(restored.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 2. React to future auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // ------- public API -------

  const signIn = useCallback(async (email: string) => {
    const redirectTo =
      Platform.OS === 'web'
        ? window.location.origin
        : undefined;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
      },
    });
    if (error) throw error;
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    // Read the session directly from Supabase instead of relying on the
    // React state variable, which may hold a stale reference when this
    // callback is invoked right after profile setup.
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const userId = currentSession?.user?.id;

    if (!userId) {
      console.warn('[AuthProvider] refreshProfile called but no active session');
      return;
    }

    console.log('[AuthProvider] refreshProfile: fetching profile for', userId);
    const fetched = await fetchProfile(userId);
    console.log('[AuthProvider] refreshProfile: result =', fetched);
  }, [fetchProfile]);

  // ------- derived state -------
  const user = session?.user ?? null;
  const isAdmin = profile?.role_preference === 'admin';
  const profileComplete = profile !== null && profile.name !== null;

  // Debug: log derived state changes so we can trace navigation decisions
  useEffect(() => {
    console.log('[AuthProvider] state changed:', {
      hasUser: !!user,
      hasProfile: !!profile,
      profileName: profile?.name ?? null,
      profileComplete,
      loading,
    });
  }, [user, profile, profileComplete, loading]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      loading,
      isAdmin,
      profileComplete,
      signIn,
      verifyOtp,
      signOut,
      refreshProfile,
    }),
    [
      session,
      user,
      profile,
      loading,
      isAdmin,
      profileComplete,
      signIn,
      verifyOtp,
      signOut,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ------------------------------------------------------------------ */
/* Hook                                                               */
/* ------------------------------------------------------------------ */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
