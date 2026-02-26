import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DecisionLabLogo } from '@/components/DecisionLabLogo';

/**
 * Handles OAuth callback from Supabase/Google.
 * Supports both code-based redirects and hash-token redirects.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Finalizing your sign-in...');

  useEffect(() => {
    let active = true;

    const safeNavigate = (path: string) => {
      if (!active) return;
      navigate(path, { replace: true });
    };

    const handleCallback = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

        const callbackError = searchParams.get('error') || hashParams.get('error');
        if (callbackError) {
          safeNavigate(`/auth?error=${encodeURIComponent(callbackError)}`);
          return;
        }

        const hasCode = searchParams.has('code');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (hasCode) {
          setStatus('Exchanging secure login code...');
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) {
            console.warn('Code exchange failed, trying fallback session recovery:', error.message);
          }
        }

        if (accessToken && refreshToken) {
          setStatus('Restoring your session...');
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            console.warn('Hash session recovery failed:', error.message);
          } else {
            // Remove token hash from URL after successful session set
            window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
          }
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session) {
          safeNavigate('/dashboard');
          return;
        }

        setStatus('Waiting for authentication confirmation...');

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            subscription.unsubscribe();
            safeNavigate('/dashboard');
          }
        });

        setTimeout(() => {
          subscription.unsubscribe();
          safeNavigate('/auth?error=timeout');
        }, 12000);
      } catch (error) {
        console.error('Auth callback error:', error);
        safeNavigate('/auth?error=callback_failed');
      }
    };

    handleCallback();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex flex-col items-center justify-center gap-6">
      <div className="animate-pulse">
        <DecisionLabLogo size="lg" />
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">{status}</p>
      </div>
    </div>
  );
}
