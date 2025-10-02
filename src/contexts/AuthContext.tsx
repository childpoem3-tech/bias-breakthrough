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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            ensureUserRecord(session.user);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        ensureUserRecord(session.user);
      }
      
      // Also check for guest user in localStorage
      const guestId = localStorage.getItem('guestUserId');
      if (guestId && !session?.user) {
        console.log('Found guest user in localStorage:', guestId);
        setUserId(guestId);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureUserRecord = async (authUser: User) => {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('supabase_user_id', authUser.id)
      .single();

    if (!existingUser) {
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          supabase_user_id: authUser.id,
          email: authUser.email,
          consent_given: false
        })
        .select()
        .single();
      
      if (newUser) {
        setUserId(newUser.id);
      }
    } else {
      setUserId(existingUser.id);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/lobby`
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
        window.location.href = '/lobby';
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
