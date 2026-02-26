import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userId: string | null;
  sessionId: string | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateConsent: (consent: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const recoverSessionFromHash = async () => {
      const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
      if (!hash.includes('access_token=')) return;

      const hashParams = new URLSearchParams(hash);
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');

      if (!access_token || !refresh_token) return;

      const { error } = await supabase.auth.setSession({ access_token, refresh_token });

      if (error) {
        console.error('OAuth hash session recovery failed:', error);
        toast({
          title: 'Authentication Error',
          description: 'Could not restore your Google session. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Clean sensitive tokens from the URL after session restoration
      window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            ensureUserRecord(session.user);
          }, 0);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        await recoverSessionFromHash();

        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await ensureUserRecord(session.user);
        }

        // Also check for guest user in localStorage
        const guestId = localStorage.getItem('guestUserId');
        if (guestId && !session?.user) {
          console.log('Found guest user in localStorage:', guestId);
          setUserId(guestId);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const ensureUserRecord = async (authUser: User) => {
    try {
      // Use limit(1) instead of .single() to avoid 406 errors when duplicates exist
      const { data: existingUsers, error: lookupError } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_user_id', authUser.id)
        .limit(1);

      if (lookupError) {
        throw lookupError;
      }

      if (existingUsers && existingUsers.length > 0) {
        setUserId(existingUsers[0].id);
        return;
      }

      const { data: newUser, error: upsertError } = await supabase
        .from('users')
        .upsert({
          supabase_user_id: authUser.id,
          email: authUser.email,
          consent_given: false
        }, { onConflict: 'supabase_user_id' })
        .select('id')
        .single();

      if (upsertError) {
        throw upsertError;
      }

      if (newUser) {
        setUserId(newUser.id);
      }
    } catch (error) {
      console.error('Failed to ensure user record:', error);
      toast({
        title: 'Account Setup Error',
        description: 'We could not complete your sign-in. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'openid email profile'
      }
    });
    
    if (error) {
      toast({
        title: 'Authentication Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const signInAsGuest = async () => {
    const anonId = `anon-${crypto.randomUUID()}`;
    
    console.log('Creating guest user with anon_id:', anonId);
    
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        anon_id: anonId,
        consent_given: false
      })
      .select()
      .single();

    if (error) {
      console.error('Guest user creation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create guest account',
        variant: 'destructive'
      });
      return;
    }

    if (newUser) {
      console.log('Guest user created:', newUser.id);
      setUserId(newUser.id);
      localStorage.setItem('guestUserId', newUser.id);
      
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('guestUserId');
    setUserId(null);
    setSessionId(null);
  };

  const updateConsent = async (consent: boolean) => {
    if (!userId) return;

    const { error } = await supabase
      .from('users')
      .update({
        consent_given: consent,
        consent_timestamp: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update consent',
        variant: 'destructive'
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userId,
        sessionId,
        isLoading,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        updateConsent
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
